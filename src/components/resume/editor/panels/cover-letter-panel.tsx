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
      Today's date is ${new Date().toLocaleDateString()}.

      CRITICAL FORMATTING REQUIREMENTS - YOU MUST FOLLOW THESE EXACTLY:
      1. Do NOT use any square brackets [] in the output
      2. Only include information that is available in the job or resume data
      3. Each piece of information MUST be on its own separate line using <br /> tags
      4. Use actual values directly, not placeholders
      5. Format the header EXACTLY like this (but without the brackets, using real data):
         <p>
         [Date]<br /><br />
         
         [Recipient Name/Title]<br />
         [Company Name]<br />
         [Company Address]<br />
         [City, Province/State, Country]<br />
         </p>

      6. Format the signature EXACTLY like this (but without the brackets, using real data):
         <p>
         Sincerely,<br /><br />
         
         [Full Name]<br />
         </p>
         
         <p>
         [Email Address]<br />
         [Phone Number]<br />
         [LinkedIn URL]<br />
         [Other URLs]<br />
         </p>

      7. NEVER combine information on the same line
      8. ALWAYS use <br /> tags between each piece of information
      9. Add an extra <br /> after the date and after "Sincerely,"

      Please use my contact information in the letter:
      Full Name: ${resume.first_name} ${resume.last_name}
      Email: ${resume.email}
      ${resume.phone_number ? `Phone: ${resume.phone_number}` : ''}
      ${resume.linkedin_url ? `LinkedIn: ${resume.linkedin_url}` : ''}
      ${resume.github_url ? `GitHub: ${resume.github_url}` : ''}

      ${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ''}`;
      
      const { output } = await generate(prompt, {
        ...aiConfig,
        model: selectedModel || '',
        apiKeys
      });

      let generatedContent = '';
      
      for await (const delta of readStreamableValue(output)) {
        generatedContent += delta;
        // Update both local state and resume context
        setGeneration(generatedContent);
        onResumeChange('cover_letter', {
          content: generatedContent,
        });
      }
      
      
    } catch (error: Error | unknown) {
      console.error('Generation error:', error);
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

          {/* Cover Letter */}
          {resume.has_cover_letter ? (
            <div className="space-y-4">

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

                    {/* Generate Cover Letter Button */}
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
            </div>
          ) : (
            // No Cover Letter
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