import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";

import { ResumeList } from "./resume-list";
import { Resume } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Profile } from "@/lib/types";
import { CreateResumeDialog } from "../dialogs/create-resume-dialog";

interface ResumeManagementCardProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  baseResumes?: Resume[];
  profile: Profile;
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
  profile,
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
    <Card className={cn(
      "group relative overflow-hidden",
      "border-2",
      `border-${accentColor.border}/40`,
      "shadow-xl backdrop-blur-xl hover:shadow-2xl",
      "transition-all duration-500",
      "rounded-xl"
    )}>
      {/* Multi-layered animated gradient background */}
      <div className="absolute inset-0 overflow-hidden rounded-[0.65rem]">
        {/* Primary gradient layer */}
        <div className={cn(
          "absolute inset-0 blur-3xl opacity-10 transition-opacity duration-500",
          `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`,
          "group-hover:opacity-20"
        )} />
        
        {/* Secondary floating orbs */}
        <div className={cn(
          "absolute -inset-[100%] opacity-30",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]",
          "animate-[spin_8s_linear_infinite]"
        )} />
        <div className={cn(
          "absolute -inset-[100%] opacity-20",
          `bg-[radial-gradient(circle_at_70%_30%,${gradientFrom}15_0%,transparent_50%)]`,
          "animate-[spin_9s_linear_infinite]"
        )} />
      </div>

      {/* Header Section */}
      <div className={cn(
        "relative",
        "border-b",
        `border-${accentColor.border}/20`
      )}>
        {/* Background Pattern */}
        <div className={cn(
          "absolute inset-0",
          `bg-gradient-to-r from-${gradientFrom}/5 to-${gradientTo}/5`
        )}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-20" />
        </div>
        
        {/* Header Content */}
        <div className="relative px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl border transition-all duration-300",
              `bg-gradient-to-br from-${gradientFrom}/5 via-${gradientTo}/10 to-${gradientFrom}/5`,
              `border-${accentColor.border}/30`,
              "group-hover:scale-105 group-hover:rotate-3",
              `shadow-lg shadow-${gradientFrom}/5`
            )}>
              <div className={cn(
                `text-${accentColor.text}`,
                "transition-transform duration-300 group-hover:scale-110",
                "w-4 h-4"
              )}>
                {icon}
              </div>
            </div>
            <div>
              <h2 className={cn(
                "text-base font-semibold bg-clip-text text-transparent",
                `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`,
                "tracking-tight"
              )}>
                {title}
              </h2>
              <p className="text-xs text-muted-foreground/80 mt-1 font-medium">
                {description} • <span className="font-semibold">{resumes.length} active</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined} profile={profile}>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  "bg-gradient-to-br from-white/70 to-white/50",
                  `border-${accentColor.border}/40`,
                  `hover:border-${accentColor.hover}`,
                  "shadow-lg hover:shadow-xl",
                  "transform hover:-translate-y-0.5",
                  "h-8 text-xs",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={isDisabled}
              >
                <Plus className={cn(
                  "h-3.5 w-3.5 mr-1.5 transition-transform duration-300",
                  `text-${accentColor.text}`,
                  "group-hover:rotate-90"
                )} />
                <span className="font-medium">{buttonText}</span>
              </Button>
            </CreateResumeDialog>
            <Link 
              href={`/resumes`}
              className={cn(
                "text-xs font-medium transition-colors duration-300 flex items-center gap-1",
                `text-${accentColor.text}/80 hover:text-${accentColor.text}`,
                "group/link"
              )}
            >
              View all 
              <ChevronRight className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                "group-hover/link:translate-x-0.5"
              )} />
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative flex flex-col">
        <div className={cn(
          "relative flex-1 overflow-y-auto scrollbar-thin",
          "scrollbar-thumb-white/20 scrollbar-track-transparent",
          "px-3 py-4 bg-gradient-to-b from-white/30 to-white/20"
        )}>
          <ResumeList 
            resumes={resumes}
            title={title}
            type={type}
            accentColor={accentColor}
            className={cn(
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
              "auto-rows-[minmax(120px,1fr)]",
              "gap-3 pb-2"
            )}
            itemClassName={cn(
              "w-full aspect-[8.5/11]",
              "border rounded-lg",
              `border-${accentColor.border}/30`,
              "transition-all duration-300",
              "hover:border-opacity-50",
              "hover:shadow-lg hover:-translate-y-0.5"
            )}
            emptyMessage={
              <div className="col-span-full flex items-center justify-center min-h-[240px]">
                <div className="text-center max-w-md mx-auto px-4">
                  <div className={cn(
                    "mx-auto mb-4",
                    "w-12 h-12 rounded-xl",
                    "flex items-center justify-center",
                    "transform transition-transform duration-500 hover:scale-110 hover:rotate-3",
                    `bg-gradient-to-br from-${gradientFrom}/10 via-white/10 to-${gradientTo}/10`,
                    `border border-${accentColor.border}/30`,
                    "shadow-xl"
                  )}>
                    <div className={cn(
                      `text-${accentColor.text}`,
                      "w-6 h-6 transition-transform duration-300 hover:scale-110"
                    )}>
                      {icon}
                    </div>
                  </div>
                  <h3 className={cn(
                    "text-base font-semibold mb-2",
                    "bg-clip-text text-transparent",
                    `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`
                  )}>
                    {emptyTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground/80 mb-4 leading-relaxed">
                    {emptyDescription}
                  </p>
                  <CreateResumeDialog type={type} baseResumes={type === 'tailored' ? baseResumes : undefined} profile={profile}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        "relative overflow-hidden transition-all duration-300",
                        "bg-gradient-to-br from-white/70 to-white/50",
                        `border-${accentColor.border}/40`,
                        `hover:border-${accentColor.hover}`,
                        "shadow-lg hover:shadow-xl",
                        "transform hover:-translate-y-0.5",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isDisabled}
                    >
                      <Plus className={cn(
                        "h-4 w-4 mr-1.5 transition-transform duration-300",
                        `text-${accentColor.text}`,
                        "group-hover:rotate-90"
                      )} />
                      <span className="font-medium">{buttonText}</span>
                    </Button>
                  </CreateResumeDialog>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </Card>
  );
} 