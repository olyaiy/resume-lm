'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import Tiptap from "@/components/ui/tiptap";

interface AISuggestion {
  id: string;
  point: string;
}

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApprove: (suggestion: AISuggestion) => void;
  onDelete: (suggestionId: string) => void;
}

export function AISuggestions({ suggestions, onApprove, onDelete }: AISuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn(
      "relative group/suggestions",
      "p-6 mt-4",
      "rounded-xl",
      "bg-gradient-to-br from-purple-50/95 via-purple-50/90 to-indigo-50/95",
      "border border-purple-200/60",
      "shadow-lg shadow-purple-500/5",
      "transition-all duration-500",
      "hover:shadow-xl hover:shadow-purple-500/10",
      "overflow-hidden"
    )}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70" />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-purple-100/80 text-purple-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-purple-600">AI Suggestions</span>
        </div>
        
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className={cn(
                "group/item relative",
                "animate-in fade-in-50 duration-500",
                "transition-all"
              )}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <Tiptap
                    content={suggestion.point}
                    onChange={() => {}}
                    readOnly={true}
                    className={cn(
                      "min-h-[80px] text-sm",
                      "bg-white/60",
                      "border-purple-200/60",
                      "text-purple-900",
                      "focus:border-purple-300/60 focus:ring-2 focus:ring-purple-500/10",
                      "placeholder:text-purple-400",
                      "transition-all duration-300",
                      "hover:bg-white/80"
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onApprove(suggestion)}
                    className={cn(
                      "h-9 w-9",
                      "bg-green-100/80 hover:bg-green-200/80",
                      "text-green-600 hover:text-green-700",
                      "border border-green-200/60",
                      "shadow-sm",
                      "transition-all duration-300",
                      "hover:scale-105 hover:shadow-md",
                      "hover:-translate-y-0.5"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(suggestion.id)}
                    className={cn(
                      "h-9 w-9",
                      "bg-rose-100/80 hover:bg-rose-200/80",
                      "text-rose-600 hover:text-rose-700",
                      "border border-rose-200/60",
                      "shadow-sm",
                      "transition-all duration-300",
                      "hover:scale-105 hover:shadow-md",
                      "hover:-translate-y-0.5"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 