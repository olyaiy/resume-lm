import { ReactNode } from "react";
import { BackgroundEffects } from "@/components/resume/editor/layout/BackgroundEffects";

export default function ResumeEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className=" relative h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background Layer */}
      {/* <BackgroundEffects /> */}

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 