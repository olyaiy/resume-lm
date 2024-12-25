'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBaseResume, createTailoredResume } from "@/utils/supabase/actions";
import { Resume } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Sparkles, Brain, Wand2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateResumeDialogProps {
  children: React.ReactNode;
  type: 'base' | 'tailored';
  baseResumes?: Resume[];
}

export function CreateResumeDialog({ children, type, baseResumes }: CreateResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [importOption, setImportOption] = useState<'import-all' | 'ai' | 'scratch'>('ai');
  const router = useRouter();

  const handleCreate = async () => {
    if (type === 'base' && !targetRole.trim()) {
      toast({
        title: "Error",
        description: "Please enter a target role",
        variant: "destructive",
      });
      return;
    }

    if (type === 'tailored' && !selectedBaseResume) {
      toast({
        title: "Error",
        description: "Please select a base resume",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      let resume: Resume;

      if (type === 'base') {
        resume = await createBaseResume(targetRole);
      } else {
        resume = await createTailoredResume(selectedBaseResume, '', targetRole);
      }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-2xl border-white/40 shadow-2xl">
        {/* Header Section with Icon */}
        <div className="relative px-10 pt-10 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className={cn(
              "p-4 rounded-2xl transition-all duration-300",
              type === 'base' 
                ? "bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                : "bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100"
            )}>
              {type === 'base' 
                ? <FileText className="w-8 h-8 text-purple-600" />
                : <Sparkles className="w-8 h-8 text-pink-600" />
              }
            </div>
            <div>
              <DialogTitle className={cn(
                "text-2xl font-semibold",
                type === 'base'
                  ? "text-purple-950"
                  : "text-pink-950"
              )}>
                Create {type === 'base' ? 'Base' : 'Tailored'} Resume
              </DialogTitle>
              <DialogDescription className="mt-2 text-base text-muted-foreground">
                {type === 'base' 
                  ? "Create a new base resume template that you can use for multiple job applications"
                  : "Create a tailored resume based on an existing base resume"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-10 py-8 space-y-10">
          <div className="space-y-8">
            {type === 'base' ? (
              <>
                <div className="space-y-3">
                  <Label 
                    htmlFor="target-role"
                    className={cn(
                      "text-lg font-medium",
                      type === 'base' ? "text-purple-950" : "text-pink-950"
                    )}
                  >
                    Target Role
                  </Label>
                  <Input
                    id="target-role"
                    placeholder="e.g., Senior Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-white/80 border-gray-200 h-12 text-base focus:border-purple-500 focus:ring-purple-500/20 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-5">
                  <Label className={cn(
                    "text-lg font-medium",
                    type === 'base' ? "text-purple-950" : "text-pink-950"
                  )}>
                    Resume Content
                  </Label>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="h-full">
                      <input
                        type="radio"
                        id="import-all"
                        name="importOption"
                        value="import-all"
                        checked={importOption === 'import-all'}
                        onChange={(e) => setImportOption(e.target.value as 'import-all' | 'ai' | 'scratch')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="import-all"
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl p-6 h-[240px]",
                          "bg-white border-2 shadow-sm",
                          "hover:border-purple-200 hover:bg-purple-50/50",
                          "transition-all duration-300 cursor-pointer",
                          "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                          "peer-checked:shadow-md peer-checked:shadow-purple-100"
                        )}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center mb-5">
                            <Copy className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="font-semibold text-lg text-purple-950 mb-3">Import All</div>
                          <span className="text-sm leading-relaxed text-gray-600">
                            Import your entire profile, including all work experience, skills, and projects
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="h-full">
                      <input
                        type="radio"
                        id="ai"
                        name="importOption"
                        value="ai"
                        checked={importOption === 'ai'}
                        onChange={(e) => setImportOption(e.target.value as 'import-all' | 'ai' | 'scratch')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="ai"
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl p-6 h-[240px]",
                          "bg-white border-2 shadow-sm",
                          "hover:border-purple-200 hover:bg-purple-50/50",
                          "transition-all duration-300 cursor-pointer",
                          "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                          "peer-checked:shadow-md peer-checked:shadow-purple-100"
                        )}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center mb-5">
                            <Brain className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="font-semibold text-lg text-purple-950 mb-3">AI Import</div>
                          <span className="text-sm leading-relaxed text-gray-600">
                            Let AI select and import the most relevant experience and skills from your profile
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="h-full">
                      <input
                        type="radio"
                        id="scratch"
                        name="importOption"
                        value="scratch"
                        checked={importOption === 'scratch'}
                        onChange={(e) => setImportOption(e.target.value as 'import-all' | 'ai' | 'scratch')}
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor="scratch"
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl p-6 h-[240px]",
                          "bg-white border-2 shadow-sm",
                          "hover:border-purple-200 hover:bg-purple-50/50",
                          "transition-all duration-300 cursor-pointer",
                          "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                          "peer-checked:shadow-md peer-checked:shadow-purple-100"
                        )}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center mb-5">
                            <Wand2 className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="font-semibold text-lg text-purple-950 mb-3">Start Fresh</div>
                          <span className="text-sm leading-relaxed text-gray-600">
                            Start with a blank resume and manually add your experience and skills
                          </span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Label 
                  htmlFor="base-resume"
                  className="text-lg font-medium text-pink-950"
                >
                  Select Base Resume
                </Label>
                <Select value={selectedBaseResume} onValueChange={setSelectedBaseResume}>
                  <SelectTrigger 
                    id="base-resume" 
                    className="bg-white/80 border-gray-200 h-12 text-base focus:border-pink-500 focus:ring-pink-500/20"
                  >
                    <SelectValue placeholder="Select a base resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {baseResumes?.map((resume) => (
                      <SelectItem 
                        key={resume.id} 
                        value={resume.id}
                        className="focus:bg-pink-50"
                      >
                        {resume.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-10 py-6 border-t border-gray-100 bg-gray-50/80">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-200 hover:bg-white/60 text-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className={cn(
                "text-white shadow-lg hover:shadow-xl transition-all duration-500",
                type === 'base'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
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