'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";
import { WorkExperience, Project, Skill, Education } from "@/lib/types";
import { useState } from 'react';

const DIFF_HIGHLIGHT_CLASSES = "bg-green-300 px-1  rounded-sm";

type SuggestionContent = WorkExperience | Project | Skill | Education;

interface SuggestionProps {
  type: 'work_experience' | 'project' | 'skill' | 'education';
  content: SuggestionContent;
  currentContent: SuggestionContent | null;
  onAccept: () => void;
  onReject: () => void;
}


function compareDescriptions(current: string, suggested: string): {
  text: string;
  isNew: boolean;
  isBold: boolean;
  isStart: boolean;
  isEnd: boolean;
}[] {
  const splitText = (text: string): string[] => {
    return text.match(/\*\*[^*]+\*\*|\S+/g) || [];
  };

  const currentWords = splitText(current);
  const suggestedWords = splitText(suggested);
  
  const result = suggestedWords.map((word, index) => {
    const isNew = !currentWords.includes(word);
    const prevIsNew = index > 0 ? !currentWords.includes(suggestedWords[index - 1]) : false;
    const nextIsNew = index < suggestedWords.length - 1 ? !currentWords.includes(suggestedWords[index + 1]) : false;
    
    return {
      text: word,
      isNew,
      isBold: word.startsWith('**') && word.endsWith('**'),
      isStart: isNew && !prevIsNew,
      isEnd: isNew && !nextIsNew
    };
  });

  return result;
}
  

function isNewItem<T>(current: T[] | undefined, suggested: T[] | undefined, item: T): boolean {
  if (!current) return true;
  return !current.includes(item);
}

// const renderBoldText = (text: string) => {
//   return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
//     if (part.startsWith('**') && part.endsWith('**')) {
//       return <strong key={index}>{part.slice(2, -2)}</strong>;
//     }
//     return part;
//   });
// };

