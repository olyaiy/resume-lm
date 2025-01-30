'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Download, Copy } from "lucide-react";

interface CoverLetterContextMenuProps {
  children: React.ReactNode;
  onDownloadPDF: () => Promise<void>;
  onCopyToClipboard: () => Promise<void>;
}

export function CoverLetterContextMenu({ 
  children,
  onDownloadPDF,
  onCopyToClipboard
}: CoverLetterContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          onClick={onDownloadPDF}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download as PDF</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onCopyToClipboard}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          <span>Copy to Clipboard</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 