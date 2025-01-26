import { Resume, Job } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { generate } from "@/components/cover-letter/ai";
import type { AIConfig } from "@/utils/ai-tools";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import Tiptap from "@/components/ui/tiptap";

interface CoverLetterPanelProps {
  resume: Resume;
  job: Job | null;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  aiConfig?: AIConfig;
}

export function CoverLetterPanel({
  resume,
  job,
  onResumeChange,
  aiConfig,
}: CoverLetterPanelProps) {
  const [generation, setGeneration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });

  const generateCoverLetter = async () => {
    if (!job) return;
    
    setIsGenerating(true);
    setGeneration('');
    
    try {
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

      const prompt = `Write a professional cover letter for the following job:
      ${JSON.stringify(job)}
      
      Using my resume information:
      ${JSON.stringify(resume)}
      
      The cover letter should be formal, professional, and highlight relevant experience and skills.
      ${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ''}`;
      
      const { output } = await generate(prompt, {
        ...aiConfig,
        model: selectedModel || '',
        apiKeys
      });

      for await (const delta of readStreamableValue(output)) {
        setGeneration(current => `${current}${delta}`);
      }
    } catch (error: Error | unknown) {
      if (error instanceof Error && (
          error.message.toLowerCase().includes('api key') || 
          error.message.toLowerCase().includes('unauthorized') ||
          error.message.toLowerCase().includes('invalid key') ||
          error.message.toLowerCase().includes('invalid x-api-key'))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description: "There was an issue with your API key. Please check your settings and try again."
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to generate cover letter. Please try again."
        });
      }
      setShowErrorDialog(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <AccordionItem value="cover-letter" className={cn(
        "mb-4 backdrop-blur-xl rounded-lg shadow-lg bg-white border border-emerald-600/50 border-2"
      )}>
        <AccordionTrigger className="px-4 py-2 hover:no-underline group">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-100/80 transition-transform duration-300 group-data-[state=open]:scale-105">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-900">Cover Letter</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pt-2 pb-4">
          {resume.has_cover_letter ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <p className="text-sm text-emerald-700">Cover letter has been created for this resume.</p>
              </div>

              {/* Delete Cover Letter */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onResumeChange('has_cover_letter', false)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Cover Letter
              </Button>

              {/* Write with AI */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className={cn(
                        "w-full",
                        "bg-emerald-600 hover:bg-emerald-700",
                        "text-white",
                        "border border-emerald-200/60",
                        "shadow-sm",
                        "transition-all duration-300",
                        "hover:scale-[1.02] hover:shadow-md",
                        "hover:-translate-y-0.5"
                      )}
                      onClick={generateCoverLetter}
                      disabled={isGenerating || !job}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    sideOffset={2}
                    className={cn(
                      "w-72 p-3.5",
                      "bg-emerald-50",
                      "border-2 border-emerald-300",
                      "shadow-lg shadow-emerald-100/50",
                      "rounded-lg"
                    )}
                  >
                    <AIImprovementPrompt
                      value={customPrompt}
                      onChange={setCustomPrompt}
                      onSubmit={generateCoverLetter}
                      isLoading={isGenerating}
                      placeholder="e.g., Focus on leadership experience and technical skills"
                    />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {generation && (
                <div className={cn(
                  "relative group/suggestions",
                  "p-4",
                  "rounded-xl",
                  "bg-gradient-to-br from-emerald-50/95 via-emerald-50/90 to-green-50/95",
                  "border border-emerald-200/60",
                  "shadow-lg shadow-emerald-500/5",
                  "transition-all duration-500",
                  "hover:shadow-xl hover:shadow-emerald-500/10",
                  "overflow-hidden"
                )}>
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
                  
                  {/* Floating Gradient Orbs */}
                  <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-emerald-200/20 to-green-200/20 blur-3xl animate-float opacity-70" />
                  <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-green-200/20 to-emerald-200/20 blur-3xl animate-float-delayed opacity-70" />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-emerald-600">AI Generated Cover Letter</span>
                    </div>
                    
                    <Tiptap
                      content={generation}
                      onChange={() => {}}
                      readOnly={true}
                      className={cn(
                        "min-h-[200px] text-sm",
                        "bg-white/60",
                        "border-emerald-200/60",
                        "text-emerald-900",
                        "focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-500/10",
                        "placeholder:text-emerald-400",
                        "transition-all duration-300",
                        "hover:bg-white/80"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                <p className="text-sm text-muted-foreground">No cover letter has been created for this resume yet.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-50"
                onClick={() => onResumeChange('has_cover_letter', true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Cover Letter
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-red-200/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {errorMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {errorMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowErrorDialog(false)}
              className={cn(
                "bg-gradient-to-r from-red-600 to-rose-600",
                "hover:from-red-700 hover:to-rose-700",
                "text-white shadow-lg hover:shadow-xl transition-all duration-500"
              )}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 