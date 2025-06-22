'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Resume, Profile } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowRight, Plus, FileText } from "lucide-react";
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
        <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-lg">
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
          <div className="px-6 py-8 min-h-[400px] relative">
            {isCreating && <LoadingOverlay currentStep={currentStep} />}
            
            {dialogStep === 1 && (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-2">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Choose Your Foundation</h3>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                    Select the base resume that best represents your experience. We&apos;ll transform it into a perfectly tailored version for your target job.
                  </p>
                </div>
                
                {/* Resume Selector */}
                <div className="space-y-4">
                  <BaseResumeSelector
                    baseResumes={baseResumes}
                    selectedResumeId={selectedBaseResume}
                    onResumeSelect={setSelectedBaseResume}
                    isInvalid={isBaseResumeInvalid}
                  />
                </div>
                
                {/* Enhanced Flow Visualization */}
                {selectedBaseResume ? (
                  <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-pink-100">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Transformation Preview</h4>
                      <p className="text-sm text-gray-600">Here&apos;s how your resume will evolve</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6">
                      {/* Before */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <MiniResumePreview
                            name={baseResumes.find(r => r.id === selectedBaseResume)?.name || ''}
                            type="base"
                            className="w-24 hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              Original
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow with animation */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <ArrowRight className="w-8 h-8 text-pink-500" />
                          <div className="absolute inset-0 w-8 h-8 text-pink-300 animate-ping">
                            <ArrowRight className="w-8 h-8" />
                          </div>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-pink-200">
                          <span className="text-xs font-medium text-pink-700">AI Tailoring</span>
                        </div>
                      </div>

                      {/* After */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <MiniResumePreview
                            name="Tailored Resume"
                            type="tailored"
                            className="w-24 hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                              Optimized
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-pink-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-xs text-gray-600">Keywords Optimized</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-purple-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-xs text-gray-600">Skills Highlighted</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-pink-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-xs text-gray-600">Experience Focused</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Ready to Transform</h4>
                        <p className="text-sm text-gray-600">
                          Select a base resume above to see the transformation preview
                        </p>
                      </div>
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