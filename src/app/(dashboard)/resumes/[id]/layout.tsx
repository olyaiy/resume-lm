import { ReactNode } from "react";

export default function ResumeEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex  h-full  max-h-screen overflow-none ">
      {/* Background Layer */}
      {/* <BackgroundEffects /> */}

      {/* Content Layer */}
      <div className="relative z-10  mx-auto w-full">
        {children}
      </div>
    </div>
  );
} 