import { Resume } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ResumeListProps {
  resumes: Resume[];
  title: string;
  type: 'base' | 'tailored';
  accentColor: {
    bg: string;
    border: string;
    hover: string;
    text: string;
  };
  emptyMessage: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export function ResumeList({
  resumes,
  type,
  accentColor,
  emptyMessage,
  className,
  itemClassName
}: ResumeListProps) {
  if (!resumes || resumes.length === 0) {
    return emptyMessage;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", className)}>
      {resumes.map((resume) => (
        <Link
          key={resume.id}
          href={`/resumes/${resume.id}`}
          className={cn(
            "group relative overflow-hidden rounded-lg border transition-all duration-300",
            "bg-white/50 hover:bg-white/60",
            `border-${accentColor.border}`,
            `hover:border-${accentColor.hover}`,
            "shadow-sm hover:shadow-md",
            "transform hover:-translate-y-0.5",
            itemClassName
          )}
        >
          <div className="absolute inset-0 p-1.5">
            {/* Resume Header */}
            <div className="border-b border-gray-200/70 pb-1 mb-1">
              <div className="text-[12px] font-medium text-gray-800">
                {type === 'base' ? resume.target_role : resume.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate mb-1 flex items-center gap-0.5">
                <span className={`text-${accentColor.text} font-bold`}>
                  {type === 'base' ? 'Base Resume' : 'Tailored Resume'}
                </span>
              </div>
              <div className="h-1 w-12 bg-gray-200/70 rounded-full" />
            </div>

            {/* Resume Content */}
            <div className="space-y-1">
              {/* Experience Section */}
              <div>
                <div className="h-1 w-8 bg-gray-300/70 rounded-full mb-0.5" />
                <div className="space-y-0.5">
                  <div className="h-0.5 w-full bg-gray-200/70 rounded-full" />
                  <div className="h-0.5 w-3/4 bg-gray-200/70 rounded-full" />
                  <div className="h-0.5 w-5/6 bg-gray-200/70 rounded-full" />
                </div>
              </div>

              {/* Education Section */}
              <div>
                <div className="h-1 w-8 bg-gray-300/70 rounded-full mb-0.5" />
                <div className="space-y-0.5">
                  <div className="h-0.5 w-full bg-gray-200/70 rounded-full" />
                  <div className="h-0.5 w-2/3 bg-gray-200/70 rounded-full" />
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <div className="h-1 w-8 bg-gray-300/70 rounded-full mb-0.5" />
                <div className="flex flex-wrap gap-0.5">
                  <div className="h-1 w-6 bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-8 bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-4 bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-6 bg-gray-200/70 rounded-full" />
                </div>
              </div>
            </div>

            {/* Date at bottom left */}
            <div className="absolute bottom-0 left-0 p-0.5">
              <p className="text-[10px] text-muted-foreground">
                Updated {format(new Date(resume.updated_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 