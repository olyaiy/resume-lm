'use client';

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIGenerationSettings } from "../../shared/ai-generation-settings";

interface AIGenerationTooltipProps {
  index: number;
  loadingAI: boolean;
  generateAIPoints: (index: number) => void;
  aiConfig: { numPoints: number; customPrompt: string };
  onNumPointsChange: (value: number) => void;
  onCustomPromptChange: (value: string) => void;
  colorClass: {
    button: string;
    border: string;
    hoverBorder: string;
    hoverBg: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipShadow: string;
    text: string;
    hoverText: string;
  };
}

export function AIGenerationSettingsTooltip({
  index,
  loadingAI,
  generateAIPoints,
  aiConfig,
  onNumPointsChange,
  onCustomPromptChange,
  colorClass
}: AIGenerationTooltipProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAIPoints(index)}
            disabled={loadingAI}
            className={cn(
              "flex-1 transition-colors text-[10px] sm:text-xs",
              colorClass.button,
              colorClass.border,
              colorClass.hoverBorder,
              colorClass.hoverBg,
              colorClass.hoverText
            )}
          >
            {loadingAI ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {loadingAI ? 'Generating...' : 'Write points with AI'}
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          sideOffset={2}
          className={cn(
            "w-72 p-3.5 rounded-lg",
            colorClass.tooltipBg,
            colorClass.tooltipBorder,
            colorClass.tooltipShadow
          )}
        >
          <AIGenerationSettings
            numPoints={aiConfig?.numPoints || 3}
            customPrompt={aiConfig?.customPrompt || ''}
            onNumPointsChange={onNumPointsChange}
            onCustomPromptChange={onCustomPromptChange}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 