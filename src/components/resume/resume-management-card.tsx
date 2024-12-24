import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { CreateResumeDialog } from "./create-resume-dialog";
import { ResumeList } from "./resume-list";
import { Resume } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ResumeManagementCardProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  baseResumes?: Resume[];
  icon: React.ReactNode;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: {
    bg: string;
    border: string;
    hover: string;
    text: string;
  };
}

export function ResumeManagementCard({
  type,
  resumes,
  baseResumes,
  icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
  gradientFrom,
  gradientTo,
  accentColor,
}: ResumeManagementCardProps) {
  const isDisabled = type === 'tailored' && (!baseResumes || baseResumes.length === 0);
  const buttonText = type === 'base' ? 'New Base Resume' : 'New Tailored Resume';

  return (
    <Card className="group relative overflow-hidden border-white/40 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 blur-3xl opacity-20",
          `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`
        )} />
      </div>

      {/* Header Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className={cn(
          "absolute inset-0",
          `bg-gradient-to-r from-${gradientFrom}/5 to-${gradientTo}/5`
        )}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        </div>
        
        {/* Header Content */}
        <div className="relative px-8 py-7 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              `bg-gradient-to-br from-${gradientFrom}/10 to-${gradientTo}/10`,
              `border-${gradientFrom}/10`,
              "group-hover:scale-105"
            )}>
              <div className={`text-${accentColor.text}`}>
                {icon}
              </div>
            </div>
            <div>
              <h2 className={cn(
                "text-xl font-semibold bg-clip-text text-transparent",
                `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`
              )}>
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {description} • <span className="font-medium">{resumes.length} active</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined}>
              <Button 
                variant="outline" 
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  "bg-white/50 hover:bg-white/60",
                  `border-${accentColor.border}`,
                  `hover:border-${accentColor.hover}`,
                  "shadow-sm hover:shadow-md",
                  "transform hover:-translate-y-0.5",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={isDisabled}
              >
                <Plus className={cn(
                  "h-4 w-4 mr-2 transition-transform duration-300",
                  `text-${accentColor.text}`,
                  "group-hover:rotate-90"
                )} />
                {buttonText}
              </Button>
            </CreateResumeDialog>
            <Link 
              href={`/resumes/${type}`}
              className={cn(
                "text-sm hover:underline transition-colors duration-300 flex items-center gap-1",
                `text-${accentColor.text}`
              )}
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-4 bg-white/20">
        <ResumeList 
          resumes={resumes}
          title={title}
          emptyMessage={
            <div className="text-center py-12">
              <div className={cn(
                "mx-auto mb-6",
                "w-20 h-20 rounded-2xl",
                "flex items-center justify-center",
                "transform transition-transform duration-500 hover:scale-110",
                `bg-gradient-to-br from-${gradientFrom}/10 to-${gradientTo}/10`,
                `border border-${gradientFrom}/10`,
                "shadow-lg"
              )}>
                <div className={`text-${accentColor.text} w-10 h-10`}>
                  {icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {emptyTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {emptyDescription}
              </p>
              <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    "bg-white/50 hover:bg-white/60",
                    `border-${accentColor.border}`,
                    `hover:border-${accentColor.hover}`,
                    "shadow-sm hover:shadow-md",
                    "transform hover:-translate-y-0.5",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isDisabled}
                >
                  <Plus className={cn(
                    "h-5 w-5 mr-2 transition-transform duration-300",
                    `text-${accentColor.text}`,
                    "group-hover:rotate-90"
                  )} />
                  {buttonText}
                </Button>
              </CreateResumeDialog>
            </div>
          }
        />
      </div>
    </Card>
  );
} 