'use client';

import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Resume } from "@/lib/types";


interface TextImportProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  className?: string;
}

interface LazyTextImportDialogProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TextImport({
  resume,
  onResumeChange,
  className
}: TextImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [DialogComponent, setDialogComponent] = useState<ComponentType<LazyTextImportDialogProps> | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    if (DialogComponent) return;

    void import("./management/dialogs/text-import-dialog").then(({ TextImportDialog }) => {
      setDialogComponent(() => TextImportDialog);
    });
  };

  const trigger = (
    <Button
      size="sm"
      className={className}
      onClick={handleOpen}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <FileText className="mr-2 h-4 w-4" />
      Import
    </Button>
  );

  if (!DialogComponent) return trigger;

  return (
    <DialogComponent
      resume={resume}
      onResumeChange={onResumeChange}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger}
    />
  );
}
