'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Resume, Profile } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles,ArrowRight, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [importOption, setImportOption] = useState<'import-profile' | 'ai'>('ai');
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });
  const router = useRouter();
  

  const handleNext = () => {
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Required Field Missing",
        description: "Please select a base resume to continue.",
        variant: "destructive",
      });
      return;
    }
    setDialogStep(2);
  };

  const handleBack = () => {
    setDialogStep(1);
  };

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
      setDialogStep(1);
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
        <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-lg rounded-lg">
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="p-3 rounded-lg bg-pink-50 border border-pink-100">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h3 className="font-semibold text-lg text-gray-900">No Base Resumes Found</h3>
              <p className="text-sm text-gray-600">
                You need to create a base resume first before you can create a tailored version.
              </p>
            </div>
            {profile ? (
              <CreateBaseResumeDialog profile={profile}>
                <Button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white">
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
        <DialogContent className="sm:max-w-[700px] p-0 max-h-[85vh] overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-lg">
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
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-50 border border-pink-100">
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Create Tailored Resume
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {dialogStep === 1 
                    ? "Choose a base resume to start with"
                    : "Configure job details and tailoring method"
                  }
                </DialogDescription>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  dialogStep >= 1 ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  1
                </div>
                <div className={cn(
                  "w-4 h-0.5",
                  dialogStep >= 2 ? "bg-pink-600" : "bg-gray-200"
                )} />
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  dialogStep >= 2 ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  2
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 min-h-[300px] relative">
            {isCreating && <LoadingOverlay currentStep={currentStep} />}
            
            {dialogStep === 1 && (
              <div className="space-y-6">
                                 <div className="text-center space-y-2">
                   <h3 className="text-xl font-semibold text-gray-900">Select Your Base Resume</h3>
                   <p className="text-gray-600">Choose which resume you&apos;d like to tailor for this job</p>
                 </div>
                
                <div className="space-y-4">
                  <BaseResumeSelector
                    baseResumes={baseResumes}
                    selectedResumeId={selectedBaseResume}
                    onResumeSelect={setSelectedBaseResume}
                    isInvalid={isBaseResumeInvalid}
                  />
                </div>
                
                                 {/* Resume Flow Visualization */}
                 <div className="flex items-center justify-center gap-4 py-6">
                   {selectedBaseResume ? (
                     <>
                       <MiniResumePreview
                         name={baseResumes.find(r => r.id === selectedBaseResume)?.name || ''}
                         type="base"
                         className="w-20 hover:-translate-y-1 transition-transform duration-300"
                       />
                       <div className="flex flex-col items-center gap-1">
                         <ArrowRight className="w-5 h-5 text-pink-600 animate-pulse" />
                         <span className="text-xs font-medium text-gray-500">Will Become</span>
                       </div>
                       <MiniResumePreview
                         name="Tailored Resume"
                         type="tailored"
                         className="w-20 hover:-translate-y-1 transition-transform duration-300"
                       />
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-200">
                       <div className="text-sm font-medium text-gray-500">
                         Select a base resume to see preview
                       </div>
                     </div>
                   )}
                 </div>

                 {selectedBaseResume && (
                   <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                     <div className="text-sm text-pink-800">
                       <span className="font-medium">Selected:</span> {baseResumes.find(r => r.id === selectedBaseResume)?.name}
                     </div>
                     <div className="text-xs text-pink-600 mt-1">
                       This resume will be used as the foundation for your tailored version
                     </div>
                   </div>
                 )}
              </div>
            )}

            {dialogStep === 2 && (
              <div className="space-y-5">
                {/* Show selected base resume */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <div className="text-sm text-pink-800">
                    <span className="font-medium">Base Resume:</span> {baseResumes.find(r => r.id === selectedBaseResume)?.name}
                  </div>
                </div>

                

                {/* Job Description Input */}
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  isInvalid={isJobDescriptionInvalid}
                />

                {/* Import Method Selection */}
                <ImportMethodRadioGroup
                  value={importOption}
                  onChange={setImportOption}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between">
              <div>
                {dialogStep === 2 && (
                  <Button variant="outline" onClick={handleBack} size="sm">
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} size="sm">
                  Cancel
                </Button>
                {dialogStep === 1 && (
                  <Button onClick={handleNext} size="sm" className="bg-pink-600 hover:bg-pink-700">
                    Next
                  </Button>
                )}
                {dialogStep === 2 && (
                  <Button 
                    onClick={handleCreate} 
                    disabled={isCreating}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700 text-white"
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
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
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