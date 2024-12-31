'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Resume } from "@/lib/types";
import { addTextToResume } from "@/utils/ai";
import { toast } from "@/hooks/use-toast";

interface TextImportDialogProps {
  resume: Resume;
  onResumeChange: <K extends keyof Resume>(field: K, value: Resume[K]) => void;
  trigger?: React.ReactNode;
}

export function TextImportDialog({ resume, onResumeChange, trigger }: TextImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter some text to import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updatedResume = await addTextToResume(content, resume);
      
      // Update each field of the resume
      Object.keys(updatedResume).forEach((key) => {
        onResumeChange(key as keyof Resume, updatedResume[key as keyof Resume]);
      });

      toast({
        title: "Import successful",
        description: "Your resume has been updated with the imported content.",
      });
      setOpen(false);
      setContent("");
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to process the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            Import Text
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Import Text Content
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-base text-muted-foreground/80">
              <span className="block">
                Paste any text content below (resume, job description, achievements, etc.).
                Our AI will analyze it and enhance your resume by adding relevant information.
              </span>
              <span className="block text-sm">
                Your existing resume information will be preserved and enhanced with the new content.
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text content here..."
            className="min-h-[300px] bg-white/50 border-white/40 focus:border-violet-500/40 focus:ring-violet-500/20 transition-all duration-300"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isProcessing || !content.trim()}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 