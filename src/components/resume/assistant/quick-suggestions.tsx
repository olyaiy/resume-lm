import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Star, Briefcase, FileSearch } from "lucide-react";

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    text: "Rate my Resume out of 10",
    icon: Star,
  },
  {
    text: "Improve the work experience section",
    icon: Briefcase,
  },
  {
    text: "Critique my resume",
    icon: FileSearch,
  },
];

export function QuickSuggestions({ onSuggestionClick }: QuickSuggestionsProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-purple-500" />
        <p className="text-sm text-purple-500">
          Try one of these
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-[600px]">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={suggestion.text}
              variant="ghost"
              onClick={() => onSuggestionClick(suggestion.text)}
              className={cn(
                "h-9 px-3",
                "bg-white/40",
                "text-purple-700 text-sm",
                "border border-purple-100",
                "hover:bg-purple-50/60 hover:border-purple-200",
                "transition-colors"
              )}
            >
              <Icon className="mr-2 h-3.5 w-3.5" />
              {suggestion.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
} 