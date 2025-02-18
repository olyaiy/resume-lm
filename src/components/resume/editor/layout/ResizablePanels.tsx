import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ReactNode, useRef, useState, useEffect } from "react";

interface ResizablePanelsProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: (width: number) => ReactNode;
}

export function ResizablePanels({
  isBaseResume,
  editorPanel,
  previewPanel
}: ResizablePanelsProps) {
  const [previewSize, setPreviewSize] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPercentageRef = useRef(60);

  const updatePixelWidth = () => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const pixelWidth = Math.floor((containerWidth * lastPercentageRef.current) / 100);
    setPreviewSize(pixelWidth);
  };

  useEffect(() => {
    const handleResize = () => updatePixelWidth();
    window.addEventListener('resize', handleResize);
    updatePixelWidth();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile Layout
  const mobileLayout = (
    <div className="flex flex-col h-full gap-4  pb-60 sm:pb-0">
      {/* Preview Panel on top for mobile */}
      <div className={cn(
        " h-[60vh] overflow-y-auto shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] px-0 bg-grey-600 border-black border-2",
        isBaseResume
          ? "shadow-purple-200/50"
          : "shadow-pink-200/50"
      )}>
        {previewPanel(window.innerWidth-60)}
      </div>

      {/* Editor Panel below for mobile */}
      <div className="flex-1 overflow-y-auto border-black border-2">
        {editorPanel}
      </div>
    </div>
  );

  // Desktop Layout (Resizable Panels)
  const desktopLayout = (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn(
        "relative h-full rounded-lg",
        isBaseResume
          ? "border-purple-200/40"
          : "border-pink-300/50"
      )}
    >
      <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
        {editorPanel}
      </ResizablePanel>

      <ResizableHandle 
        withHandle 
        className={cn(
          isBaseResume
            ? "bg-purple-100/50 hover:bg-purple-200/50"
            : "bg-pink-200/50 hover:bg-pink-300/50 shadow-sm shadow-pink-200/20"
        )}
      />

      <ResizablePanel 
        defaultSize={60} 
        minSize={30} 
        maxSize={70}
        onResize={(size) => {
          lastPercentageRef.current = size;
          updatePixelWidth();
        }}
        className={cn(
          "shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] overflow-y-scroll",
          isBaseResume
            ? "shadow-purple-200/50"
            : "shadow-pink-200/50"
        )}
      >
        {previewPanel(previewSize)}
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  return (
    <div ref={containerRef} className="h-full relative">
      {/* Show mobile layout on small screens, desktop layout on sm and up */}
      <div className="block sm:hidden">
        {mobileLayout}
      </div>
      <div className="hidden sm:block">
        {desktopLayout}
      </div>
    </div>
  );
}