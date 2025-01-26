import CoverLetterEditor from "./cover-letter-editor";
import { Suspense } from 'react';

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
      <div className="p-4">
        <p className="text-muted-foreground">No cover letter found for this resume</p>
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

