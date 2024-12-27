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
    <div className={cn("group", className)}>
      <div className="bg-gradient-to-br from-purple-100/95 via-fuchsia-100/95 to-purple-100/95 relative rounded-3xl backdrop-blur-xl border border-purple-200/60 shadow-2xl shadow-purple-500/20 overflow-hidden transition-all duration-500 ease-in-out
        hover:shadow-purple-500/30 hover:border-purple-300/70
        after:absolute after:bottom-0 after:left-[10%] after:right-[10%] after:h-1/2 after:bg-gradient-to-t after:from-purple-500/30 after:via-fuchsia-500/20 after:to-transparent after:blur-2xl after:-z-10 after:transition-all after:duration-500 group-hover:after:opacity-80
        before:absolute before:bottom-0 before:left-[20%] before:right-[20%] before:h-1/2 before:bg-gradient-to-t before:from-purple-400/40 before:via-fuchsia-400/10 before:to-transparent before:blur-xl before:-z-10 before:transition-all before:duration-500 group-hover:before:opacity-80">
        {/* Enhanced inner glow overlay */}
        <div className="absolute -bottom-6 left-[30%] right-[30%] h-12 bg-purple-500/30 blur-2xl transition-all duration-500 group-hover:bg-purple-500/40" />
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(217,70,219,0.15),transparent_50%)] pointer-events-none animate-pulse" />
        
        {/* Header - Always Visible */}
        <button 
          onClick={() => setIsExpanded(prev => !prev)}
          className="relative w-full flex items-center gap-3 p-5 hover:bg-purple-200/30 transition-all duration-300 group/button"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover/button:shadow-purple-500/40 group-hover/button:scale-105">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex-1 text-left transition-all duration-300">
            <div className="text-base font-semibold bg-gradient-to-r from-purple-700 to-fuchsia-700 bg-clip-text text-transparent">AI Resume Assistant</div>
            <p className="text-sm text-purple-700/90">Let AI help you craft the perfect resume</p>
          </div>
          <ChevronUp className={cn(
            "h-5 w-5 text-purple-600 transition-all duration-300",
            isExpanded ? "rotate-0" : "rotate-180",
            "group-hover/button:text-purple-700 group-hover/button:scale-110"
          )} />
        </button>

        {/* Chat Area - Expandable */}
        <div className={cn(
          "relative transition-all duration-300 ease-in-out",
          isExpanded ? "h-[400px]" : "h-0"
        )}>
          <ScrollArea className="h-full px-5 py-4">
            <div className="space-y-4">
              {/* Chat messages will go here */}
              <div className="flex items-center justify-center h-full text-sm text-purple-700/80">
                Chat messages will appear here
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Bar - Always Visible */}
        <div className="relative p-5 border-t border-purple-300/40">
          <form className="flex gap-3" onSubmit={(e) => {
            e.preventDefault();
            // Handle message submit
          }}>
            <input
              type="text"
              placeholder="Ask AI for help with your resume..."
              className="flex-1 bg-white/90 backdrop-blur-sm text-sm rounded-xl px-4 py-3 border border-purple-300/50 
                focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 
                transition-all duration-300 placeholder:text-purple-600/50
                shadow-inner shadow-purple-500/10"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white 
                hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 
                shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 
                hover:-translate-y-0.5 rounded-xl px-5 py-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 