import { useState } from "react";
import { Sparkles, ChevronUp, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className={cn("mt-4 px-4", className)}>
      <div className="relative rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-fuchsia-500/5 to-pink-500/5" />
        
        {/* Header - Always Visible */}
        <button 
          onClick={() => setIsExpanded(prev => !prev)}
          className="relative w-full flex items-center gap-3 p-3 hover:bg-white/20 transition-colors duration-200"
        >
          <div className="p-1.5 rounded-xl bg-gradient-to-r from-purple-100/80 to-fuchsia-100/80">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">AI Resume Assistant</div>
            <p className="text-xs text-muted-foreground">Let AI help you craft the perfect resume</p>
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded ? "rotate-0" : "rotate-180"
          )} />
        </button>

        {/* Chat Area - Expandable */}
        <div className={cn(
          "relative transition-all duration-200 ease-in-out",
          isExpanded ? "h-[400px]" : "h-0"
        )}>
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-4">
              {/* Chat messages will go here */}
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Chat messages will appear here
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Bar - Always Visible */}
        <div className="relative p-3 border-t border-purple-200/30">
          <form className="flex gap-2" onSubmit={(e) => {
            e.preventDefault();
            // Handle message submit
          }}>
            <input
              type="text"
              placeholder="Ask AI for help with your resume..."
              className="flex-1 bg-white/60 backdrop-blur-sm text-sm rounded-lg px-3 py-2 border border-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 