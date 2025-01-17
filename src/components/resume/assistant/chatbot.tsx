'use client';


import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useChat } from 'ai/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Bot, Trash2, Pencil } from "lucide-react";
import { Certification, Education, Project, Resume, Skill, WorkExperience, Job } from '@/lib/types';
import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { ToolInvocation } from 'ai';
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown';
import { Suggestion } from './suggestions';
import { SuggestionSkeleton } from './suggestion-skeleton';
import ChatInput from './chat-input';
import { LoadingDots } from '@/components/ui/loading-dots';
import { ApiKey } from '@/utils/ai-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { WholeResumeSuggestion } from './suggestions';
import { QuickSuggestions } from './quick-suggestions';



const LOCAL_STORAGE_KEY = 'resumelm-api-keys';
const MODEL_STORAGE_KEY = 'resumelm-default-model';

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[typeof field]) => void;
  job?: Job | null;
}

export default function ChatBot({ resume, onResumeChange, job }: ChatBotProps) {
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [defaultModel, setDefaultModel] = React.useState<string>('gpt-4o-mini');
  const [originalResume, setOriginalResume] = React.useState<Resume | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  
  // Load settings from local storage
  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }

    if (storedModel) {
      setDefaultModel(storedModel);
    }
  }, []);

  const config = {
    model: defaultModel,
    apiKeys,
  };
  
  const { messages, error, append, isLoading, addToolResult, stop, setMessages } = useChat({
    api: '/api/chat',
    body: {
      target_role: resume.target_role,
      resume: resume,
      config,
      job: job,
    },
    maxSteps: 5,
    onResponse() {
      console.log('Current messages after response:', 
        messages.map(m => ({
          role: m.role,
          content: JSON.stringify(m.content)
        }))
      );
      setIsInitialLoading(false);
    },
    onError() {
      setIsInitialLoading(false);
    },
    async onToolCall({ toolCall }) {
      // setIsStreaming(false);
      
      if (toolCall.toolName === 'getResume') {
        const params = toolCall.args as { sections: string[] };
        
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

        const result = params.sections.includes('all')
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

      if (toolCall.toolName === 'modifyWholeResume') {
        const updates = toolCall.args as {
          basic_info?: Partial<{
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            location: string;
            website: string;
            linkedin_url: string;
            github_url: string;
          }>;
          work_experience?: WorkExperience[];
          education?: Education[];
          skills?: Skill[];
          projects?: Project[];
        };
        
        // Store the current resume state before applying updates
        setOriginalResume({ ...resume });
        
        // Apply updates as before
        if (updates.basic_info) {
          Object.entries(updates.basic_info).forEach(([key, value]) => {
            if (value !== undefined) {
              onResumeChange(key as keyof Resume, value);
            }
          });
        }

        const sections = {
          work_experience: updates.work_experience,
          education: updates.education,
          skills: updates.skills,
          projects: updates.projects,
        };

        Object.entries(sections).forEach(([key, value]) => {
          if (value !== undefined) {
            onResumeChange(key as keyof Resume, value);
          }
        });

        return (
          <div key={toolCall.toolCallId} className="mt-2 w-[90%]">
            <WholeResumeSuggestion
              onReject={() => {
                // Restore the original resume state
                if (originalResume) {
                  // Restore basic info
                  Object.keys(originalResume).forEach((key) => {
                    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                      onResumeChange(key as keyof Resume, originalResume[key as keyof Resume]);
                    }
                  });
                  
                  // Clear the stored original state
                  setOriginalResume(null);
                }
              }}
            />
          </div>
        );
      }
    },
    onFinish() {
      setIsInitialLoading(false);
    },
    // onResponse(response) {
    //   setIsStreaming(true);
    // },
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

  // Memoize the submit handler
  const handleSubmit = useCallback((message: string) => {
    console.log('Before append - messages:', 
      messages.map(m => ({
        role: m.role,
        content: JSON.stringify(m.content)
      }))
    );
    
    console.log('About to append message:', JSON.stringify(message));
    setIsInitialLoading(true);
    append({ 
      content: message.replace(/\s+$/, ''), // Extra safety: trim trailing whitespace
      role: 'user' 
    });
    
    console.log('After append - messages:', 
      messages.map(m => ({
        role: m.role,
        content: JSON.stringify(m.content)
      }))
    );
    
    setAccordionValue("chat");
  }, [append, messages]);

  // Add delete handler
  const handleDelete = (id: string) => {
    setMessages(messages.filter(message => message.id !== id));
  };

  // Add edit handler
  const handleEdit = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditContent(content);
  };

  // Add save handler
  const handleSaveEdit = (id: string) => {
    setMessages(messages.map(message => 
      message.id === id 
        ? { ...message, content: editContent }
        : message
    ));
    setEditingMessageId(null);
    setEditContent("");
  };

  return (
    <Card className={cn(
      "flex flex-col w-full l mx-auto",
      "bg-gradient-to-br from-purple-400/20 via-purple-400/50 to-indigo-400/50",
      "border-2 border-purple-200/60",
      "shadow-lg shadow-purple-500/5",
      "transition-all duration-500",
      "hover:shadow-xl hover:shadow-purple-500/10",
      "overflow-hidden",
      "relative",
      "data-[state=closed]:shadow-md data-[state=closed]:border data-[state=closed]:border-purple-200/40"
    )}>
      {/* Animated Background Pattern */}
      <div className={cn(
        "absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10",
        "data-[state=closed]:bg-[size:16px_16px]"
      )} />
      
      {/* Floating Gradient Orbs */}
      <div className={cn(
        "absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-3xl animate-float opacity-70",
        "data-[state=closed]:opacity-40"
      )} />
      <div className={cn(
        "absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-delayed opacity-70",
        "data-[state=closed]:opacity-40"
      )} />

      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="relative z-10"
      >
        <AccordionItem value="chat" className="border-none py-0 my-0">

          {/* Accordion Trigger */}
          <AccordionTrigger className={cn(
            "px-2 py-1",
            "hover:no-underline",
            "group",
            "transition-all duration-300",
            "data-[state=open]:border-b border-purple-200/60",
            "data-[state=closed]:opacity-80 data-[state=closed]:hover:opacity-100",
            "data-[state=closed]:py-0.5"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 w-full",
              "transition-transform duration-300",
              "group-hover:scale-[0.99]",
              "group-data-[state=closed]:scale-95"
            )}>
              <div className={cn(
                "p-1 rounded-lg",
                "bg-purple-100/80 text-purple-600",
                "group-hover:bg-purple-200/80",
                "transition-colors duration-300",
                "group-data-[state=closed]:bg-white/60",
                "group-data-[state=closed]:p-0.5"
              )}>
                <Bot className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1.5">
                <Logo className="text-xs" asLink={false} />
              </div>
            </div>
          </AccordionTrigger>

          {/* Accordion Content */}
          <AccordionContent className="space-y-4">
            <ScrollArea ref={scrollAreaRef} className="h-[60vh] px-4 ">
              {messages.length === 0 ? (
                <QuickSuggestions onSuggestionClick={handleSubmit} />
              ) : (
                <>
                  {/* Messages */}
                  {messages.map((m: Message, index) => (
                    <React.Fragment key={index}>
                      {/* Regular Message Content */}
                      {m.content && (
                        <div className="my-6">
                          <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={cn(
                              "rounded-2xl px-4 py-2 max-w-[90%] text-sm relative group items-center",
                              m.role === 'user' ? [
                                "bg-gradient-to-br from-purple-500 to-indigo-500",
                                "text-white",
                                "shadow-md shadow-purple-500/10",
                                "ml-auto pb-0"
                              ] : [
                                "bg-white/60",
                                "border border-purple-200/60",
                                "shadow-sm",
                                "backdrop-blur-sm pb-0"
                              ]
                            )}>
                              {editingMessageId === m.id ? (
                                <div className="flex flex-col gap-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className={cn(
                                      "w-full min-h-[100px] p-2 rounded-lg",
                                      "bg-white/80 backdrop-blur-sm",
                                      m.role === 'user' 
                                        ? "text-purple-900 placeholder-purple-400"
                                        : "text-gray-900 placeholder-gray-400",
                                      "border border-purple-200/60 focus:border-purple-400/60",
                                      "focus:outline-none focus:ring-1 focus:ring-purple-400/60"
                                    )}
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(m.id)}
                                    className={cn(
                                      "self-end px-3 py-1 rounded-lg text-xs",
                                      "bg-purple-500 text-white",
                                      "hover:bg-purple-600",
                                      "transition-colors duration-200"
                                    )}
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <MemoizedMarkdown id={m.id} content={m.content} />
                              )}
                              <div className="absolute -bottom-4 left-2 flex gap-2">
                                <button
                                  onClick={() => handleDelete(m.id)}
                                  className={cn(
                                    "transition-colors duration-200",
                                    m.role === 'user' 
                                      ? "text-purple-500/60 hover:text-purple-600"
                                      : "text-purple-400/60 hover:text-purple-500",
                                  )}
                                  aria-label="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleEdit(m.id, m.content)}
                                  className={cn(
                                    "transition-colors duration-200",
                                    m.role === 'user' 
                                      ? "text-purple-500/60 hover:text-purple-600"
                                      : "text-purple-400/60 hover:text-purple-500",
                                  )}
                                  aria-label="Edit message"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Tool Invocations as Separate Bubbles */}
                      {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                        const { toolName, toolCallId, state, args } = toolInvocation;
                        // Show loading state for non-result states
                        if (state !== 'result') {
                          return (
                            <div key={toolCallId} className="mt-2 max-w-[90%]">
                              <div className="flex justify-start max-w-[90%]">
                                <SuggestionSkeleton />
                              </div>
                            </div>
                          );
                        }
                        // Handle getResume tool separately
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
                        // Map tool names to resume sections and handle suggestions
                        const toolConfig = {
                          suggest_work_experience_improvement: {
                            type: 'work_experience',
                            field: 'work_experience',
                            content: 'improved_experience',
                          },
                          suggest_project_improvement: {
                            type: 'project',
                            field: 'projects',
                            content: 'improved_project',
                          },
                          suggest_skill_improvement: {
                            type: 'skill',
                            field: 'skills',
                            content: 'improved_skill',
                          },
                          suggest_education_improvement: {
                            type: 'education',
                            field: 'education',
                            content: 'improved_education',
                          },
                          modifyWholeResume: {
                            type: 'whole_resume',
                            field: 'all',
                            content: null,
                          },
                        } as const;

                        const config = toolConfig[toolName as keyof typeof toolConfig];
                        if (!config) return null;

                        if (config.type === 'whole_resume') {
                          // Store original state before applying updates
                          if (!originalResume) {
                            setOriginalResume({ ...resume });
                          }

                          return (
                            <div key={toolCallId} className="mt-2 w-[90%]">
                              <WholeResumeSuggestion
                                onReject={() => {
                                  if (originalResume) {
                                    // Restore all fields except metadata
                                    Object.keys(originalResume).forEach((key) => {
                                      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                                        onResumeChange(key as keyof Resume, originalResume[key as keyof Resume]);
                                      }
                                    });
                                    
                                    // Clear the stored original state
                                    setOriginalResume(null);
                                  }
                                }}
                              />
                            </div>
                          );
                        }

                        return (
                          <div key={toolCallId} className="mt-2 w-[90%]">
                            <div className="">
                              <Suggestion
                                type={config.type}
                                content={args[config.content]}
                                currentContent={resume[config.field][args.index]}
                                onAccept={() => onResumeChange(config.field, 
                                  resume[config.field].map((item: WorkExperience | Education | Project | Skill | Certification, i: number) => 
                                    i === args.index ? args[config.content] : item
                                  )
                                )}
                                onReject={() => {}}
                              />
                            </div>
                          </div>
                        );
                      })}


                      {/* Loading Dots Message - Modified condition */}
                      {((isInitialLoading && index === messages.length - 1 && m.role === 'user') ||
                        (isLoading && index === messages.length - 1 && m.role === 'assistant')) && (
                        <div className="mt-2">
                          <div className="flex justify-start">
                            <div className={cn(
                              "rounded-2xl px-4 py-2.5 min-w-[60px]",
                              "bg-white/60",
                              "border border-purple-200/60",
                              "shadow-sm",
                              "backdrop-blur-sm"
                            )}>
                              <LoadingDots className="text-purple-600" />
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            
            {error && (
              <div className={cn(
                "mt-2 text-sm px-4",
                "rounded-lg py-2",
                "bg-red-50/50 border border-red-200/50",
                "flex flex-col gap-2"
              )}>
                <div className="text-red-500">
                  {typeof error === 'string' 
                    ? error
                    : ((error as Error)?.message?.includes('OpenAI API key not found') ||
                       JSON.stringify(error).includes('OpenAI API key not found'))
                      ? "OpenAI API key not found. Please set your API key in settings to continue."
                      : ((error as Error)?.message?.includes('invalid x-api-key') || 
                         JSON.stringify(error).includes('authentication_error'))
                        ? "Your Anthropic API key is invalid, please try updating it in settings and try again."
                        : ((error as Error)?.message?.includes('Incorrect API key provided') ||
                           JSON.stringify(error).includes('invalid_api_key'))
                            ? "Your OpenAI API key is invalid, please try updating it in settings and try again."
                            : "An error occurred. Please try again or check your settings."}
                </div>
                {(error.toString().toLowerCase().includes('api key') || 
                  error.toString().toLowerCase().includes('authentication')) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn(
                      "w-fit",
                      "bg-white/60 hover:bg-white/80",
                      "border-red-200 hover:border-red-300",
                      "text-red-600 hover:text-red-700"
                    )}
                    onClick={() => router.push('/settings')}
                  >
                    Go to Settings
                  </Button>
                )}
              </div>
            )}


            </ScrollArea>
            
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Input Bar */}
      <ChatInput
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </Card>
  );
}