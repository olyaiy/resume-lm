

import { cn } from "@/lib/utils";

interface MiniResumePreviewProps {
  name: string;
  type: 'base' | 'tailored';
  updatedAt?: string;
  createdAt?: string;
  target_role?: string;
  className?: string;
}

export function MiniResumePreview({
  name,
  type,
  createdAt,
  className
}: MiniResumePreviewProps) {

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  }

  const accentBorder = type === 'base' ? 'purple-200' : 'pink-200';
  const accentBg = type === 'base' ? 'purple-50' : 'pink-50';
  const accentText = type === 'base' ? 'purple-600' : 'pink-600';
  const glowColor = type === 'base' 
    ? 'shadow-purple-500/20 hover:shadow-purple-500/30' 
    : 'shadow-rose-500/20 hover:shadow-rose-500/30';

  return (
    <div className={cn(
      "relative w-full aspect-[8.5/11]",
      "rounded-lg overflow-hidden",
      "border shadow-lg",
      `border-${accentBorder}`,
      "bg-white",
      "transition-all duration-300",
      "hover:shadow-xl hover:-translate-y-1",
      glowColor,
      "group",
      className
    )}>
      {/* Paper texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.02)_50%,transparent_100%)]" />
      
      {/* Content Container */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-3 pb-2 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {name}
          </h3>
          <div className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
            `bg-${accentBg} text-${accentText}`
          )}>
            {type === 'base' ? 'Base Resume' : 'Tailored Resume'}
          </div>
        </div>

        {/* Mock Resume Content */}
        <div className="flex-1 space-y-4">
          {/* Contact Info Section */}
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={`contact-${i}`}
                className="h-1 rounded-full bg-gray-200 w-12"
              />
            ))}
          </div>

          {/* Summary Section */}
          <div className="space-y-1">
            <div className="h-1.5 w-16 rounded-full bg-gray-300" />
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`summary-${i}`}
                  className={cn(
                    "h-1 rounded-full bg-gray-200",
                    i === 0 && "w-[95%]",
                    i === 1 && "w-[85%]",
                    i === 2 && "w-[90%]"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-1">
            <div className="h-1.5 w-20 rounded-full bg-gray-300" />
            {[...Array(2)].map((_, groupIndex) => (
              <div key={`exp-group-${groupIndex}`} className="py-1 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1 w-24 rounded-full bg-gray-300" />
                  <div className="h-1 w-16 rounded-full bg-gray-200" />
                </div>
                {[...Array(2)].map((_, i) => (
                  <div
                    key={`exp-${groupIndex}-${i}`}
                    className={cn(
                      "h-1 rounded-full bg-gray-200",
                      groupIndex === 0 && i === 0 && "w-[85%]",
                      groupIndex === 0 && i === 1 && "w-[90%]",
                      groupIndex === 1 && i === 0 && "w-[95%]",
                      groupIndex === 1 && i === 1 && "w-[80%]"
                    )}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Skills Section */}
          <div className="space-y-1">
            <div className="h-1.5 w-14 rounded-full bg-gray-300" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`skill-${i}`}
                  className="h-1 rounded-full bg-gray-200 w-16"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer with creation date */}
        {createdAt && (
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
            {formatDate(createdAt)}
          </div>
        )}
      </div>

      {/* Hover overlay with enhanced glow */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300",
        "bg-gradient-to-br",
        type === 'base'
          ? "from-purple-500/5 to-indigo-500/5"
          : "from-pink-500/5 to-rose-500/5"
      )} />
    </div>
  );
} 