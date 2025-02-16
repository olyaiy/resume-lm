import { Resume, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { readStreamableValue } from 'ai/rsc';
import type { AIConfig } from "@/utils/ai-tools";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { generate } from "@/utils/actions/cover-letter/actions";
import { useResumeContext } from "../resume-editor-context";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { CreateTailoredResumeDialog } from "@/components/resume/management/dialogs/create-tailored-resume-dialog";


interface CoverLetterPanelProps {
  resume: Resume;
  job: Job | null;
  aiConfig?: AIConfig;
}

export function CoverLetterPanel({
  resume,
  job,
  aiConfig,
}: CoverLetterPanelProps) {
  const { dispatch } = useResumeContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });

  const updateField = (field: keyof Resume, value: Resume[keyof Resume]) => {
    dispatch({ 
      type: 'UPDATE_FIELD',
      field,
      value
    });
  };

  const generateCoverLetter = async () => {
    if (!job) return;
    
    setIsGenerating(true);
    
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

      // Prompt
      const prompt = `Write a professional cover letter for the following job using my resume information:
      ${JSON.stringify(job)}
      
      ${JSON.stringify(resume)}
      
      Today's date is ${new Date().toLocaleDateString()}.

      Please use my contact information in the letter:
      Full Name: ${resume.first_name} ${resume.last_name}
      Email: ${resume.email}
      ${resume.phone_number ? `Phone: ${resume.phone_number}` : ''}
      ${resume.linkedin_url ? `LinkedIn: ${resume.linkedin_url}` : ''}
      ${resume.github_url ? `GitHub: ${resume.github_url}` : ''}

      ${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ''}`;
      

      // Call The Model
      const { output } = await generate(prompt, {
        ...aiConfig,
        model: selectedModel || '',
        apiKeys
      });

      // Generated Content
      let generatedContent = '';


      // Update Resume Context
      for await (const delta of readStreamableValue(output)) {
        generatedContent += delta;
        // Update resume context directly
        // console.log('Generated Content:', generatedContent);
        updateField('cover_letter', {
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

  if (resume.is_base_resume) {
    return (
      <div className={cn(
        "p-4 backdrop-blur-xl rounded-lg shadow-lg bg-purple-50/80 border border-purple-200",
        "space-y-4 text-center"
      )}>
        <div className="flex items-center gap-2 justify-center">
          <div className="p-1.5 rounded-md bg-purple-100/80">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900">Cover Letter</h3>
        </div>
        
        <p className="text-sm text-purple-700">
          To generate a cover letter, please first tailor this base resume to a specific job.
        </p>
        
        <CreateTailoredResumeDialog 
          baseResumes={[resume]}
        >
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tailor This Resume
          </Button>
        </CreateTailoredResumeDialog>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 backdrop-blur-xl rounded-lg shadow-lg bg-white/80 border border-emerald-600/50",
      "space-y-6"
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-emerald-100/80">
          <FileText className="h-4 w-4 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900">Cover Letter</h3>
      </div>

      {resume.has_cover_letter ? (
        <div className="space-y-6">
          <div className={cn(
            "w-full p-4",
            "bg-emerald-50",
            "border-2 border-emerald-300",
            "shadow-sm",
            "rounded-lg"
          )}>
            <AIImprovementPrompt
              value={customPrompt}
              onChange={setCustomPrompt}
              isLoading={isGenerating}
              placeholder="e.g., Focus on leadership experience and technical skills"
              hideSubmitButton
            />
          </div>

          <div className="space-y-3">
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

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => updateField('has_cover_letter', false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Cover Letter
            </Button>
          </div>
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
            onClick={() => updateField('has_cover_letter', true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Cover Letter
          </Button>
        </div>
      )}

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
    </div>
  );
} 