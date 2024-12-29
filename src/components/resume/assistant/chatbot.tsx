'use client';

import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Check, X, Sparkles } from "lucide-react";
import { Resume, WorkExperience, Education, Project, Skill, Certification } from '@/lib/types';
import { Message, ToolInvocation } from 'ai';
import { cn } from '@/lib/utils';

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
}

export default function ChatBot({ resume, onResumeChange }: ChatBotProps) {
  const { messages, input, setInput, append, addToolResult } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'getResume') {
        console.log('getResume tool called');
        console.log(resume);
        return resume;
      }
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim()) {
      append({ content: input, role: 'user' });
    }
  };

  const handleModification = (toolCallId: string, suggestion: ModificationSuggestion, accept: boolean) => {
    if (accept) {
      console.log('Applying modification:', {
        section: suggestion.section,
        index: suggestion.index,
        currentValue: resume[suggestion.section],
        suggestedValue: suggestion.modification.suggested
      });

      // Verify the current array exists
      const currentArray = resume[suggestion.section];
      if (!Array.isArray(currentArray)) {
        console.error('Current section is not an array:', {
          section: suggestion.section,
          value: currentArray
        });
        return;
      }

      // Create new array with the modification
      const newValue = [...currentArray];
      console.log('New array before modification:', newValue);

      // Verify and format the suggested value based on section type
      if (suggestion.section === 'work_experience') {
        console.log('Work experience suggested value:', suggestion.modification.suggested);
        
        // If the suggestion is a string, assume it's a new description point
        if (typeof suggestion.modification.suggested === 'string') {
          const currentExperience = newValue[suggestion.index] as WorkExperience;
          if (!currentExperience || typeof currentExperience === 'string') {
            console.error('Invalid current work experience entry');
            return;
          }
          
          // Update just the description at the specified index
          currentExperience.description[suggestion.index] = suggestion.modification.suggested;
        } else {
          // For full work experience object updates, verify the structure
          const suggestedExp = suggestion.modification.suggested as WorkExperience;
          if (!suggestedExp.company || !suggestedExp.position || !Array.isArray(suggestedExp.description)) {
            console.error('Invalid work experience structure:', suggestedExp);
            return;
          }
          newValue[suggestion.index] = suggestedExp;
        }
      } else {
        // For other sections, apply the modification directly
        newValue[suggestion.index] = suggestion.modification.suggested;
      }

      console.log('New array after modification:', newValue);

      // Apply the change
      onResumeChange(suggestion.section, newValue);
    }

    // Add the result to the chat
    addToolResult({ 
      toolCallId, 
      result: accept ? 'Modification accepted' : 'Modification rejected' 
    });
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((message: Message, index) => (
          <div key={index} className="space-y-2">
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
            
            {message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
              if (toolInvocation.toolName === 'suggestModification' && !('result' in toolInvocation)) {
                const suggestion = toolInvocation.args as ModificationSuggestion;
                return (
                  <div key={toolInvocation.toolCallId} className={cn(
                    "relative group/suggestions",
                    "p-6 mt-4",
                    "rounded-xl",
                    "bg-gradient-to-br from-purple-50/95 via-purple-50/90 to-indigo-50/95",
                    "border border-purple-200/60",
                    "shadow-lg shadow-purple-500/5",
                    "transition-all duration-500",
                    "hover:shadow-xl hover:shadow-purple-500/10",
                    "overflow-hidden",
                    "w-full max-w-full"
                  )}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
                    
                    {/* Floating Gradient Orbs */}
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70" />
                    <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70" />
                    
                    {/* Content */}
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-purple-100/80 text-purple-600">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-purple-600">AI Suggestion</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-sm text-purple-900">{suggestion.modification.explanation}</div>
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-purple-700 mb-2">Suggested Change:</div>
                            <pre className="text-sm bg-white/60 p-4 rounded-lg border border-purple-200/60 overflow-x-auto whitespace-pre-wrap break-words">
                              {JSON.stringify(suggestion.modification.suggested, null, 2)}
                            </pre>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleModification(toolInvocation.toolCallId, suggestion, true)}
                              className={cn(
                                "h-9 w-9",
                                "bg-green-100/80 hover:bg-green-200/80",
                                "text-green-600 hover:text-green-700",
                                "border border-green-200/60",
                                "shadow-sm",
                                "transition-all duration-300",
                                "hover:scale-105 hover:shadow-md",
                                "hover:-translate-y-0.5"
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleModification(toolInvocation.toolCallId, suggestion, false)}
                              className={cn(
                                "h-9 w-9",
                                "bg-rose-100/80 hover:bg-rose-200/80",
                                "text-rose-600 hover:text-rose-700",
                                "border border-rose-200/60",
                                "shadow-sm",
                                "transition-all duration-300",
                                "hover:scale-105 hover:shadow-md",
                                "hover:-translate-y-0.5"
                              )}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              if (toolInvocation.toolName === 'getResume') {
                return (
                  <div key={toolInvocation.toolCallId} className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-muted/50 text-xs">
                      <span className="text-muted-foreground">📄 Reading resume...</span>
                    </div>
                  </div>
                );
              }

              return 'result' in toolInvocation ? (
                <div key={toolInvocation.toolCallId} className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted/50 text-xs">
                    <span className="text-muted-foreground">{toolInvocation.result}</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}