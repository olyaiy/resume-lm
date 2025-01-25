import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ReactNode } from "react";
import CoverLetter from "@/components/cover-letter/cover-letter";

interface ResizablePanelsProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: ReactNode;
}

export function ResizablePanels({
  isBaseResume,
  editorPanel,
  previewPanel
}: ResizablePanelsProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn(
        "h-full rounded-lg",
        isBaseResume
          ? "border-purple-200/40"
          : "border-pink-300/50"
      )}
    >
      {/* Editor Panel */}
      <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
        {editorPanel}
      </ResizablePanel>

      {/* Resize Handle */}
      <ResizableHandle 
        withHandle 
        className={cn(
          isBaseResume
            ? "bg-purple-100/50 hover:bg-purple-200/50"
            : "bg-pink-200/50 hover:bg-pink-300/50 shadow-sm shadow-pink-200/20"
        )}
      />

      {/* Preview Panel */}
      <ResizablePanel defaultSize={60} minSize={30} maxSize={70}>
        {previewPanel}
        {/* <CoverLetter /> */}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
} 