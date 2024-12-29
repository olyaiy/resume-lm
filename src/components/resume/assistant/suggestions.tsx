'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { WorkExperience, Project, Skill, Education } from "@/lib/types";

type SuggestionContent = WorkExperience | Project | Skill | Education;

interface SuggestionProps {
  type: 'work_experience' | 'project' | 'skill' | 'education';
  content: SuggestionContent;
  currentContent: SuggestionContent | null;
  onAccept: () => void;
  onReject: () => void;
}

function isNewItem<T>(current: T[] | undefined, suggested: T[] | undefined, item: T): boolean {
  if (!current) return true;
  return !current.includes(item);
}

export function Suggestion({ type, content, currentContent, onAccept, onReject }: SuggestionProps) {
  // Helper function to render content based on type
  const renderContent = () => {
    switch (type) {
      case 'work_experience':
        const work = content as WorkExperience;
        const currentWork = currentContent as WorkExperience | null;
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "text-lg font-bold text-purple-900",
                  !currentWork || currentWork.position !== work.position && 
                    "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
                )}>
                  {work.position}
                </h3>
                <p className={cn(
                  "text-sm text-purple-700 mt-0.5",
                  !currentWork || currentWork.company !== work.company && 
                    "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
                )}>
                  {work.company}
                </p>
              </div>
              <span className={cn(
                "text-xs text-purple-600",
                !currentWork || currentWork.date !== work.date && 
                  "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
              )}>
                {work.date}
              </span>
            </div>
            <div className="space-y-2">
              {work.description.map((point, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-start gap-2",
                    !currentWork || isNewItem(currentWork.description, work.description, point) &&
                      "bg-green-100/50 px-2 py-1 rounded-md border border-green-100/50"
                  )}
                >
                  <span className="text-purple-800 mt-1">•</span>
                  <p className="text-sm text-purple-800 flex-1">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            {work.technologies && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {work.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full border text-purple-700",
                      !currentWork || isNewItem(currentWork.technologies, work.technologies, tech)
                        ? "bg-green-100/80 border-green-200/60"
                        : "bg-purple-100/80 border-purple-200/60"
                    )}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'project':
        const project = content as Project;
        const currentProject = currentContent as Project | null;
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className={cn(
                "text-lg font-bold text-purple-900",
                !currentProject || currentProject.name !== project.name && 
                  "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
              )}>
                {project.name}
              </h3>
              {project.date && (
                <span className={cn(
                  "text-xs text-purple-600",
                  !currentProject || currentProject.date !== project.date && 
                    "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
                )}>
                  {project.date}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {project.description.map((point, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-start gap-2",
                    !currentProject || isNewItem(currentProject.description, project.description, point) &&
                      "bg-green-100/50 px-2 py-1 rounded-md border border-green-100/50"
                  )}
                >
                  <span className="text-purple-800 mt-1">•</span>
                  <p className="text-sm text-purple-800 flex-1">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            {project.technologies && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full border text-purple-700",
                      !currentProject || isNewItem(currentProject.technologies, project.technologies, tech)
                        ? "bg-green-100/80 border-green-200/60"
                        : "bg-purple-100/80 border-purple-200/60"
                    )}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'skill':
        const skill = content as Skill;
        const currentSkill = currentContent as Skill | null;
        return (
          <div className="space-y-2">
            <h3 className={cn(
              "font-medium text-purple-900",
              !currentSkill || currentSkill.category !== skill.category && 
                "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
            )}>
              {skill.category}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skill.items.map((item, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full border text-purple-700",
                    !currentSkill || isNewItem(currentSkill.items, skill.items, item)
                      ? "bg-green-100/80 border-green-200/60"
                      : "bg-purple-100/80 border-purple-200/60"
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );

      case 'education':
        const education = content as Education;
        const currentEducation = currentContent as Education | null;
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "font-medium text-purple-900",
                  !currentEducation || (currentEducation.degree !== education.degree || currentEducation.field !== education.field) &&
                    "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
                )}>
                  {education.degree} in {education.field}
                </h3>
                <p className={cn(
                  "text-sm text-purple-700",
                  !currentEducation || currentEducation.school !== education.school && 
                    "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
                )}>
                  {education.school}
                </p>
              </div>
              <span className={cn(
                "text-xs text-purple-600",
                !currentEducation || currentEducation.date !== education.date && 
                  "bg-green-100/50 px-2 py-0.5 rounded-md border border-green-100/50"
              )}>
                {education.date}
              </span>
            </div>
            {education.achievements && (
              <div className="space-y-1.5">
                {education.achievements.map((achievement, index) => (
                  <p 
                    key={index} 
                    className={cn(
                      "text-sm text-purple-800",
                      !currentEducation || isNewItem(currentEducation.achievements, education.achievements, achievement) &&
                        "bg-green-100/50 px-2 py-1 rounded-md border border-green-100/50"
                    )}
                  >
                    {achievement}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "p-4",
      "bg-gradient-to-br from-purple-50/95 via-purple-50/90 to-indigo-50/95",
      "border-2 border-purple-200/60",
      "shadow-lg shadow-purple-500/5",
      "transition-all duration-500",
      "hover:shadow-xl hover:shadow-purple-500/10"
    )}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100/80 text-purple-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-purple-600">AI Suggestion</span>
        </div>

        {/* Main Content */}
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm border border-purple-200/60">
          {renderContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReject}
            className={cn(
              "h-9",
              "bg-rose-100/80 hover:bg-rose-200/80",
              "text-rose-600 hover:text-rose-700",
              "border border-rose-200/60",
              "shadow-sm",
              "transition-all duration-300",
              "hover:scale-105 hover:shadow-md",
              "hover:-translate-y-0.5"
            )}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAccept}
            className={cn(
              "h-9",
              "bg-green-100/80 hover:bg-green-200/80",
              "text-green-600 hover:text-green-700",
              "border border-green-200/60",
              "shadow-sm",
              "transition-all duration-300",
              "hover:scale-105 hover:shadow-md",
              "hover:-translate-y-0.5"
            )}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </div>
      </div>
    </Card>
  );
}
