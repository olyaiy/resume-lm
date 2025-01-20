import { cn } from "@/lib/utils";

interface LoadingFallbackProps {
  lines?: number;
  className?: string;
}

export function LoadingFallback({ lines = 2, className }: LoadingFallbackProps) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      <div className="h-8 bg-muted rounded-md w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-md" />
      ))}
    </div>
  );
} 