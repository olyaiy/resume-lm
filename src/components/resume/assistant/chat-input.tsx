import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AIModel = "gpt-4o" | "claude" | "gemini" | "gpt-4o-mini";

export default function ChatInput({ 
    input, 
    setInput, 
    isLoading, 
    onSubmit,
    onStop,
    model = "gpt-4o-mini",
    onModelChange,
  }: {
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onStop: () => void;
    model?: AIModel;
    onModelChange?: (model: AIModel) => void;
  }) {
    return (
      <form onSubmit={onSubmit} className={cn(
        "relative z-10",
        "p-2 border-t border-purple-200/60",
        "bg-white/40",
        "backdrop-blur-sm",
        "flex gap-1.5"
      )}>
        <Select
          value={model}
          onValueChange={(value) => onModelChange?.(value as AIModel)}
        >
          <SelectTrigger className={cn(
            "w-[100px]",
            "h-8",
            "bg-white/60",
            "border-purple-200/60",
            "focus:border-purple-300",
            "focus:ring-2 focus:ring-purple-500/10",
            "text-sm"
          )}>
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">ChatGPT</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask me anything about your resume..."
          className={cn(
            "flex-1",
            "bg-white/60",
            "border-purple-200/60",
            "focus:border-purple-300",
            "focus:ring-2 focus:ring-purple-500/10",
            "placeholder:text-purple-400",
            "text-sm",
            "h-8",
            "px-2.5 py-1"
          )}
        />
        <Button 
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? onStop : undefined}
          size="sm"
          className={cn(
            isLoading ? [
              "bg-gradient-to-br from-rose-500 to-pink-500",
              "hover:from-rose-600 hover:to-pink-600",
            ] : [
              "bg-gradient-to-br from-purple-500 to-indigo-500",
              "hover:from-purple-600 hover:to-indigo-600",
            ],
            "text-white",
            "border-none",
            "shadow-md shadow-purple-500/10",
            "transition-all duration-300",
            "hover:scale-105 hover:shadow-lg",
            "hover:-translate-y-0.5",
            "px-2 h-8"
          )}
        >
          {isLoading ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    );
}