'use client';

import { cn } from "@/lib/utils";

interface GradientHoverProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  hoverFrom?: string;
  hoverVia?: string;
  hoverTo?: string;
}

export function GradientHover({
  children,
  className,
  from = "violet-600",
  via = "blue-600",
  to = "violet-600",
  hoverFrom = "blue-600",
  hoverVia = "violet-600",
  hoverTo = "blue-600",
}: GradientHoverProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent transition-all duration-700 bg-[length:200%_auto] hover:bg-[position:100%_0] cursor-pointer",
        `from-${from} via-${via} to-${to}`,
        `hover:from-${hoverFrom} hover:via-${hoverVia} hover:to-${hoverTo}`,
        className
      )}
    >
      {children}
    </span>
  );
} 