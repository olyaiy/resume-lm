'use client';

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  isDeleting,
  onSave,
  onDelete,
  onResumeChange
}: ResumeEditorActionsProps) {
  // Dynamic color classes based on resume type
  const colors = resume.is_base_resume ? {
    gradient: "from-purple-600 to-indigo-600",
    hover: "hover:from-purple-700 hover:to-indigo-700",
    shadow: "shadow-purple-500/20"
  } : {
    gradient: "from-pink-600 to-rose-600",
    hover: "hover:from-pink-700 hover:to-rose-700",
    shadow: "shadow-pink-500/20"
  };

  const buttonBaseClasses = cn(
    "transition-all duration-500 shadow-md hover:shadow-lg hover:-translate-y-0.5",
    "relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
    "h-8 px-3 text-[11px] @[300px]:text-sm"
  );

  const buttonShineOverlay = "absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000";

  return (
    <div className="@container">
      <div className={cn(
        "grid grid-cols-2 @[400px]:grid-cols-4 gap-2",
        "transition-all duration-300 ease-in-out"
      )}>
        {/* Text Import Button */}
        <TextImport
          resume={resume}
          onResumeChange={onResumeChange}
          className={cn(
            buttonBaseClasses,
            "w-full bg-gradient-to-r",
            colors.gradient,
            colors.hover,
            "text-white"
          )}
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
          size="sm"
          className={cn(
            buttonBaseClasses,
            "w-full bg-gradient-to-r from-indigo-600 to-violet-600",
            "hover:from-indigo-700 hover:to-violet-700",
            "text-white"
          )}
        >
          <div className={buttonShineOverlay} />
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>

        {/* Save Button */}
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          size="sm"
          className={cn(
            buttonBaseClasses,
            "w-full bg-gradient-to-r from-teal-500 to-cyan-600",
            "hover:from-teal-600 hover:to-cyan-700",
            "text-white"
          )}
        >
          <div className={buttonShineOverlay} />
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              className={cn(
                buttonBaseClasses,
                "w-full bg-gradient-to-r from-red-500 to-rose-600",
                "hover:from-red-600 hover:to-rose-700",
                "text-white"
              )}
              disabled={isDeleting}
            >
              <div className={buttonShineOverlay} />
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 