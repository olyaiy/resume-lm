import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            "animate-[loading-dot_1.4s_ease-in-out_infinite]",
            i === 1 && "animation-delay-[200ms]",
            i === 2 && "animation-delay-[400ms]"
          )}
        />
      ))}
    </span>
  );
} 