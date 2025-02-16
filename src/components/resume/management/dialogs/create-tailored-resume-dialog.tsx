'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Resume, Profile } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles,ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTailoredResume } from "@/utils/actions/resumes/actions";
import { CreateBaseResumeDialog } from "./create-base-resume-dialog";
import { tailorResumeToJob } from "@/utils/actions/jobs/ai";
import { formatJobListing } from "@/utils/actions/jobs/ai";
import { createJob } from "@/utils/actions/jobs/actions";
import { MiniResumePreview } from "../../shared/mini-resume-preview";
import { LoadingOverlay, type CreationStep } from "../loading-overlay";
import { BaseResumeSelector } from "../base-resume-selector"; 
import { ImportMethodRadioGroup } from "../import-method-radio-group";
import { JobDescriptionInput } from "../job-description-input";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

interface CreateTailoredResumeDialogProps {
  children: React.ReactNode;
  baseResumes?: Resume[];
  profile?: Profile;
}

export function CreateTailoredResumeDialog({ children, baseResumes, profile }: CreateTailoredResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>(baseResumes?.[0]?.id || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreationStep>('analyzing');
  const [importOption, setImportOption] = useState<'import-profile' | 'ai'>('ai');
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });
  const router = useRouter();
  

  const handleCreate = async () => {
    // Validate required fields
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Error",
        description: "Please select a base resume",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim() && importOption === 'ai') {
      setIsJobDescriptionInvalid(true);
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      setCurrentStep('analyzing');
      
      // Reset validation states
      setIsBaseResumeInvalid(false);
      setIsJobDescriptionInvalid(false);

      if (importOption === 'import-profile') {
        // Direct copy logic
        const baseResume = baseResumes?.find(r => r.id === selectedBaseResume);
        if (!baseResume) throw new Error("Base resume not found");

        let jobId: string | null = null;
        let jobTitle = 'Copied Resume';
        let companyName = '';

        if (jobDescription.trim()) {
          // Get model and API key from local storage
          const MODEL_STORAGE_KEY = 'resumelm-default-model';
          const LOCAL_STORAGE_KEY = 'resumelm-api-keys';

          const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
          const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
          let apiKeys = [];

          try {
            apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
          } catch (error) {
            console.error('Error parsing API keys:', error);
          }

          try {
            setCurrentStep('analyzing');
            const formattedJobListing = await formatJobListing(jobDescription, {
              model: selectedModel || '',
              apiKeys
            });

            setCurrentStep('formatting');
            const jobEntry = await createJob(formattedJobListing);
            if (!jobEntry?.id) throw new Error("Failed to create job entry");
            
            jobId = jobEntry.id;
            jobTitle = formattedJobListing.position_title || 'Copied Resume';
            companyName = formattedJobListing.company_name || '';
          } catch (error: Error | unknown) {
            if (error instanceof Error && (
                error.message.toLowerCase().includes('api key') || 
                error.message.toLowerCase().includes('unauthorized') ||
                error.message.toLowerCase().includes('invalid key'))
            ) {
              setErrorMessage({
                title: "API Key Error",
                description: "There was an issue with your API key. Please check your settings and try again."
              });
            } else {
              setErrorMessage({
                title: "Error",
                description: "Failed to process job description. Please try again."
              });
            }
            setShowErrorDialog(true);
            setIsCreating(false);
            return;
          }
        }

        const resume = await createTailoredResume(
          baseResume,
          jobId,
          jobTitle,
          companyName,
          {
            work_experience: baseResume.work_experience,
            education: baseResume.education.map(edu => ({
              ...edu,
              gpa: edu.gpa?.toString()
            })),
            skills: baseResume.skills,
            projects: baseResume.projects,
            target_role: baseResume.target_role
          }
        );

        toast({
          title: "Success",
          description: "Resume created successfully",
        });

        router.push(`/resumes/${resume.id}`);
        setOpen(false);
        return;
      }

      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'resumelm-default-model';
      const LOCAL_STORAGE_KEY = 'resumelm-api-keys';

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }
      // 1. Format the job listing
      let formattedJobListing;
      try {
        formattedJobListing = await formatJobListing(jobDescription, {
          model: selectedModel || '',
          apiKeys
        });
      } catch (error: Error | unknown) {
        if (error instanceof Error && (
            error.message.toLowerCase().includes('api key') || 
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('invalid key'))
        ) {
          setErrorMessage({
            title: "API Key Error",
            description: "There was an issue with your API key. Please check your settings and try again."
          });
        } else {
          setErrorMessage({
            title: "Error",
            description: "Failed to analyze job description. Please try again."
          });
        }
        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }

      setCurrentStep('formatting');

      // 2. Create job in database and get ID
      const jobEntry = await createJob(formattedJobListing);
      if (!jobEntry?.id) throw new Error("Failed to create job entry");


      // 3. Get the base resume object
      const baseResume = baseResumes?.find(r => r.id === selectedBaseResume);
      if (!baseResume) throw new Error("Base resume not found");

      setCurrentStep('tailoring');

      // 4. Tailor the resume using the formatted job listing
      let tailoredContent;

      try {
        tailoredContent = await tailorResumeToJob(baseResume, formattedJobListing, {
          model: selectedModel || '',
          apiKeys
        });
      } catch (error: Error | unknown) {
        if (error instanceof Error && (
            error.message.toLowerCase().includes('api key') || 
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('invalid key'))
        ) {
          setErrorMessage({
            title: "API Key Error",
            description: "There was an issue with your API key. Please check your settings and try again."
          });
        } else {
          setErrorMessage({
            title: "Error",
            description: "Failed to tailor resume. Please try again."
          });
        }
        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }


      setCurrentStep('finalizing');

      
      // 5. Create the tailored resume with job reference
      const resume = await createTailoredResume(
        baseResume,
        jobEntry.id,
        formattedJobListing.position_title || '',
        formattedJobListing.company_name || '',
        tailoredContent,
      );

      toast({
        title: "Success",
        description: "Resume created successfully",
      });

      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error: unknown) {
      console.error('Failed to create resume:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setJobDescription('');
      setImportOption('ai');
      setSelectedBaseResume(baseResumes?.[0]?.id || '');
    }
  };

  if (!baseResumes || baseResumes.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className={cn(
          "sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto",
          "bg-gradient-to-b backdrop-blur-2xl border-white/40 shadow-2xl",
          "from-pink-50/95 to-rose-50/90 border-pink-200/40",
          "rounded-xl"
        )}>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
              <Sparkles className="w-8 h-8 text-pink-600" />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h3 className="font-semibold text-base text-pink-950">No Base Resumes Found</h3>
              <p className="text-xs text-muted-foreground">
                You need to create a base resume first before you can create a tailored version.
              </p>
            </div>
            {profile ? (
              <CreateBaseResumeDialog profile={profile}>
                <Button
                  className={cn(
                    "mt-2 text-white shadow-lg hover:shadow-xl transition-all duration-500",
                    "bg-gradient-to-r from-purple-600 to-indigo-600",
                    "hover:from-purple-700 hover:to-indigo-700"
                  )}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Base Resume
                </Button>
              </CreateBaseResumeDialog>
            ) : (
              <Button disabled className="mt-2">
                No profile available to create base resume
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className={cn(
          "sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto",
          "bg-gradient-to-b backdrop-blur-2xl border-white/40 shadow-2xl",
          "from-pink-50/95 to-rose-50/90 border-pink-200/40",
          "rounded-xl"
        )}>
          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
              20%, 40%, 60%, 80% { transform: translateX(2px); }
            }
            .shake {
              animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
            }
          `}</style>
          {/* Header Section with Icon */}
          <div className={cn(
            "relative px-8 pt-6 pb-4 border-b top-0 z-10 bg-white/50 backdrop-blur-xl",
            "border-pink-200/20"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-all duration-300",
                "bg-gradient-to-br from-pink-100/80 to-rose-100/80 border border-pink-200/60"
              )}>
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-pink-950">
                  Create Tailored Resume
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Create a tailored resume based on an existing base resume
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-6 space-y-6 bg-gradient-to-b from-pink-50/30 to-rose-50/30 relative">
            {isCreating && <LoadingOverlay currentStep={currentStep} />}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="base-resume"
                  className="text-base font-medium text-pink-950"
                >
                  Select Base Resume <span className="text-red-500">*</span>
                </Label>

                {/* Base Resume Selector */}
                <BaseResumeSelector
                  baseResumes={baseResumes}
                  selectedResumeId={selectedBaseResume}
                  onResumeSelect={setSelectedBaseResume}
                  isInvalid={isBaseResumeInvalid}
                />
              </div>

              {/* Resume Selection Visualization */}
              <div className="flex items-center justify-center gap-4">
                {selectedBaseResume && baseResumes ? (
                  <>
                    <MiniResumePreview
                      name={baseResumes.find(r => r.id === selectedBaseResume)?.name || ''}
                      type="base"
                      className="w-24 hover:-translate-y-1 transition-transform duration-300"
                    />
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="w-6 h-6 text-pink-600 animate-pulse" />
                      <span className="text-xs font-medium text-muted-foreground">Tailored For Job</span>
                    </div>
                    <MiniResumePreview
                      name="Tailored Resume"
                      type="tailored"
                      className="w-24 hover:-translate-y-1 transition-transform duration-300"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-pink-100">
                    <div className="text-sm font-medium text-muted-foreground">
                      Select a base resume to see preview
                    </div>
                  </div>
                )}
              </div>

              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                isInvalid={isJobDescriptionInvalid}
              />

              <ImportMethodRadioGroup
                value={importOption}
                onChange={setImportOption}
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className={cn(
            "px-8 py-4 border-t sticky bottom-0 z-10 bg-white/50 backdrop-blur-xl",
            "border-pink-200/20 bg-white/40"
          )}>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className={cn(
                  "border-gray-200 text-gray-600",
                  "hover:bg-white/60",
                  "hover:border-pink-200"
                )}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={isCreating}
                className={cn(
                  "text-white shadow-lg hover:shadow-xl transition-all duration-500",
                  "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                )}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Resume'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Alert Dialog */}
      <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = '/subscription';
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = '/settings';
        }}
      />

    </>
  );
} 