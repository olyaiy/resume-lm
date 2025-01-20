import { cn } from "@/lib/utils";

interface BackgroundEffectsProps {
  className?: string;
  isBaseResume?: boolean;
}

export function BackgroundEffects({ className, isBaseResume = true }: BackgroundEffectsProps) {
  return (
    <div className={cn("fixed inset-0 z-0  overflow-hidden  h-[calc(100vh)]", className)}>
      {/* Base Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        isBaseResume 
          ? "from-rose-50/50 via-sky-50/50 to-violet-50/50"
          : "from-pink-100/80 via-rose-50/80 to-pink-100/80"
      )} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Animated Gradient Orbs */}
      <div 
        className={cn(
          "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float-slow",
          isBaseResume 
            ? "bg-gradient-to-br from-teal-200/20 to-cyan-200/20"
            : "bg-gradient-to-br from-pink-300/30 to-rose-300/30"
        )}
        style={{ willChange: 'transform' }}
      />
      <div 
        className={cn(
          "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float-slower",
          isBaseResume 
            ? "bg-gradient-to-br from-purple-200/20 to-indigo-200/20"
            : "bg-gradient-to-br from-rose-300/30 to-pink-300/30"
        )}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
} 