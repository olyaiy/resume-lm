import CoverLetterEditor from "./cover-letter-editor";
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CoverLetterProps {
    resumeId: string;
    hasCoverLetter: boolean;
    coverLetterData?: Record<string, unknown> | null;
    onCoverLetterChange?: (data: Record<string, unknown>) => void;
}

// Make this a regular component, not async
export default function CoverLetter({ 
  resumeId, 
  hasCoverLetter, 
  coverLetterData,
  onCoverLetterChange 
}: CoverLetterProps) {
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

