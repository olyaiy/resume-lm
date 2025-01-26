'use client';

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { TextImport } from "../../text-import";
import { ResumePDFDocument } from "../preview/resume-pdf-document";
import { cn } from "@/lib/utils";
import { useResumeContext } from "../resume-editor-context";
import { useRouter } from "next/navigation";
import { updateResume, deleteResume } from "@/utils/actions";

interface ResumeEditorActionsProps {
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function ResumeEditorActions({
  onResumeChange
}: ResumeEditorActionsProps) {
  const { state, dispatch } = useResumeContext();
  const router = useRouter();
  const { resume, isSaving } = state;

  // Save Resume
  const handleSave = async () => {
    try {
      dispatch({ type: 'SET_SAVING', value: true });
      await updateResume(state.resume.id, state.resume);
      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_SAVING', value: false });
    }
  };

  // Delete Resume
  const handleDelete = async () => {
    try {
      dispatch({ type: 'SET_DELETING', value: true });
      await deleteResume(state.resume.id);
      toast({
        title: "Resume deleted",
        description: "Your resume has been permanently removed.",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_DELETING', value: false });
    }
  };

  // Dynamic color classes based on resume type
  const colors = resume.is_base_resume ? {
    // Import button colors
    importBg: "bg-indigo-600",
    importHover: "hover:bg-indigo-700",
    importShadow: "shadow-indigo-400/20",
    // Action buttons colors (download & save)
    actionBg: "bg-purple-600",
    actionHover: "hover:bg-purple-700",
    actionShadow: "shadow-purple-400/20"
  } : {
    // Import button colors
    importBg: "bg-rose-600",
    importHover: "hover:bg-rose-700",
    importShadow: "shadow-rose-400/20",
    // Action buttons colors (download & save)
    actionBg: "bg-pink-600",
    actionHover: "hover:bg-pink-700",
    actionShadow: "shadow-pink-400/20"
  };

  const buttonBaseStyle = cn(
    "transition-all duration-300",
    "relative overflow-hidden",
    "h-8 px-3 text-[11px] font-medium",
    "rounded-md border-none",
    "text-white shadow-sm",
    "hover:shadow-md hover:-translate-y-[1px]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
  );

  const importButtonClasses = cn(
    buttonBaseStyle,
    colors.importBg,
    colors.importHover,
    colors.importShadow
  );

  const actionButtonClasses = cn(
    buttonBaseStyle,
    colors.actionBg,
    colors.actionHover,
    colors.actionShadow
  );

  return (
    <div className="px-1 py-2 @container">
      <div className="grid grid-cols-3 gap-2">
        {/* Text Import Button */}
        <TextImport
          resume={resume}
          onResumeChange={onResumeChange}
          className={importButtonClasses}
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
          className={actionButtonClasses}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download
        </Button>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className={actionButtonClasses}
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