import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ message, setMessage, onSubmit, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    onSubmit();
    // Refocus input after sending
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div className="relative px-4 py-3 border-t border-purple-300/40">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask AI for help with your resume..."
          className="flex-1 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-3.5 py-2.5 border border-purple-300/50 
            focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 
            transition-all duration-300 placeholder:text-purple-600/50
            shadow-inner shadow-purple-500/10"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          size="sm"
          disabled={isLoading || !message.trim()}
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white 
            hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 
            shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 
            hover:-translate-y-0.5 rounded-lg px-4 py-2.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
} 