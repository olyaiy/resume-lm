import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ResizablePanels } from "./ResizablePanels";

interface EditorLayoutProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: (width: number) => ReactNode;
}

export function EditorLayout({
  isBaseResume,
  editorPanel,
  previewPanel
}: EditorLayoutProps) {
  return (
    <main className={cn(
      "relative h-full",
      isBaseResume 
        ? "bg-gradient-to-br from-rose-50/50 via-sky-50/50 to-violet-50/50"
        : "bg-gradient-to-br from-pink-100/80 via-rose-50/80 to-pink-100/80"
    )}>
      {/* <BackgroundEffects isBaseResume={isBaseResume} /> */}
      
      <div className="relative pt-4 px-6 md:px-8 lg:px-12 mx-auto h-[calc(85vh)] max-w-7xl mx-auto  overflow-hidden">
          <ResizablePanels
            isBaseResume={isBaseResume}
            editorPanel={editorPanel}
            previewPanel={previewPanel}
          />
      </div>
    </main>
  );
} 