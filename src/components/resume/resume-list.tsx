import { Resume } from "@/lib/types";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

interface ResumeListProps {
  resumes: Resume[];
  title: string;
  emptyMessage: React.ReactNode;
  type?: 'base' | 'tailored';
  accentColor: { text: string };
}

function ResumeListItem({ resume, type, accentColor }: { resume: Resume; type: 'base' | 'tailored'; accentColor: { text: string } }) {
  const formattedDate = format(new Date(resume.updated_at), 'MMM d, yyyy');

  return (
    <div className="group">
      <Link 
        href={`/resumes/${resume.id}`}
        className="block mx-auto max-w-[280px]"
      >
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300",
          "border-gray-200/80 hover:border-gray-300/80",
          "bg-white/40 hover:bg-white/50",
          "backdrop-blur-sm hover:backdrop-blur-md",
          "shadow-sm hover:shadow-md",
          "transform hover:-translate-y-0.5",
          "aspect-[8.5/11] w-full",
          "scale-125"
        )}>
          {/* Mini Resume Preview */}
          <div className="absolute inset-0 p-2.5">
            {/* Resume Header */}
            <div className="border-b border-gray-200/70 pb-1.5 mb-1.5">
              <div className="text-[10px] font-medium text-gray-800 truncate">
                {type === 'base' ? resume.target_role : resume.name}
              </div>
              <div className="text-[8px] text-muted-foreground truncate mb-1 flex items-center gap-1">
                {type === 'base' ? (
                  <>
                    <span className={`text-${accentColor.text}`}>Base Resume</span>
                  </>
                ) : (
                  resume.target_role
                )}
              </div>
              <div className="h-1.5 w-16 bg-gray-200/70 rounded-full" />
            </div>

            {/* Resume Content */}
            <div className="space-y-2">
              {/* Experience Section */}
              <div>
                <div className="h-1.5 w-12 bg-gray-300/70 rounded-full mb-1" />
                <div className="space-y-1">
                  <div className="h-1 w-full bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-3/4 bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-5/6 bg-gray-200/70 rounded-full" />
                </div>
              </div>

              {/* Education Section */}
              <div>
                <div className="h-1.5 w-12 bg-gray-300/70 rounded-full mb-1" />
                <div className="space-y-1">
                  <div className="h-1 w-full bg-gray-200/70 rounded-full" />
                  <div className="h-1 w-2/3 bg-gray-200/70 rounded-full" />
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <div className="h-1.5 w-12 bg-gray-300/70 rounded-full mb-1" />
                <div className="flex flex-wrap gap-1">
                  <div className="h-1.5 w-8 bg-gray-200/70 rounded-full" />
                  <div className="h-1.5 w-10 bg-gray-200/70 rounded-full" />
                  <div className="h-1.5 w-6 bg-gray-200/70 rounded-full" />
                  <div className="h-1.5 w-8 bg-gray-200/70 rounded-full" />
                </div>
              </div>
            </div>

            {/* Date at bottom left */}
            <div className="absolute bottom-0 left-0 p-1">
              <p className="text-[8px] text-muted-foreground">
                Updated {formattedDate}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

export function ResumeList({ resumes, title, emptyMessage, type = 'base', accentColor }: ResumeListProps) {
  if (resumes.length === 0) {
    return emptyMessage;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 p-4">
      {resumes.map((resume) => (
        <ResumeListItem key={resume.id} resume={resume} type={type} accentColor={accentColor} />
      ))}
    </div>
  );
} 