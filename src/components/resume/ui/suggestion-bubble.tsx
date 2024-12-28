'use client';

import { Check, X } from "lucide-react";

import { ResumeSuggestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface SuggestionBubbleProps {
  suggestion: ResumeSuggestion;
  onAccept: (suggestion: ResumeSuggestion) => void;
  onReject: (suggestion: ResumeSuggestion) => void;
}

export function SuggestionBubble({ suggestion, onAccept, onReject }: SuggestionBubbleProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-purple-50/80 border border-purple-200/60">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-purple-700">
          Suggested {suggestion.type} for {suggestion.section}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-green-100"
            onClick={() => onAccept(suggestion)}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-100"
            onClick={() => onReject(suggestion)}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-purple-800">
        <p className="font-medium mb-1">Reason:</p>
        <p className="text-purple-700/90">{suggestion.reason}</p>
      </div>
      {suggestion.type === 'update' && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs font-medium text-purple-600 mb-1">Original</p>
            <pre className="text-xs bg-white/50 p-2 rounded border border-purple-100">
              {JSON.stringify(suggestion.original, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-purple-600 mb-1">Proposed</p>
            <pre className="text-xs bg-white/50 p-2 rounded border border-purple-100">
              {JSON.stringify(suggestion.proposed, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 