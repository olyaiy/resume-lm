import { ReactNode } from "react";
import { BackgroundEffects } from "@/components/resume/editor/layout/BackgroundEffects";

export default function ResumeEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      {/* Background Layer */}
      <BackgroundEffects />

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 