'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBaseResume, createTailoredResume } from "@/utils/supabase/actions";
import { Resume } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Create {type === 'base' ? 'Base' : 'Tailored'} Resume
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Resume Name</Label>
            <Input
              id="name"
              placeholder="Enter resume name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/50 border-white/40 focus:border-teal-500"
            />
          </div>

          {type === 'tailored' && baseResumes && baseResumes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="base-resume">Select Base Resume</Label>
              <Select value={selectedBaseResume} onValueChange={setSelectedBaseResume}>
                <SelectTrigger id="base-resume" className="bg-white/50 border-white/40 focus:border-teal-500">
                  <SelectValue placeholder="Select a base resume" />
                </SelectTrigger>
                <SelectContent>
                  {baseResumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isCreating}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
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
      </DialogContent>
    </Dialog>
  );
} 