'use client';

import { Bot, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TypingIndicator } from "./typing-indicator";
import { Message } from "../ai-assistant";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect, memo, useCallback } from "react";
import type { WorkExperience } from "@/lib/types";


interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

// Memoize MessageBubble component
const MessageBubble = memo(function MessageBubble({ 
  message, 
}: MessageBubbleProps) {
  if (message.isHidden) {
    return null;
  }

  const isUser = message.role === 'user';
  
  const renderContent = () => {
    if (message.isSuggestion) {
      try {
        const suggestion = JSON.parse(message.content) as WorkExperience;
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium text-purple-900">{suggestion.position}</h3>
              <span className="text-sm text-purple-600">{suggestion.date}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-purple-800">{suggestion.company}</span>
              {suggestion.location && (
                <span className="text-sm text-purple-600">• {suggestion.location}</span>
              )}
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {suggestion.description.map((desc, i) => (
                <li key={i} className="text-sm text-purple-800">{desc}</li>
              ))}
            </ul>
            {suggestion.technologies && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestion.technologies.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      } catch (e) {
        return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{message.content}</ReactMarkdown>;
      }
    }
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap text-[13px] leading-relaxed m-0">{children}</p>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className={cn(
            "underline underline-offset-4",
            isUser ? "text-white/90 hover:text-white" : "text-purple-600 hover:text-purple-700"
          )}>{children}</a>,
          code: ({ inline, children }) => inline 
            ? <code className={cn(
                "px-1.5 py-0.5 rounded-md text-[12px] font-mono",
                isUser 
                  ? "bg-white/20 text-white" 
                  : "bg-purple-100/80 text-purple-800"
              )}>{children}</code>
            : <pre className={cn(
                "mt-2 mb-2 p-3 rounded-lg text-[12px] overflow-x-auto",
                isUser 
                  ? "bg-white/10 text-white" 
                  : "bg-purple-100/50 text-purple-900"
              )}><code>{children}</code></pre>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-[13px]">{children}</li>,
          h1: ({ children }) => <h1 className="text-base font-semibold mt-3 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold mt-2 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1">{children}</h3>,
          blockquote: ({ children }) => <blockquote className={cn(
            "border-l-2 pl-2 my-1.5",
            isUser ? "border-white/30" : "border-purple-300"
          )}>{children}</blockquote>,
          hr: () => <hr className={cn(
            "my-2 border-t",
            isUser ? "border-white/20" : "border-purple-200/60"
          )} />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-purple-200/60 text-[12px]">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-2 py-1 font-medium bg-purple-100/50">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 border-t border-purple-200/30">{children}</td>,
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={cn(
        "group flex gap-2 transition-opacity duration-200",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div className={cn(
        "flex flex-col gap-2 w-full max-w-full",
        isUser ? "flex-col items-end" : "flex-col items-start"
      )}>
        <div className={cn(
          "flex flex-col gap-1 w-full max-w-full",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "px-3.5 py-2 rounded-2xl text-sm shadow-sm w-full overflow-hidden",
            isUser 
              ? "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-sm"
              : message.isSystemMessage
                ? "bg-purple-50/80 backdrop-blur-sm border-l-2 border-l-purple-400 border-y border-r border-purple-100/60 text-purple-900 rounded-bl-sm"
                : "bg-white/90 backdrop-blur-sm border border-purple-200/60 text-gray-800 rounded-bl-sm"
          )}>
            {message.isLoading ? (
              <TypingIndicator text={message.loadingText} />
            ) : message.isSystemMessage ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <p className="whitespace-pre-wrap text-[13px] font-medium tracking-tight">{message.content}</p>
              </div>
            ) : (
              <div className={cn(
                "prose-sm max-w-none overflow-x-auto",
                isUser ? "prose-invert" : "prose-purple",
                "markdown-content"
              )}>
                {renderContent()}
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 w-full",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {!message.isSystemMessage && (
            <div className={cn(
              "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
              isUser 
                ? "bg-gradient-to-br from-purple-500 to-fuchsia-500"
                : "bg-gradient-to-br from-purple-400 to-fuchsia-400"
            )}>
              {isUser ? (
                <User className="w-3.5 h-3.5 text-white" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          )}
          
          {!message.isSystemMessage && (
            <span className="text-[10px] text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

// Memoize ChatArea component
export const ChatArea = memo(function ChatArea({ 
  messages, 
  isLoading, 
}: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: "end" 
      });
    }
  }, []);

  // Handle initial scroll and new messages
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length, scrollToBottom]);

  // Handle streaming updates
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isLoading || lastMessage?.content) {
      // Only auto-scroll if we're near the bottom
      const scrollArea = scrollAreaRef.current;
      if (scrollArea) {
        const { scrollHeight, scrollTop, clientHeight } = scrollArea;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        if (isNearBottom && isAutoScrollingRef.current) {
          scrollToBottom();
        }
      }
    }
  }, [messages, scrollToBottom]);

  // Handle scroll events to detect manual scrolling
  const handleScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const { scrollHeight, scrollTop, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isAutoScrollingRef.current = isNearBottom;
    }
  }, []);

  return (
    <div className="relative h-[70vh] opacity-100 transition-opacity duration-200">
      <ScrollArea 
        className="h-full px-4 py-0 overflow-y-auto" 
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="space-y-4 flex flex-col">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-purple-700/60 space-y-3">
              <Bot className="w-10 h-10" />
              <p className="text-sm text-center max-w-[80%]">
                Hi! I'm your AI Resume Assistant. Ask me anything about crafting or improving your resume.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <MessageBubble 
              key={index} 
              message={msg} 
              isLast={index === messages.length - 1}
            />
          ))}
         
          <div ref={messagesEndRef} className="h-0 w-full" />
        </div>
      </ScrollArea>
    </div>
  );
});

// Export memoized MessageBubble for potential reuse
export { MessageBubble };