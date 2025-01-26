import CoverLetterEditor from "./cover-letter-editor";
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useResumeContext } from '@/components/resume/editor/resume-editor-context';


interface CoverLetterProps {
    resumeId: string;
    hasCoverLetter: boolean;
    coverLetterData?: Record<string, unknown> | null;
    onCoverLetterChange?: (data: Record<string, unknown>) => void;
}


export default function CoverLetter({ 
  onCoverLetterChange 
}: CoverLetterProps) {

  const { state } = useResumeContext();
  const resumeId = state.resume.id;  // Access the resume ID from context
  const hasCoverLetter = state.resume.has_cover_letter;
  const coverLetterData = state.resume.cover_letter;



  // If no cover letter exists, render empty state
  if (!hasCoverLetter) {
    return (
      <div className="space-y-4 pb-8">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-50"
          onClick={() => onCoverLetterChange?.({
            has_cover_letter: true,
            cover_letter: {
              content: '',
              lastUpdated: new Date().toISOString()
            }
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Cover Letter
        </Button>
      </div>
    );
  }


  // If cover letter exists, render it
  return (
    <Suspense fallback={
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded-md w-1/3" />
        <div className="h-64 bg-muted rounded-md" />
      </div>
    }>
      <CoverLetterEditor 
        initialData={coverLetterData || {}}
        onChange={onCoverLetterChange}
      />
    </Suspense>
  );
}

