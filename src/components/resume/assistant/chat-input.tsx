import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useCallback } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop: () => void;
}

export default function ChatInput({ 
    isLoading, 
    onSubmit,
    onStop,
  }: ChatInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        console.log('Original input:', JSON.stringify(inputValue));
        console.log('Input length:', inputValue.length);
        console.log('Last char code:', inputValue.charCodeAt(inputValue.length - 1));
        
        const cleanedMessage = inputValue.replace(/\n+$/, '').trim();
        console.log('Cleaned message:', JSON.stringify(cleanedMessage));
        console.log('Cleaned length:', cleanedMessage.length);
        console.log('Last cleaned char code:', cleanedMessage.charCodeAt(cleanedMessage.length - 1));
        
        onSubmit(cleanedMessage);
        setInputValue("");
      }
    }, [inputValue, onSubmit]);

    return (
      <form onSubmit={handleSubmit} className={cn(
        "relative z-10",
        "p-1 border-t border-purple-200/60",
        "bg-white/40",
        "backdrop-blur-sm",
        "flex gap-1.5"
      )}>
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask me anything about your resume..."
          className={cn(
            "flex-1",
            "bg-white/60",
            "border-purple-200/60",
            "focus:border-purple-300",
            "focus:ring-2 focus:ring-purple-500/10",
            "placeholder:text-purple-400",
            "text-sm",
            "h-full",
            "px-2 py-0.5"
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