'use client';

import dynamic from "next/dynamic";
import { Resume } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ResumePreview } from "../preview/resume-preview";
import { ResumeContextMenu } from "../preview/resume-context-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingFallback } from "../shared/LoadingFallback";
import { useDeferredValue } from "react";

const LazyCoverLetter = dynamic(() => import("@/components/cover-letter/cover-letter"), {
  ssr: false,
  loading: () => <LoadingFallback lines={3} />,
});

interface PreviewPanelProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  width: number;
  // percentWidth: number;
}

export function PreviewPanel({
  resume,
  onResumeChange,
  width
}: PreviewPanelProps) {
  // Keep form updates immediate while allowing the heavier HTML preview to
  // yield briefly during rapid typing in larger resumes.
  const previewResume = useDeferredValue(resume);

  return (
    <ScrollArea className={cn(
      "z-50 h-full",
      resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="">
      <ResumeContextMenu resume={resume}>
          <ResumePreview resume={previewResume} containerWidth={width} />
        </ResumeContextMenu>
      </div>

      {resume.has_cover_letter ? (
        <LazyCoverLetter containerWidth={width} />
      ) : (
        <div className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-50"
            onClick={() => onResumeChange("has_cover_letter", true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Cover Letter
          </Button>
        </div>
      )}
    </ScrollArea>
  );
} 
