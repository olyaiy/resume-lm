'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resume, Profile } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Brain, Copy, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBaseResume, createTailoredResume } from "@/utils/actions";
import { CreateBaseResumeDialog } from "./create-base-resume-dialog";
import { MiniResumePreview } from "./shared/mini-resume-preview";
import { tailorResumeToJob } from "@/utils/ai";
import { formatJobListing } from "@/utils/ai";
import { createJob } from "@/utils/actions";

interface CreateTailoredResumeDialogProps {
  children: React.ReactNode;
  baseResumes?: Resume[];
  profile: Profile;
}

export function CreateTailoredResumeDialog({ children, baseResumes, profile }: CreateTailoredResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>(baseResumes?.[0]?.id || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importOption, setImportOption] = useState<'import-profile' | 'ai'>('ai');
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      
      // 1. Format the job listing
      const formattedJobListing = await formatJobListing(jobDescription);
      console.log('1. Formatted Job Listing:', formattedJobListing);

      // 2. Create job in database and get ID
      const jobEntry = await createJob(formattedJobListing);
      if (!jobEntry?.id) throw new Error("Failed to create job entry");
      console.log('2. Created Job Entry:', jobEntry);

      // 3. Get the base resume object
      const baseResume = baseResumes?.find(r => r.id === selectedBaseResume);
      if (!baseResume) throw new Error("Base resume not found");
      console.log('3. Selected Base Resume:', baseResume);

      // 4. Tailor the resume using the formatted job listing
      const tailoredContent = await tailorResumeToJob(baseResume, formattedJobListing);
      console.log('4. Tailored Content:', tailoredContent);
      
      // 5. Create the tailored resume with job reference
      const resume = await createTailoredResume(
        baseResume,
        jobEntry.id,
        profile.id,
        tailoredContent
      );
      console.log('5. Created Tailored Resume:', resume);

      toast({
        title: "Success",
        description: "Resume created successfully",
      });

      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume",
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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
          "relative px-8 pt-6 pb-4 border-b sticky top-0 z-10 bg-white/50 backdrop-blur-xl",
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
        <div className="px-8 py-6 space-y-6 bg-gradient-to-b from-pink-50/30 to-rose-50/30">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="base-resume"
                className="text-base font-medium text-pink-950"
              >
                Select Base Resume <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={selectedBaseResume} 
                onValueChange={setSelectedBaseResume}
              >
                <SelectTrigger 
                  id="base-resume" 
                  className={cn(
                    "bg-white/80 border-gray-200 h-10 text-sm focus:border-pink-500 focus:ring-pink-500/20",
                    isBaseResumeInvalid && "border-red-500 shake"
                  )}
                >
                  <SelectValue placeholder="Select a base resume" />
                </SelectTrigger>
                <SelectContent>
                  {baseResumes?.map((resume) => (
                    <SelectItem 
                      key={resume.id} 
                      value={resume.id}
                      className="focus:bg-pink-50 text-sm"
                    >
                      {resume.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-3">
              <Label 
                htmlFor="job-description"
                className="text-base font-medium text-pink-950"
              >
                Job Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="job-description"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className={cn(
                  "w-full min-h-[120px] rounded-md bg-white/80 border-gray-200 text-base",
                  "focus:border-pink-500 focus:ring-pink-500/20 placeholder:text-gray-400",
                  "resize-y p-4",
                  isJobDescriptionInvalid && "border-red-500 shake"
                )}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-full">
                <input
                  type="radio"
                  id="ai-tailor"
                  name="tailorOption"
                  value="ai"
                  checked={importOption === 'ai'}
                  onChange={(e) => setImportOption('ai')}
                  className="sr-only peer"
                />
                <Label
                  htmlFor="ai-tailor"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-4",
                    "bg-white/80 border-2 shadow-sm h-full",
                    "hover:border-pink-200 hover:bg-pink-50/50",
                    "transition-all duration-300 cursor-pointer",
                    "peer-checked:border-pink-500 peer-checked:bg-pink-50",
                    "peer-checked:shadow-md peer-checked:shadow-pink-100"
                  )}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-center mb-3">
                      <Brain className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="font-semibold text-sm text-pink-950 mb-1.5">Tailor with AI</div>
                    <span className="text-xs leading-relaxed text-gray-600">
                      Let AI analyze the job description and optimize your resume for the best match
                    </span>
                  </div>
                </Label>
              </div>

              <div className="h-full">
                <input
                  type="radio"
                  id="manual-tailor"
                  name="tailorOption"
                  value="import-profile"
                  checked={importOption === 'import-profile'}
                  onChange={(e) => setImportOption('import-profile')}
                  className="sr-only peer"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setImportOption('import-profile')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setImportOption('import-profile');
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-4",
                    "bg-white/80 border-2 shadow-sm h-full",
                    "hover:border-pink-200 hover:bg-pink-50/50",
                    "transition-all duration-300 cursor-pointer",
                    "peer-checked:border-pink-500 peer-checked:bg-pink-50",
                    "peer-checked:shadow-md peer-checked:shadow-pink-100",
                    "focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  )}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-center mb-3">
                      <Copy className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="font-semibold text-sm text-pink-950 mb-1.5">Copy Base Resume</div>
                    <span className="text-xs leading-relaxed text-gray-600">
                      Create an exact copy of your base resume and make your own modifications
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
  );
} 