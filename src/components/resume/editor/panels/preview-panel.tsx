'use client';

import { Resume } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ResumeContextMenu } from "../preview/resume-context-menu";
import { ResumePreview } from "../preview/resume-preview";
import { RefObject } from "react";
import CoverLetter from "@/components/cover-letter/cover-letter";


interface PreviewPanelProps {
  resume: Resume;
  previewPanelRef: RefObject<HTMLDivElement | null>;
  previewPanelWidth: number;
}

export function PreviewPanel({
  resume,
  previewPanelRef,
  previewPanelWidth
}: PreviewPanelProps) {
  return (
    <ScrollArea className={cn(
      "h-full rounded-lg pb-[9rem]  z-50",
      resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="relative h-full w-full" ref={previewPanelRef}>
        <div className=" ">
          <ResumeContextMenu resume={resume}>
            <ResumePreview resume={resume} containerWidth={previewPanelWidth} />
          </ResumeContextMenu>
        </div>
      </div>
      <CoverLetter 
          resumeId={resume.id} 
          hasCoverLetter={resume.has_cover_letter} />
          
    </ScrollArea>
  );
} 