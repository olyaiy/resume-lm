'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Check, X, Loader2, Sparkles, Bot } from "lucide-react";
import { Resume, WorkExperience, Education, Project, Skill, Certification } from '@/lib/types';
import { Message, ToolInvocation } from 'ai';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown';

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: any) => void;
}

type ResumeArraySection = {
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
};

interface ModificationSuggestion {
  section: keyof ResumeArraySection;
  index: number;
  modification: {
    original: any;
    suggested: any;
    explanation: string;
  };
  status?: 'accepted' | 'rejected';
}

interface GroupedSuggestions {
  [key: string]: ModificationSuggestion[];
}

export default function ChatBot({ resume, onResumeChange }: ChatBotProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  
  const { messages, input, setInput, append, addToolResult, stop, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'getResume') {
        return resume;
      }
    },
  });

  // Add state for tracking suggestion decisions
  const [suggestionStatuses, setSuggestionStatuses] = React.useState<{
    [messageId: string]: { [suggestionIndex: number]: 'accepted' | 'rejected' };
  }>({});

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Auto scroll on new messages or when streaming
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim()) {
      setAccordionValue("chat"); // Expand the accordion when sending a message
      append({ content: input, role: 'user' });
      setInput('');
    }
  };

  const handleStop = () => {
    stop();
    append({
      content: "AI response cancelled",
      role: "system",
    });
  };

  return (
    <Card className={cn(
      "flex flex-col w-full max-w-2xl mx-auto",
      "bg-gradient-to-br from-purple-50/95 via-purple-50/90 to-indigo-50/95",
      "border-2 border-purple-200/60",
      "shadow-lg shadow-purple-500/5",
      "transition-all duration-500",
      "hover:shadow-xl hover:shadow-purple-500/10",
      "overflow-hidden",
      "relative"
    )}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70" />

      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="relative z-10"
      >
        <AccordionItem value="chat" className="border-none">
          <AccordionTrigger className={cn(
            "px-3 py-2",
            "hover:no-underline",
            "group",
            "transition-all duration-300",
            "data-[state=closed]:opacity-80 data-[state=closed]:hover:opacity-100"
          )}>
            <div className={cn(
              "flex items-center gap-2 w-full",
              "transition-transform duration-300",
              "group-hover:scale-[0.99]",
              "group-data-[state=closed]:scale-95"
            )}>
              <div className={cn(
                "p-1.5 rounded-lg",
                "bg-purple-100/80 text-purple-600",
                "group-hover:bg-purple-200/80",
                "transition-colors duration-300",
                "group-data-[state=closed]:bg-white/60"
              )}>
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium text-purple-600",
                  "group-hover:text-purple-700",
                  "transition-colors duration-300"
                )}>
                  AI Assistant
                </span>
                {messages.length > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] rounded-full",
                    "bg-purple-100/80 text-purple-600",
                    "group-hover:bg-purple-200/80",
                    "transition-colors duration-300",
                    "group-data-[state=closed]:bg-white/60"
                  )}>
                    {messages.length}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea ref={scrollAreaRef} className="h-[500px] px-4 space-y-4">
              {messages.map((message: Message, index) => (
                <div key={index} className="space-y-2">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%] text-sm",
                      message.role === 'user' ? [
                        "bg-gradient-to-br from-purple-500 to-indigo-500",
                        "text-white",
                        "shadow-md shadow-purple-500/10",
                        "ml-auto"
                      ] : [
                        "bg-white/60",
                        "border border-purple-200/60",
                        "shadow-sm",
                        "backdrop-blur-sm"
                      ]
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none whitespace-pre-wrap",
                        "prose-headings:font-semibold prose-headings:text-inherit",
                        "prose-h1:text-lg prose-h1:mt-2 prose-h1:mb-1",
                        "prose-h2:text-base prose-h2:mt-2 prose-h2:mb-1",
                        "prose-h3:text-sm prose-h3:mt-1.5 prose-h3:mb-0.5",
                        "prose-p:my-1 prose-p:leading-normal",
                        "prose-pre:bg-black/5 prose-pre:rounded",
                        "prose-code:text-inherit prose-code:bg-black/5 prose-code:rounded prose-code:px-1",
                        "prose-ul:my-1 prose-li:my-0 prose-li:marker:text-current",
                        "prose-hr:my-2 prose-hr:border-current/20",
                        message.role === 'user' ? [
                          "prose-invert",
                          "prose-a:text-blue-200 prose-a:hover:text-blue-300",
                          "prose-strong:text-white",
                          "prose-em:text-gray-200",
                          "prose-headings:text-white"
                        ] : [
                          "prose-purple",
                          "prose-a:text-purple-600 prose-a:hover:text-purple-700",
                          "prose-strong:text-purple-900",
                          "prose-em:text-purple-800",
                          "prose-headings:text-purple-900"
                        ]
                      )}>
                        <MemoizedMarkdown id={message.id || String(index)} content={message.content} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={cn(
                    "rounded-2xl px-4 py-3",
                    "bg-white/60",
                    "border border-purple-200/60",
                    "shadow-sm",
                    "backdrop-blur-sm"
                  )}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                      <span className="text-sm text-purple-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <form onSubmit={handleSubmit} className={cn(
        "relative z-10",
        "p-4 border-t border-purple-200/60",
        "bg-white/40",
        "backdrop-blur-sm",
        "flex gap-2"
      )}>
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
            "placeholder:text-purple-400"
          )}
        />
        {isLoading ? (
          <Button 
            type="button" 
            size="icon" 
            onClick={handleStop}
            className={cn(
              "bg-gradient-to-br from-rose-100/90 to-pink-100/90",
              "hover:from-rose-200/90 hover:to-pink-200/90",
              "text-rose-600 hover:text-rose-700",
              "border border-rose-200/60",
              "shadow-sm",
              "transition-all duration-300",
              "hover:scale-105 hover:shadow-md"
            )}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="submit" 
            size="icon"
            className={cn(
              "bg-gradient-to-br from-purple-500 to-indigo-500",
              "hover:from-purple-600 hover:to-indigo-600",
              "text-white",
              "border-none",
              "shadow-md shadow-purple-500/10",
              "transition-all duration-300",
              "hover:scale-105 hover:shadow-lg",
              "hover:-translate-y-0.5"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </Card>
  );
}