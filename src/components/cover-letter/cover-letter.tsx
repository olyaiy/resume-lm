import CoverLetterEditor from "./cover-letter-editor";
import { getCoverLetter } from '@/utils/actions';
import { Suspense } from 'react';

interface CoverLetterProps {
    resumeId: string;
    hasCoverLetter: boolean;
}

// Make this a regular component, not async
export default function CoverLetter({ resumeId, hasCoverLetter }: CoverLetterProps) {
  // If no cover letter exists, render empty state
  if (!hasCoverLetter) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">No cover letter found for this resume</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">Loading cover letter...</div>}>
      <CoverLetterContent resumeId={resumeId} />
    </Suspense>
  );
}

// Separate async component for content
async function CoverLetterContent({ resumeId }: { resumeId: string }) {
  const coverLetter = await getCoverLetter(resumeId);
  console.log(coverLetter)
  
  if (!coverLetter) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Error loading cover letter</p>
      </div>
    );
  }

  return <CoverLetterEditor  />;
}