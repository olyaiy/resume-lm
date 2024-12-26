'use client';

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DescriptionPointProps {
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  placeholder?: string;
}

export function DescriptionPoint({
  value,
  onChange,
  onDelete,
  placeholder = "Start with a strong action verb"
}: DescriptionPointProps) {
  return (
    <div className="flex gap-1 items-start group/item">
      <div className="flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[80px] text-xs md:text-sm bg-white/50 border-gray-200 rounded-lg",
            "focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20",
            "hover:border-cyan-500/30 hover:bg-white/60 transition-colors",
            "placeholder:text-gray-400"
          )}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="p-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
} 