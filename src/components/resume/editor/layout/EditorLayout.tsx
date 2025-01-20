import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { BackgroundEffects } from "./BackgroundEffects";
import { ResizablePanels } from "./ResizablePanels";

interface EditorLayoutProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: ReactNode;
}

export function EditorLayout({
  isBaseResume,
  editorPanel,
  previewPanel
}: EditorLayoutProps) {
  return (
    <main className={cn(
      "relative",
      isBaseResume 
        ? "bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50"
        : "bg-gradient-to-br from-pink-100/80 via-rose-50/80 to-pink-100/80"
    )}>
      <BackgroundEffects isBaseResume={isBaseResume} />
      
      <div className="relative  pt-4 px-6 md:px-8 lg:px-12 mx-auto">
        <div className="max-w-[2000px] mx-auto h-[calc(100vh-120px)]">
          <ResizablePanels
            isBaseResume={isBaseResume}
            editorPanel={editorPanel}
            previewPanel={previewPanel}
          />
        </div>
      </div>
    </main>
  );
} 