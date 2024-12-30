'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, X } from "lucide-react";
import { Resume } from '@/lib/types';
import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { ToolInvocation } from 'ai';
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown';
import { Suggestion } from './suggestions';
import { SuggestionSkeleton } from './suggestion-skeleton';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: any) => void;
}



export default function ChatBot({ resume, onResumeChange }: ChatBotProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  
  const { messages, input, setInput, append, isLoading, addToolResult, stop } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      // setIsStreaming(false);
      
      if (toolCall.toolName === 'getResume') {
        const params = toolCall.args as { sections: 'all' | string[] };
        
        const personalInfo = {
          first_name: resume.first_name,
          last_name: resume.last_name,
          email: resume.email,
          phone_number: resume.phone_number,
          location: resume.location,
          website: resume.website,
          linkedin_url: resume.linkedin_url,
          github_url: resume.github_url,
        };

        const sectionMap = {
          personal_info: personalInfo,
          work_experience: resume.work_experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
          certifications: resume.certifications,
        };

        const result = params.sections === 'all' 
          ? { ...sectionMap, target_role: resume.target_role }
          : params.sections.reduce((acc, section) => ({
              ...acc,
              [section]: sectionMap[section as keyof typeof sectionMap]
            }), {});
        
        addToolResult({ toolCallId: toolCall.toolCallId, result });
        return result;
      }

      if (toolCall.toolName === 'suggest_work_experience_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_project_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_skill_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_education_improvement') {
        return toolCall.args;
      }
    },
    onFinish() {
      console.log('messages:', '\n', messages);
      // setIsStreaming(false);
    },
    onResponse(response) {
      // setIsStreaming(true);
    },
  });

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

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim()) {
      setAccordionValue("chat"); // Expand the accordion when sending a message
      append({ content: input, role: 'user' });
      setInput('');
    }
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
        <AccordionItem value="chat" className="border-none  py-0 my-0 ">

          {/* Accordion Trigger */}
          <AccordionTrigger className={cn(
            "px-3 py-1.5",
            "hover:no-underline",
            "group",
            "transition-all duration-300",
            "data-[state=open]:border-b border-purple-200/60",
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

          {/* Accordion Content */}
          <AccordionContent className="space-y-4">
            <ScrollArea ref={scrollAreaRef} className="h-[60vh] px-4">

              {/* Messages */}
              {messages.map((m: Message, index) => (
                <React.Fragment key={index}>
                  {/* Regular Message Content */}
                  {m.content && (
                    <div className="mt-2">
                      <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn(
                          "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                          m.role === 'user' ? [
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
                          <MemoizedMarkdown id={m.id} content={m.content} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tool Invocations as Separate Bubbles */}
                  {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                    const { toolName, toolCallId, state, args } = toolInvocation;

                    switch (state) {
                      case 'partial-call':
                        return (
                          <div key={toolCallId} className="mt-2 max-w-[90%]">
                            <div className="flex justify-start  max-w-[90%]">
                              {toolName === 'suggest_work_experience_improvement' || toolName === 'suggest_project_improvement' ? (
                                <SuggestionSkeleton />
                              ) : (
                                <div className={cn(
                                  "rounded-2xl px-4 py-2 w-full text-sm",
                                  "bg-white/60 border border-purple-200/60",
                                  "shadow-sm backdrop-blur-sm"
                                )}>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Processing...</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );

                      case 'call':
                        return (
                          <div key={toolCallId} className="mt-2">
                            <div className="flex justify-start">
                              <div className={cn(
                                "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                "bg-white/60 border border-purple-200/60",
                                "shadow-sm backdrop-blur-sm"
                              )}>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Analyzing resume...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );

                      case 'result':
                        if (toolName === 'getResume') {
                          return (
                            <div key={toolCallId} className="mt-2">
                              <div className="flex justify-start">
                                <div className={cn(
                                  "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                  "bg-white/60 border border-purple-200/60",
                                  "shadow-sm backdrop-blur-sm"
                                )}>
                                  {args.message}
                                  <p>Read Resume ✅</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (toolName === 'suggest_work_experience_improvement') {
                          return (
                            <div key={toolCallId} className="mt-2">
                              <div className="flex justify-start">
                                <Suggestion
                                  type="work_experience"
                                  content={args.improved_experience}
                                  currentContent={resume.work_experience[args.index]}
                                  onAccept={() => onResumeChange('work_experience', 
                                    resume.work_experience.map((exp, i) => 
                                      i === args.index ? args.improved_experience : exp
                                    )
                                  )}
                                  onReject={() => {}}
                                />
                              </div>
                            </div>
                          );
                        }

                        if (toolName === 'suggest_project_improvement') {
                          return (
                            <div key={toolCallId} className="mt-2">
                              <div className="flex justify-start">
                                <Suggestion
                                  type="project"
                                  content={args.improved_project}
                                  currentContent={resume.projects[args.index]}
                                  onAccept={() => onResumeChange('projects', 
                                    resume.projects.map((proj, i) => 
                                      i === args.index ? args.improved_project : proj
                                    )
                                  )}
                                  onReject={() => {}}
                                />
                              </div>
                            </div>
                          );
                        }

                        if (toolName === 'suggest_skill_improvement') {
                          return (
                            <div key={toolCallId} className="mt-2">
                              <div className="flex justify-start">
                                <Suggestion
                                  type="skill"
                                  content={args.improved_skill}
                                  currentContent={resume.skills[args.index]}
                                  onAccept={() => onResumeChange('skills', 
                                    resume.skills.map((skill, i) => 
                                      i === args.index ? args.improved_skill : skill
                                    )
                                  )}
                                  onReject={() => {}}
                                />
                              </div>
                            </div>
                          );
                        }

                        if (toolName === 'suggest_education_improvement') {
                          return (
                            <div key={toolCallId} className="mt-2">
                              <div className="flex justify-start">
                                <Suggestion
                                  type="education"
                                  content={args.improved_education}
                                  currentContent={resume.education[args.index]}
                                  onAccept={() => onResumeChange('education', 
                                    resume.education.map((edu, i) => 
                                      i === args.index ? args.improved_education : edu
                                    )
                                  )}
                                  onReject={() => {}}
                                />
                              </div>
                            </div>
                          );
                        }
                    }
                  })}
                </React.Fragment>
              ))}

            </ScrollArea>
            
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className={cn(
        "relative z-10",
        "p-2 border-t border-purple-200/60",
        "bg-white/40",
        "backdrop-blur-sm",
        "flex gap-1.5"
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
            "placeholder:text-purple-400",
            "text-sm",
            "h-8",
            "px-2.5 py-1"
          )}
        />
        <Button 
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? stop : undefined}
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
    </Card>
  );
}