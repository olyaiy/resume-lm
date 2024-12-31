'use client';

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Resume } from "@/lib/types";
import { TextImportDialog } from "./text-import-dialog";

interface TextImportProps {
  resume: Resume;
  onResumeChange: <K extends keyof Resume>(field: K, value: Resume[K]) => void;
}

export function TextImport({ resume, onResumeChange }: TextImportProps) {
  return (
    <TextImportDialog
      resume={resume}
      onResumeChange={onResumeChange}
      trigger={
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 h-10 px-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <FileText className="mr-2 h-4 w-4" />
          Text Import
        </Button>
      }
    />
  );
} 