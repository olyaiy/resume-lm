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
import { Loader2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateResumeDialogProps {
  children: React.ReactNode;
  type: 'base' | 'tailored';
  baseResumes?: Resume[];
}

export function CreateResumeDialog({ children, type, baseResumes }: CreateResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your resume",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      let resume: Resume;

      if (type === 'base') {
        resume = await createBaseResume(name);
      } else {
        if (!selectedBaseResume) {
          toast({
            title: "Error",
            description: "Please select a base resume",
            variant: "destructive",
          });
          return;
        }
        // For now, we'll pass an empty string as jobId since we haven't implemented job selection yet
        resume = await createTailoredResume(selectedBaseResume, '', name);
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
      <DialogContent className="sm:max-w-[500px] p-0 bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        {/* Header Section with Icon */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/40">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              type === 'base' 
                ? "bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border-purple-600/10"
                : "bg-gradient-to-br from-pink-600/10 to-rose-600/10 border-pink-600/10"
            )}>
              {type === 'base' 
                ? <FileText className="w-6 h-6 text-purple-600" />
                : <Sparkles className="w-6 h-6 text-pink-600" />
              }
            </div>
            <div>
              <DialogTitle className={cn(
                "text-xl font-semibold bg-clip-text text-transparent",
                type === 'base'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "bg-gradient-to-r from-pink-600 to-rose-600"
              )}>
                Create {type === 'base' ? 'Base' : 'Tailored'} Resume
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {type === 'base' 
                  ? "Create a new base resume template that you can use for multiple job applications"
                  : "Create a tailored resume based on an existing base resume"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="name"
                className={cn(
                  type === 'base' ? "text-purple-700" : "text-pink-700"
                )}
              >
                Resume Name
              </Label>
              <Input
                id="name"
                placeholder="Enter resume name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "bg-white/50 border-white/40 h-11",
                  type === 'base'
                    ? "focus:border-purple-500 focus:ring-purple-500/20"
                    : "focus:border-pink-500 focus:ring-pink-500/20"
                )}
              />
            </div>

            {type === 'tailored' && baseResumes && baseResumes.length > 0 && (
              <div className="space-y-2">
                <Label 
                  htmlFor="base-resume"
                  className="text-pink-700"
                >
                  Select Base Resume
                </Label>
                <Select value={selectedBaseResume} onValueChange={setSelectedBaseResume}>
                  <SelectTrigger 
                    id="base-resume" 
                    className="bg-white/50 border-white/40 h-11 focus:border-pink-500 focus:ring-pink-500/20"
                  >
                    <SelectValue placeholder="Select a base resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {baseResumes.map((resume) => (
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
        <div className="px-8 py-6 border-t border-white/40 bg-white/40">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-white/40 hover:bg-white/60"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className={cn(
                "text-white transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                type === 'base'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/20"
                  : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 hover:shadow-pink-500/20"
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