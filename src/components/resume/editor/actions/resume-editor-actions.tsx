'use client';

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { TextImport } from "../../text-import";
import { ResumePDFDocument } from "../preview/resume-pdf-document";
import { cn } from "@/lib/utils";

interface ResumeEditorActionsProps {
  resume: Resume;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function ResumeEditorActions({
  resume,
  isSaving,
  onSave,
  onResumeChange
}: ResumeEditorActionsProps) {
  // Dynamic color classes based on resume type
  const colors = resume.is_base_resume ? {
    bg: "bg-purple-100/30",
    hover: "hover:bg-purple-200/40",
    text: "text-purple-700",
    border: "border-purple-200/40"
  } : {
    bg: "bg-pink-100/40",
    hover: "hover:bg-pink-200/50",
    text: "text-pink-700",
    border: "border-pink-300/50"
  };

  const buttonBaseClasses = cn(
    "transition-all duration-300",
    "relative overflow-hidden",
    "h-8 px-3 text-[11px] font-medium",
    "border rounded-md",
    colors.border,
    colors.bg,
    colors.text,
    colors.hover,
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  );

  return (
    <div className="px-1 py-2 @container">
      <div className="grid grid-cols-3 gap-2">
        {/* Text Import Button */}
        <TextImport
          resume={resume}
          onResumeChange={onResumeChange}
          className={buttonBaseClasses}
        />

        {/* Download Button */}
        <Button 
          onClick={async () => {
            try {
              const blob = await pdf(<ResumePDFDocument resume={resume} />).toBlob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${resume.first_name}_${resume.last_name}_Resume.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast({
                title: "Download started",
                description: "Your resume PDF is being downloaded.",
              });
            } catch (error) {
              console.error(error);
              toast({
                title: "Download failed",
                description: "Unable to download your resume. Please try again.",
                variant: "destructive",
              });
            }
          }}
          variant="ghost"
          className={buttonBaseClasses}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download
        </Button>

        {/* Save Button */}
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          variant="ghost"
          className={buttonBaseClasses}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 