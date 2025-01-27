'use client';

import { Resume } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ResumeContextMenu } from "../preview/resume-context-menu";
import { ResumePreview } from "../preview/resume-preview";
import { useRef, useState, useEffect } from "react";
import CoverLetter from "@/components/cover-letter/cover-letter";

interface PreviewPanelProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function PreviewPanel({
  resume,
  onResumeChange
}: PreviewPanelProps) {
  const [previewPanelWidth, setPreviewPanelWidth] = useState(0);
  const previewPanelRef = useRef<HTMLDivElement>(null);

  // Track preview panel width for responsive scaling
  useEffect(() => {
    if (previewPanelRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setPreviewPanelWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(previewPanelRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [previewPanelWidth]);

  // Add logging to verify width updates
  useEffect(() => {
    console.log('Preview panel width changed:', previewPanelWidth);
  });

  return (
    <ScrollArea className={cn(
      "h-full pb-[9rem]  z-50",
      resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="relative" ref={previewPanelRef}>
        <div className=" ">
          {/* <ResumeContextMenu resume={resume}> */}
            <ResumePreview resume={resume} containerWidth={previewPanelWidth} />
          {/* </ResumeContextMenu> */}
        </div>
      </div>

      <CoverLetter 
        resumeId={resume.id} 
        hasCoverLetter={resume.has_cover_letter}
        coverLetterData={resume.cover_letter}
        onCoverLetterChange={(data: Record<string, unknown>) => {
          if ('has_cover_letter' in data) {
            onResumeChange('has_cover_letter', data.has_cover_letter as boolean);
          }
          if ('cover_letter' in data) {
            onResumeChange('cover_letter', data.cover_letter as Record<string, unknown>);
          }
        }}
      />
    </ScrollArea>
  );
} 