export function Suggestion({ type, content, currentContent, onAccept, onReject }: SuggestionProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const handleAccept = () => {
    setStatus('accepted');
    onAccept();
  };

  const handleReject = () => {
    setStatus('rejected');
    onReject();
  };

  // Helper function to get status-based styles
  const getStatusStyles = () => {
    switch (status) {
      case 'accepted':
        return {
          card: "bg-gradient-to-br from-emerald-200/95 via-emerald-200/90 to-green-200/95 border-emerald-200/60",
          icon: "from-emerald-100/90 to-green-100/90",
          iconColor: "text-emerald-600",
          label: "text-emerald-600",
          text: "Accepted"
        };
      case 'rejected':
        return {
          card: "bg-gradient-to-br from-rose-50/95 via-rose-50/90 to-red-50/95 border-rose-200/60",
          icon: "from-rose-100/90 to-red-100/90",
          iconColor: "text-rose-600",
          label: "text-rose-600",
          text: "Rejected"
        };
      default:
        return {
          card: "bg-gradient-to-br from-white/95 via-purple-50/30 to-indigo-50/40 border-white/60",
          icon: "from-purple-100/90 to-indigo-100/90",
          iconColor: "text-purple-600",
          label: "text-gray-900",
          text: "AI Suggestion"
        };
    }
  };

  const statusStyles = getStatusStyles();

  // Helper function to render content based on type
  const renderContent = () => {
    switch (type) {
      case 'work_experience':
        const work = content as WorkExperience;
        const currentWork = currentContent as WorkExperience | null;
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "text-base font-bold text-gray-900",
                  !currentWork || currentWork.position !== work.position && DIFF_HIGHLIGHT_CLASSES
                )}>
                  {work.position}
                </h3>
                <p className={cn(
                  "text-xs text-gray-700",
                  !currentWork || currentWork.company !== work.company && DIFF_HIGHLIGHT_CLASSES
                )}>
                  {work.company}
                </p>
              </div>
              <span className={cn(
                "text-[10px] text-gray-600",
                !currentWork || currentWork.date !== work.date && DIFF_HIGHLIGHT_CLASSES
              )}>
                {work.date}
              </span>
            </div>
            <div className="space-y-1.5">
              {work.description.map((point, index) => {
                const currentPoint = currentWork?.description?.[index];
                const comparedWords = currentPoint 
                  ? compareDescriptions(currentPoint, point)
                  : [{ text: point, isNew: true, isBold: false, isStart: true, isEnd: true }];

                return (
                  <div key={index} className="flex items-start gap-1.5">
                    <span className="text-gray-800 mt-0.5 text-xs">•</span>
                    <p className="text-xs text-gray-800 flex-1">
                      {comparedWords.map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className={cn(
                            word.isNew && "bg-green-300",
                            word.isStart && "rounded-l-sm pl-1",
                            word.isEnd && "rounded-r-sm pr-1"
                          )}
                        >
                          {word.isBold ? (
                            <strong>{word.text.slice(2, -2)}</strong>
                          ) : (
                            word.text
                          )}
                          {' '}
                        </span>
                      ))}
                    </p>
                  </div>
                );
              })}
            </div>
              {/* COMMENTING FOR NOW, DO NOT REMOVE */}
            {/* {work.technologies && (
              <div className="flex flex-wrap gap-1 mt-1">
                {work.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] rounded-full border text-gray-700",
                      !currentWork || isNewItem(currentWork.technologies, work.technologies, tech)
                        ? DIFF_HIGHLIGHT_CLASSES
                        : "bg-gray-100/80 border-gray-200/60"
                    )}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )} */}
          </div>
        );

      case 'project':
        const project = content as Project;
        const currentProject = currentContent as Project | null;
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className={cn(
                "text-lg font-bold text-gray-900",
                !currentProject || currentProject.name !== project.name && DIFF_HIGHLIGHT_CLASSES
              )}>
                {project.name}
              </h3>
              {project.date && (
                <span className={cn(
                  "text-xs text-gray-600",
                  !currentProject || currentProject.date !== project.date && DIFF_HIGHLIGHT_CLASSES
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
                    !currentProject || isNewItem(currentProject.description, project.description, point) && DIFF_HIGHLIGHT_CLASSES
                  )}
                >
                  <span className="text-gray-800 mt-1">•</span>
                  <p className="text-sm text-gray-800 flex-1">
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
                      "px-2 py-0.5 text-xs rounded-full border text-gray-700",
                      !currentProject || isNewItem(currentProject.technologies, project.technologies, tech)
                        ? DIFF_HIGHLIGHT_CLASSES
                        : "bg-gray-100/80 border-gray-200/60"
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
              "font-medium text-gray-900",
              !currentSkill || currentSkill.category !== skill.category && DIFF_HIGHLIGHT_CLASSES
            )}>
              {skill.category}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skill.items.map((item, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full border text-gray-700",
                    !currentSkill || isNewItem(currentSkill.items, skill.items, item)
                      ? DIFF_HIGHLIGHT_CLASSES
                      : "bg-gray-100/80 border-gray-200/60"
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
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn(
                  "font-medium text-gray-900",
                  !currentEducation || (currentEducation.degree !== education.degree || currentEducation.field !== education.field) && DIFF_HIGHLIGHT_CLASSES
                )}>
                  {education.degree} in {education.field}
                </h3>
                <p className={cn(
                  "text-sm text-gray-700",
                  !currentEducation || currentEducation.school !== education.school && DIFF_HIGHLIGHT_CLASSES
                )}>
                  {education.school}
                </p>
              </div>
              <span className={cn(
                "text-xs text-gray-600",
                !currentEducation || currentEducation.date !== education.date && DIFF_HIGHLIGHT_CLASSES
              )}>
                {education.date}
              </span>
            </div>
            {education.achievements && (
              <div className="space-y-1.5">
                {education.achievements.map((achievement, index) => {
                  const currentAchievement = currentEducation?.achievements?.[index];
                  const comparedWords = currentAchievement
                    ? compareDescriptions(currentAchievement, achievement)
                    : [{ text: achievement, isNew: true, isBold: false, isStart: true, isEnd: true }];

                  return (
                    <div key={index} className="flex items-start gap-1.5">
                      <span className="text-gray-800 mt-0.5 text-xs">•</span>
                      <p className="text-xs text-gray-800 flex-1">
                        {comparedWords.map((word, wordIndex) => (
                          <span
                            key={wordIndex}
                            className={cn(
                              word.isNew && "bg-green-300",
                              word.isStart && "rounded-l-sm pl-1",
                              word.isEnd && "rounded-r-sm pr-1"
                            )}
                          >
                            {word.isBold ? (
                              <strong>{word.text.slice(2, -2)}</strong>
                            ) : (
                              word.text
                            )}
                            {' '}
                          </span>
                        ))}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "border ",
      statusStyles.card,
      "shadow-xl shadow-purple-500/10",
      "transition-all duration-500 ease-in-out",
      "hover:shadow-2xl hover:shadow-purple-500/20",
      "backdrop-blur-xl"
    )}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0  opacity-[0.15]" />
      
      {/* Improved Floating Gradient Orbs */}

      {/* Content */}
      <div className="relative ">
        {/* Header */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg  shadow-sm", statusStyles.icon)}>
              <Sparkles className={cn("h-3.5 w-3.5", statusStyles.iconColor)} />
            </div>
            <span className={cn("font-semibold text-sm", statusStyles.label)}>{statusStyles.text}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white from-white/80 to-white/60 rounded-lg p-3 backdrop-blur-md border border-white/60 shadow-sm">
          {renderContent()}
        </div>

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex justify-end gap-2 pt-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              className={cn(
                "h-8 px-3 text-xs",
                "bg-gradient-to-br from-rose-50/90 to-rose-100/90",
                "text-gray-900",
                "border border-rose-200/40 hover:border-rose-300/60",
                "shadow-sm hover:shadow",
                "transition-all duration-300",
                "hover:scale-[1.02] hover:-translate-y-0.5",
                "font-medium"
              )}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAccept}
              className={cn(
                "h-8 px-3 text-xs",
                "bg-gradient-to-br from-emerald-50/90 to-emerald-100/90",
                "text-gray-900",
                "border border-emerald-200/40 hover:border-emerald-300/60",
                "shadow-sm hover:shadow",
                "transition-all duration-300",
                "hover:scale-[1.02] hover:-translate-y-0.5",
                "font-medium"
              )}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Accept
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
