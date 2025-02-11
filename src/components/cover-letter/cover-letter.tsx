import CoverLetterEditor from "./cover-letter-editor";
import { useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useResumeContext } from '@/components/resume/editor/resume-editor-context';
import { useToast } from "@/hooks/use-toast";


interface CoverLetterProps {
    containerWidth: number;
    
}


export default function CoverLetter({ containerWidth }: CoverLetterProps) {
  const { state, dispatch } = useResumeContext();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback((data: Record<string, unknown>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'cover_letter',
      value: {
        content: data.content,
        lastUpdated: new Date().toISOString()
      }
    });
  }, [dispatch]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      const element = contentRef.current;
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [0, 0, -0.5, 0],
        filename: `cover-letter-${state.resume.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          // scale: 2,
          useCORS: true,
          letterRendering: true,
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

  if (!state.resume.has_cover_letter) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-50"
          onClick={() => dispatch({
            type: 'UPDATE_FIELD',
            field: 'has_cover_letter',
            value: true
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Cover Letter
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Print version */}
      <div 
        ref={contentRef} 
        id="cover-letter-content"
        className="absolute -left-[9999px] w-[816px]"
      >
        <div 
          className="p-16 prose prose-sm !max-w-none"
          dangerouslySetInnerHTML={{ __html: state.resume.cover_letter?.content || '' }} 
        />
      </div>
      
      {/* Interactive editor */}
      <div className="[&_.print-hidden]:hidden">
        <CoverLetterEditor 
          initialData={{ content: state.resume.cover_letter?.content || '' }}
          onChange={handleContentChange}
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

