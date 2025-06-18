'use client';


import React, { useEffect, useCallback, useState } from 'react';
import { useChat } from 'ai/react';
import { Card } from "@/components/ui/card";
import { Bot, Trash2, Pencil, ChevronDown, RefreshCw } from "lucide-react";
import { Education, Project, Resume, Skill, WorkExperience, Job } from '@/lib/types';
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
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiKeyErrorAlert } from '@/components/ui/api-key-error-alert';
import { Textarea } from '@/components/ui/textarea';




const LOCAL_STORAGE_KEY = 'resumelm-api-keys';
const MODEL_STORAGE_KEY = 'resumelm-default-model';

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[typeof field]) => void;
  job?: Job | null;
}

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <button
        className={cn(
          "absolute z-50 rounded-full p-2",
          "bg-white/80 hover:bg-white",
          "border border-purple-200/60 hover:border-purple-300/60",
          "shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10",
          "transition-all duration-300",
          "left-[50%] translate-x-[-50%] bottom-4"
        )}
        onClick={() => scrollToBottom()}
      >
        <ChevronDown className="h-4 w-4 text-purple-600" />
      </button>
    )
  );
}

export default function ChatBot({ resume, onResumeChange, job }: ChatBotProps) {
  const router = useRouter();
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [defaultModel, setDefaultModel] = React.useState<string>('gpt-4.1-nano');
  const [originalResume, setOriginalResume] = React.useState<Resume | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

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
        };

        const result = params.sections.includes('all')
          ? { ...sectionMap, target_role: resume.target_role }
          : params.sections.reduce((acc, section) => ({
              ...acc,
              [section]: sectionMap[section as keyof typeof sectionMap]
            }), {});
        
        addToolResult({ toolCallId: toolCall.toolCallId, result });
        console.log('Tool call READ RESUME result:', result);
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

        // Add a simple, serializable result for the tool call
        const result = { success: true };
        addToolResult({ toolCallId: toolCall.toolCallId, result });
        return result;
      }
    },
    onFinish() {
      setIsInitialLoading(false);
    },
    // onResponse(response) {
    //   setIsStreaming(true);
    // },
  });

  // Memoize the submit handler
  const handleSubmit = useCallback((message: string) => {
  
    
    setIsInitialLoading(true);
    append({ 
      content: message.replace(/\s+$/, ''), // Extra safety: trim trailing whitespace
      role: 'user' 
    });
    
    
    setAccordionValue("chat");
  }, [append]);

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

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setOriginalResume(null);
    setEditingMessageId(null);
    setEditContent("");
  }, [setMessages]);

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
      "data-[state=closed]:shadow-md data-[state=closed]:border data-[state=closed]:border-purple-200/40 "
    )}>
      

      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="relative z-10 "
      >
        <AccordionItem value="chat" className="border-none py-0 my-0">

          {/* Accordion Trigger */}
          <div className="relative">
            <AccordionTrigger className={cn(
              "px-2 py-2",
              "hover:no-underline",
              "group",
              "transition-all duration-300",
              "data-[state=open]:border-b border-purple-200/60",
              "data-[state=closed]:opacity-80 data-[state=closed]:hover:opacity-100",
              "data-[state=closed]:py-1"
            )}>
              <div className={cn(
                "flex items-center w-full",
                "transition-transform duration-300",
                "group-hover:scale-[0.99]",
                "group-data-[state=closed]:scale-95"
              )}>
                <div className="flex items-center gap-1.5">
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
                  <Logo className="text-xs" asLink={false} />
                </div>
              </div>
            </AccordionTrigger>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className={cn(
                    "absolute right-8 top-1/2 -translate-y-1/2",
                    "px-3 py-1 rounded-lg",
                    "bg-purple-100/40 text-purple-500/80 border border-purple-500",
                    "hover:bg-purple-200/60 hover:text-purple-600",
                    "transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-purple-400/40",
                    "disabled:opacity-50",
                    "flex items-center gap-2",
                    (accordionValue !== "chat" || isAlertOpen) && "hidden",
                    
                
                  )}
                  disabled={messages.length === 0}
                  aria-label="Clear chat history"
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="text-xs font-medium">Clear Chat History</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={cn(
                "bg-white/95 backdrop-blur-xl",
                "border-purple-200/60",
                "shadow-lg shadow-purple-500/5"
              )}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all messages and reset the chat. This action can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={cn(
                    "border-purple-200/60",
                    "hover:bg-purple-50/50",
                    "hover:text-purple-700"
                  )}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearChat}
                    className={cn(
                      "bg-purple-500 text-white",
                      "hover:bg-purple-600",
                      "focus:ring-purple-400"
                    )}
                  >
                    Clear Chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Accordion Content */}
          <AccordionContent className="space-y-4">
            <StickToBottom className="h-[60vh] px-4 relative custom-scrollbar" resize="smooth" initial="smooth">
              <StickToBottom.Content className="flex flex-col custom-scrollbar">
                {messages.length === 0 ? (
                  <QuickSuggestions onSuggestionClick={handleSubmit} />
                ) : (
                  <>
                    {/* Messages */}
                    {messages.map((m: Message, index) => (
                      <React.Fragment key={index}>

                        {/* Regular Message Content */}
                        {m.content && (
                          <div className="my-2">
                            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={cn(
                                "rounded-2xl px-4 py-2 max-w-[90%] text-sm relative group items-center",
                                m.role === 'user' ? [
                                  "bg-gradient-to-br from-purple-500 to-indigo-500",
                                  "text-white",
                                  "shadow-md shadow-purple-500/10",
                                  "ml-auto pb-0 text-white"
                                ] : [
                                  "bg-white/60",
                                  "border border-purple-200/60",
                                  "shadow-sm",
                                  "backdrop-blur-sm pb-0"
                                ]
                              )}>

                                {/* Edit Message */}
                                {editingMessageId === m.id ? (
                                  <div className="flex flex-col gap-2">
                                    <Textarea
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

                                {/* Message Actions */}
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
                          switch (state) {
                            case 'partial-call':
                            case 'call':
                              return (
                                <div key={toolCallId} className="mt-2 max-w-[90%]">
                                  <div className="flex justify-start max-w-[90%]">
                                    {toolName === 'getResume' ? (
                                      <div className={cn(
                                        "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm"
                                      )}>
                                        Reading Resume...
                                      </div>
                                    ) : toolName === 'modifyWholeResume' ? (
                                      <div className={cn(
                                        "w-full rounded-2xl px-4 py-2",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm"
                                      )}>
                                        Preparing resume modifications...
                                      </div>
                                    ) : toolName.startsWith('suggest_') ? (
                                      <SuggestionSkeleton />
                                    ) : null}
                                    {toolName === 'displayWeather' ? (
                                      <div>Loading weather...</div>
                                    ) : null}
                                  </div>
                                </div>
                              );

                            case 'result':
                              // Map tool names to resume sections and handle suggestions
                              const toolConfig = {
                                suggest_work_experience_improvement: {
                                  type: 'work_experience' as const,
                                  field: 'work_experience',
                                  content: 'improved_experience',
                                },
                                suggest_project_improvement: {
                                  type: 'project' as const,
                                  field: 'projects',
                                  content: 'improved_project',
                                },
                                suggest_skill_improvement: {
                                  type: 'skill' as const,
                                  field: 'skills',
                                  content: 'improved_skill',
                                },
                                suggest_education_improvement: {
                                  type: 'education' as const,
                                  field: 'education',
                                  content: 'improved_education',
                                },
                                modifyWholeResume: {
                                  type: 'whole_resume' as const,
                                  field: 'all',
                                  content: null,
                                },
                              } as const;
                              const config = toolConfig[toolName as keyof typeof toolConfig];

                              if (!config) return null;

                              // Handle specific tool results
                              if (toolName === 'getResume') {
                                return (
                                  <div key={toolCallId} className="mt-2 w-[90%]">
                                    <div className="flex justify-start">
                                      <div className={cn(
                                        "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm"
                                      )}>
                                        <p>Read Resume ({args.sections?.join(', ') || 'all'}) ✅</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              if (config.type === 'whole_resume') {
                                return (
                                  <div key={toolCallId} className="mt-2 w-[90%]">
                                    <WholeResumeSuggestion
                                      onReject={() => {
                                        if (originalResume) {
                                          Object.keys(originalResume).forEach((key) => {
                                            if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                                              onResumeChange(key as keyof Resume, originalResume[key as keyof Resume]);
                                            }
                                          });
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
                                        resume[config.field].map((item: WorkExperience | Education | Project | Skill, i: number) => 
                                          i === args.index ? args[config.content] : item
                                        )
                                      )}
                                      onReject={() => {}}
                                    />
                                  </div>
                                </div>
                              );

                            default:
                              return null;
                          }
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
                  error.message === "Rate limit exceeded. Try again later." ? (
                    <div className={cn(
                      "rounded-lg p-4 text-sm",
                      "bg-pink-50 border border-pink-200",
                      "text-pink-700"
                    )}>
                      <p>You&apos;ve used all your available messages. Please try again after:</p>
                      <p className="font-medium mt-2">
                        {new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleString()} {/* 5 hours from now */}
                      </p>
                    </div>
                  ) : (
                    <ApiKeyErrorAlert 
                      error={error} 
                      router={router} 
                    />
                  )
                )}
              </StickToBottom.Content>

              <ScrollToBottom />
            </StickToBottom>
            
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