import CoverLetterEditor from "./cover-letter-editor";
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useResumeContext } from '@/components/resume/editor/resume-editor-context';
import { useToast } from "@/hooks/use-toast";


interface CoverLetterProps {
    resumeId: string;
    hasCoverLetter: boolean;
    coverLetterData?: Record<string, unknown> | null;
    onCoverLetterChange?: (data: Record<string, unknown>) => void;
    containerWidth: number;
}


export default function CoverLetter({ 
  onCoverLetterChange,
  containerWidth 
}: CoverLetterProps) {

  const { state } = useResumeContext();
  const resumeId = state.resume.id;
  const hasCoverLetter = state.resume.has_cover_letter;
  const coverLetterData = state.resume.cover_letter;
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      const element = contentRef.current;
      // Dynamically import html2pdf only when needed
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [0, 0, -0.5, 0],
        filename: `cover-letter-${resumeId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Success",
        description: "Cover letter exported as PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If no cover letter exists, render empty state
  if (!hasCoverLetter) {
    return (
      <div className="space-y-4">
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
    <div className="">
      
        <div ref={contentRef} id="cover-letter-content" className="">
          <CoverLetterEditor 
            initialData={coverLetterData || {}}
            onChange={onCoverLetterChange}
            containerWidth={containerWidth}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-600/50 text-blue-700 hover:bg-blue-50"
          onClick={handleExportPDF}
        >
          <Download className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
    </div>
  );
}

