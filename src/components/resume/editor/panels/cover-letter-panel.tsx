import { Resume, Job } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateCoverLetter } from "@/components/cover-letter/ai";

interface CoverLetterPanelProps {
  resume: Resume;
  job: Job | null;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function CoverLetterPanel({
  resume,
  job,
  onResumeChange,
}: CoverLetterPanelProps) {
  return (
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
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onResumeChange('has_cover_letter', false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Cover Letter
            </Button>

            <Button
              onClick={async () => {
                try {
                  const coverLetterStream = await generateCoverLetter(
                    JSON.stringify(resume, null, 2),
                    job ? JSON.stringify(job, null, 2) : ''
                  );
                  for await (const chunk of coverLetterStream.textStream) {
                    console.log(chunk);
                  }
                } catch (error) {
                  console.error('Error generating cover letter:', error);
                }
              }}
            >
              Write with AI
            </Button>
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
  );
} 