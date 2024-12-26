'use client';

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AIGenerationSettingsProps {
  numPoints: number;
  customPrompt: string;
  onNumPointsChange: (value: number) => void;
  onCustomPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  promptPlaceholder?: string;
}

export function AIGenerationSettings({
  numPoints,
  customPrompt,
  onNumPointsChange,
  onCustomPromptChange,
  onGenerate,
  isLoading,
  promptPlaceholder = "e.g., Focus on scalability and performance optimizations"
}: AIGenerationSettingsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isLoading}
            className={cn(
              "flex-1 text-purple-600 hover:text-purple-700 transition-colors text-[11px] md:text-xs",
              "border-purple-200 hover:border-purple-300 hover:bg-purple-50/50"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {isLoading ? 'Generating...' : 'Write points with AI'}
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          sideOffset={2}
          className={cn(
            "w-72 p-3.5",
            "bg-purple-50",
            "border-2 border-purple-300",
            "shadow-lg shadow-purple-100/50",
            "rounded-lg"
          )}
        >
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center gap-2 pb-0.5">
              <div className="p-1 rounded-md bg-purple-100 text-purple-600">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-purple-700">AI Generation Settings</span>
            </div>

            {/* Number of Suggestions */}
            <div>
              <Label className="text-[11px] font-medium text-purple-700">Points to Generate</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={numPoints}
                onChange={(e) => onNumPointsChange(parseInt(e.target.value) || 3)}
                className={cn(
                  "h-7 mt-0.5",
                  "bg-white",
                  "border-purple-200",
                  "focus:border-purple-400 focus:ring-1 focus:ring-purple-300",
                  "hover:bg-white",
                  "text-purple-900 text-xs"
                )}
              />
            </div>

            {/* Custom Focus */}
            <div>
              <Label className="text-[11px] font-medium text-purple-700">Prompt for AI (Optional)</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => onCustomPromptChange(e.target.value)}
                placeholder={promptPlaceholder}
                className={cn(
                  "h-14 mt-0.5 text-xs",
                  "bg-white",
                  "border-purple-200",
                  "focus:border-purple-400 focus:ring-1 focus:ring-purple-300",
                  "hover:bg-white",
                  "resize-none",
                  "text-purple-900 placeholder:text-purple-400"
                )}
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 