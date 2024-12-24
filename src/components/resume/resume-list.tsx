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
}

function ResumeListItem({ resume }: { resume: Resume }) {
  const formattedDate = format(new Date(resume.updated_at), 'MMM d, yyyy');

  return (
    <Link 
      href={`/resumes/${resume.id}`}
      className="block group"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-white/40 hover:border-white/60",
        "bg-white/40 hover:bg-white/50",
        "backdrop-blur-sm hover:backdrop-blur-md",
        "shadow-sm hover:shadow-md",
        "transform hover:-translate-y-0.5",
        "aspect-[8.5/11] w-full"
      )}>
        {/* Mini Resume Preview */}
        <div className="absolute inset-0 p-2.5">
          {/* Resume Header */}
          <div className="border-b border-gray-200 pb-1.5 mb-1.5">
            <div className="h-2 w-24 bg-gray-300 rounded-full mb-1" />
            <div className="h-1.5 w-16 bg-gray-200 rounded-full" />
          </div>

          {/* Resume Content */}
          <div className="space-y-2">
            {/* Experience Section */}
            <div>
              <div className="h-1.5 w-12 bg-gray-300 rounded-full mb-1" />
              <div className="space-y-1">
                <div className="h-1 w-full bg-gray-200 rounded-full" />
                <div className="h-1 w-3/4 bg-gray-200 rounded-full" />
                <div className="h-1 w-5/6 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Education Section */}
            <div>
              <div className="h-1.5 w-12 bg-gray-300 rounded-full mb-1" />
              <div className="space-y-1">
                <div className="h-1 w-full bg-gray-200 rounded-full" />
                <div className="h-1 w-2/3 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <div className="h-1.5 w-12 bg-gray-300 rounded-full mb-1" />
              <div className="flex flex-wrap gap-1">
                <div className="h-1.5 w-8 bg-gray-200 rounded-full" />
                <div className="h-1.5 w-10 bg-gray-200 rounded-full" />
                <div className="h-1.5 w-6 bg-gray-200 rounded-full" />
                <div className="h-1.5 w-8 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>

          {/* Resume Overlay */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300",
            "bg-white/80 backdrop-blur-sm flex items-center justify-center"
          )}>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 flex items-center justify-center gap-1">
                {resume.name}
                <ArrowUpRight className="h-3 w-3" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updated {formattedDate}
              </p>
            </div>
          </div>

          {/* Resume Type Badge */}
          <div className={cn(
            "absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] rounded-full",
            resume.is_base_resume
              ? "bg-purple-50 text-purple-600"
              : "bg-pink-50 text-pink-600"
          )}>
            {resume.is_base_resume ? "Base" : "Tailored"}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ResumeList({ resumes, title, emptyMessage }: ResumeListProps) {
  if (resumes.length === 0) {
    return emptyMessage;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {resumes.map((resume) => (
        <ResumeListItem key={resume.id} resume={resume} />
      ))}
    </div>
  );
} 