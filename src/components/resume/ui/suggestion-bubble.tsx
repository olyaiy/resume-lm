'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkExperience } from "@/lib/types";
import { Check, X } from "lucide-react";
import { memo } from 'react';

interface SuggestionBubbleProps {
  suggestion: WorkExperience;
  suggestionStatus?: 'accepted' | 'rejected' | 'waiting' | 'no';
  onAccept: () => void;
  onReject: () => void;
}

// Custom comparison function for memoization
function arePropsEqual(
  prevProps: SuggestionBubbleProps,
  nextProps: SuggestionBubbleProps
) {
  return (
    prevProps.suggestionStatus === nextProps.suggestionStatus &&
    prevProps.onAccept === nextProps.onAccept &&
    prevProps.onReject === nextProps.onReject &&
    JSON.stringify(prevProps.suggestion) === JSON.stringify(nextProps.suggestion)
  );
}

export const SuggestionBubble = memo(function SuggestionBubble({
  suggestion,
  suggestionStatus = 'waiting',
  onAccept,
  onReject
}: SuggestionBubbleProps) {
  const statusStyles = {
    accepted: "bg-gradient-to-r from-green-50/40 to-transparent ring-1 ring-green-200/50",
    rejected: "bg-gradient-to-r from-red-50/40 to-transparent ring-1 ring-red-200/50 opacity-90",
    waiting: "bg-gradient-to-r from-purple-50/40 to-transparent ring-1 ring-purple-200/50",
    no: ""
  }[suggestionStatus];

  const renderStatusIndicator = () => {
    if (suggestionStatus === 'waiting') return null;
    
    const indicatorStyles = {
      accepted: {
        wrapper: "bg-green-100/80 text-green-600",
        icon: Check,
      },
      rejected: {
        wrapper: "bg-red-100/80 text-red-600",
        icon: X,
      },
      no: {
        wrapper: "",
        icon: null,
      }
    }[suggestionStatus];

    if (!indicatorStyles.icon) return null;

    const Icon = indicatorStyles.icon;
    
    return (
      <div className="flex gap-1 justify-end mt-2">
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm",
          indicatorStyles.wrapper
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  };

  const renderActionButtons = () => {
    if (suggestionStatus !== 'waiting') return null;

    return (
      <div className="flex gap-1 justify-end mt-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full bg-white/90 text-purple-600 shadow-sm backdrop-blur-sm"
          onClick={onAccept}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full bg-white/90 text-purple-600 shadow-sm backdrop-blur-sm"
          onClick={onReject}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className={cn(
        "p-3 rounded-xl transition-colors duration-300 backdrop-blur-sm",
        statusStyles
      )}>
        <div className="flex justify-between items-baseline gap-2">
          <h3 className={cn(
            "font-medium text-sm",
            suggestionStatus === 'accepted' ? "text-green-700" : 
            suggestionStatus === 'rejected' ? "text-red-700" : 
            "text-purple-700"
          )}>
            {suggestion.position}
          </h3>
          <span className={cn(
            "text-xs whitespace-nowrap",
            suggestionStatus === 'accepted' ? "text-green-600/90" : 
            suggestionStatus === 'rejected' ? "text-red-600/90" : 
            "text-purple-600/90"
          )}>
            {suggestion.date}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 text-xs mt-1">
          <span className={cn(
            "font-medium",
            suggestionStatus === 'accepted' ? "text-green-600" : 
            suggestionStatus === 'rejected' ? "text-red-600" : 
            "text-purple-600"
          )}>
            {suggestion.company}
          </span>
          {suggestion.location && (
            <span className={cn(
              suggestionStatus === 'accepted' ? "text-green-500/90" : 
              suggestionStatus === 'rejected' ? "text-red-500/90" : 
              "text-purple-500/90"
            )}>
              • {suggestion.location}
            </span>
          )}
        </div>

        <ul className="list-disc pl-4 mt-2 space-y-1">
          {suggestion.description.map((desc, i) => (
            <li key={i} className={cn(
              "text-xs leading-relaxed",
              suggestionStatus === 'accepted' ? "text-green-700/90" : 
              suggestionStatus === 'rejected' ? "text-red-700/90" : 
              "text-purple-700/90"
            )}>
              {desc}
            </li>
          ))}
        </ul>

        {suggestion.technologies && (
          <div className="flex flex-wrap gap-1 mt-2">
            {suggestion.technologies.map((tech, i) => (
              <span 
                key={i} 
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm",
                  suggestionStatus === 'accepted' 
                    ? "bg-green-100/50 text-green-700 ring-1 ring-green-200/50" : 
                  suggestionStatus === 'rejected'
                    ? "bg-red-100/50 text-red-700 ring-1 ring-red-200/50" :
                    "bg-purple-100/50 text-purple-700 ring-1 ring-purple-200/50"
                )}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        {renderActionButtons()}
        {renderStatusIndicator()}
      </div>
    </div>
  );
}, arePropsEqual); 