'use client';

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ResumePDFDocument } from './resume-pdf-document';
import { pdf } from '@react-pdf/renderer';
import { useRouter } from "next/navigation";
import { TextImport } from "./text-import";
import { cn } from "@/lib/utils";

interface ResumeEditorHeaderProps {
  resume: Resume;
  isSaving: boolean;
  isDeleting: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onResumeChange: (field: keyof Resume, value: any) => void;
}

export function ResumeEditorHeader({
  resume,
  isSaving,
  isDeleting,
  hasUnsavedChanges,
  onSave,
  onDelete,
  onResumeChange
}: ResumeEditorHeaderProps) {
  const router = useRouter();
  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      // TODO: Show exit dialog
      router.push('/');
    } else {
      router.push('/');
    }
  };

  // Dynamic color classes based on resume type
  const colors = resume.is_base_resume ? {
    gradient: "from-purple-600 via-purple-500 to-indigo-600",
    border: "border-purple-200/50",
    background: "from-purple-50/95 via-white/95 to-purple-50/95",
    shadow: "shadow-purple-500/10",
    text: "text-purple-600",
    hover: "hover:text-purple-600",
    textOpacity: "text-purple-600/60",
    gradientOverlay: "#f3e8ff30",
    buttonGradient: "from-purple-500 to-indigo-600",
    buttonHover: "hover:from-purple-600 hover:to-indigo-700",
    buttonShadow: "shadow-purple-500/20"
  } : {
    gradient: "from-pink-600 via-pink-500 to-rose-600",
    border: "border-pink-200/50",
    background: "from-pink-50/95 via-white/95 to-pink-50/95",
    shadow: "shadow-pink-500/10",
    text: "text-pink-600",
    hover: "hover:text-pink-600",
    textOpacity: "text-pink-600/60",
    gradientOverlay: "#fce7f330",
    buttonGradient: "from-pink-500 to-rose-600",
    buttonHover: "hover:from-pink-600 hover:to-rose-700",
    buttonShadow: "shadow-pink-500/20"
  };

  return (
    <div className={cn(
      "h-20 border-b backdrop-blur-xl fixed left-0 right-0 z-40 shadow-lg",
      colors.border,
      `bg-gradient-to-r ${colors.background}`,
      colors.shadow
    )}>
      {/* Gradient Overlays */}
      <div className={cn(
        "absolute inset-0",
        `bg-[linear-gradient(to_right,${colors.gradientOverlay}_0%,#ffffff40_50%,${colors.gradientOverlay}_100%)]`,
        "pointer-events-none"
      )} />
      <div className={cn(
        "absolute inset-0",
        `bg-[radial-gradient(circle_800px_at_50%_-40%,${colors.gradientOverlay}_0%,transparent_100%)]`,
        "pointer-events-none"
      )} />
      <div className={cn(
        "absolute inset-0",
        `bg-[radial-gradient(circle_600px_at_100%_100%,${colors.gradientOverlay}_0%,transparent_100%)]`,
        "pointer-events-none"
      )} />
      
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between relative">
        {/* Left Section - Title and Back Button */}
        <div className="flex flex-col justify-center gap-1">
          {/* Back Button */}
          <button 
            onClick={handleBackClick}
            className={cn(
              "group flex items-center text-xs font-medium -mb-1 w-fit transition-all duration-300",
              colors.textOpacity,
              colors.hover
            )}
          >
            <ArrowLeft className="h-3 w-3 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>

          {/* Resume Title Section */}
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                colors.gradient
              )}>
                {resume.is_base_resume ? capitalizeWords(resume.target_role) : resume.name}
              </span>
            </h1>
            <div className={cn("flex items-center gap-2 text-sm", colors.textOpacity)}>
              {resume.is_base_resume ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-500/20" />
                  <span className="font-medium">Base Resume</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm shadow-pink-500/20" />
                  <span className="font-medium">Tailored Resume</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center">
          {/* Action Buttons Group */}
          <div className="flex items-center gap-2">
            {/* Text Import Button */}
            <TextImport 
              resume={resume}
              onResumeChange={onResumeChange}
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
                  toast({
                    title: "Download failed",
                    description: "Unable to download your resume. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              size="sm"
              className={cn(
                "text-white transition-all duration-500 shadow-md hover:shadow-lg h-9 px-4 relative overflow-hidden group",
                "hover:-translate-y-0.5",
                `bg-gradient-to-br ${colors.buttonGradient}`,
                colors.buttonHover,
                colors.buttonShadow
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>

            {/* Save Button */}
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              size="sm"
              className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 h-9 px-4 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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
                  className="bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5 h-9 px-4 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                  disabled={isDeleting}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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
                    Are you sure you want to delete "{resume.name}"? This action cannot be undone.
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
      </div>
    </div>
  );
} 