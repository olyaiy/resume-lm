import { cn } from "@/lib/utils";

interface MiniResumePreviewProps {
  name: string;
  type: 'base' | 'tailored';
  className?: string;
}

export function MiniResumePreview({ name, type, className }: MiniResumePreviewProps) {
  const gradientFrom = type === 'base' ? 'purple-600' : 'pink-600';
  const gradientTo = type === 'base' ? 'indigo-600' : 'rose-600';
  const accentBorder = type === 'base' ? 'purple-200' : 'pink-200';

  return (
    <div className={cn(
      "relative w-full aspect-[8.5/11]",
      "flex flex-col items-center justify-center",
      "rounded-lg overflow-hidden",
      "border shadow-lg",
      `border-${accentBorder}`,
      "bg-white/80 backdrop-blur-sm",
      "transition-all duration-300",
      "group",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-5">
        <div className={cn(
          "absolute inset-0",
          `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`
        )} />
      </div>

      {/* Content */}
      <div className="relative px-3 py-4 text-center">
        <div className={cn(
          "text-xs font-medium line-clamp-2",
          `text-${gradientFrom}`
        )}>
          {name}
        </div>
      </div>

      {/* Lines to simulate text */}
      <div className="absolute inset-x-4 top-1/3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full",
              `bg-${gradientFrom}/10`,
              "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
} 