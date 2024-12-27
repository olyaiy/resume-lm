'use client';

import { useState } from "react";
import { Sparkles, ChevronUp, Send, Bot, User, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { streamChatResponse } from "@/utils/ai";
import { useRef, useEffect } from "react";
import type { OpenAI } from "openai";
import { motion, AnimatePresence } from "framer-motion";
import { Resume, WorkExperience, Education, Skill, Project, Certification } from "@/lib/types";
import { MessageBubble } from "./ui/message-bubble";
import { ChatInput } from "./ui/chat-input";

// Define types for OpenAI streaming response
type ChatCompletionChunk = OpenAI.Chat.ChatCompletionChunk & {
  choices: Array<{
    delta: {
      content?: string;
      function_call?: {
        name?: string;
        arguments?: string;
      };
    };
  }>;
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  loadingText?: string;
  isSystemMessage?: boolean;
}

interface AIAssistantProps {
  className?: string;
  resume: Resume;
  onUpdateResume: (field: keyof Resume, value: any) => void;
}


export function AIAssistant({ className, resume, onUpdateResume }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  // Scroll on new messages or content updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat expands
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
      scrollToBottom();
    }
  }, [isExpanded]);

  // Handle streaming updates
  useEffect(() => {
    if (isLoading) {
      const scrollInterval = setInterval(scrollToBottom, 100);
      return () => clearInterval(scrollInterval);
    }
  }, [isLoading]);

  async function handleMessageSubmit() {
    if (!message.trim() || isLoading) return;

    const userMessage = { 
      role: 'user' as const, 
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    // Add initial assistant message with loading state
    setMessages(prev => [...prev, { 
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }]);

    // Refocus input after sending
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    try {
      const chatMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      chatMessages.push(userMessage);

      const response = await streamChatResponse(chatMessages, resume);
      let fullResponse = '';
      let functionCallName: string | undefined;
      let functionCallArgs = '';

      for await (const chunk of response) {
        // Handle function calls
        const delta = (chunk as ChatCompletionChunk).choices[0]?.delta;
        if (delta.function_call) {
          const functionCall = delta.function_call;
          
          if (functionCall.name) {
            functionCallName = functionCall.name;
            // Update loading message to show generic tool usage state
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                lastMessage.isLoading = true;
                lastMessage.loadingText = functionCallName === 'read_resume' 
                  ? 'Reading your resume...'
                  : 'Calling tool...';
              }
              return newMessages;
            });
          }
          if (functionCall.arguments) {
            functionCallArgs += functionCall.arguments;
          }

          // Check if we have a complete JSON string
          if (functionCallName && functionCallArgs && !delta.content) {
            try {
              // Verify if we have complete JSON by checking for closing brace
              if (!functionCallArgs.trim().endsWith('}')) {
                continue;
              }

              // Parse the complete arguments
              const args = JSON.parse(functionCallArgs);
              
              // Execute the function based on the name and arguments
              let functionResult = '';
              if (functionCallName === 'read_resume') {
                // Extract the requested section from the function arguments
                const section = args.section as string;

                // If 'all' is requested, return the entire resume object
                if (section === 'all') {
                  functionResult = JSON.stringify(resume);
                } 
                // If 'basic_info' is requested, return only the basic profile information
                else if (section === 'basic_info') {
                  functionResult = JSON.stringify({
                    first_name: resume.first_name,
                    last_name: resume.last_name,
                    email: resume.email,
                    phone_number: resume.phone_number,
                    location: resume.location,
                    website: resume.website,
                    linkedin_url: resume.linkedin_url,
                    github_url: resume.github_url,
                    professional_summary: resume.professional_summary
                  });
                } 
                // For any other valid section (work_experience, education, etc.)
                // return just that section from the resume
                else {
                  functionResult = JSON.stringify(resume[section as keyof Resume]);
                }
              } else if (functionCallName === 'update_name') {
                // Update the resume with new name
                resume.first_name = args.first_name;
                resume.last_name = args.last_name;
                // Call the onUpdateResume callback
                onUpdateResume('first_name', args.first_name);
                onUpdateResume('last_name', args.last_name);
                functionResult = JSON.stringify({
                  success: true,
                  message: "Name updated successfully",
                  updated_values: {
                    first_name: args.first_name,
                    last_name: args.last_name
                  }
                });
              } else if (functionCallName === 'modify_resume') {
                const { section, action, index, data } = args;

                switch (section) {
                  case 'basic_info':
                    // Update basic info fields
                    Object.entries(data).forEach(([key, value]) => {
                      const typedKey = key as keyof Resume;
                      if (typedKey in resume && typeof value === typeof resume[typedKey]) {
                        (resume[typedKey] as any) = value;
                        onUpdateResume(typedKey, value);
                      }
                    });
                    break;

                  case 'work_experience':
                  case 'education':
                  case 'skills':
                  case 'projects':
                  case 'certifications': {
                    let sectionArray: Array<WorkExperience | Education | Skill | Project | Certification>;
                    
                    // Initialize with the correct type
                    switch (section) {
                      case 'work_experience':
                        sectionArray = [...resume.work_experience];
                        break;
                      case 'education':
                        sectionArray = [...resume.education];
                        break;
                      case 'skills':
                        sectionArray = [...resume.skills];
                        break;
                      case 'projects':
                        sectionArray = [...resume.projects];
                        break;
                      case 'certifications':
                        sectionArray = [...resume.certifications];
                        break;
                      default:
                        throw new Error('Invalid section');
                    }
                    
                    switch (action) {
                      case 'add':
                        sectionArray.push(data);
                        onUpdateResume(section, sectionArray);
                        break;
                      case 'update':
                        if (index === undefined || !sectionArray[index]) {
                          throw new Error(`Invalid index for ${section} update`);
                        }
                        sectionArray[index] = { ...sectionArray[index], ...data };
                        onUpdateResume(section, sectionArray);
                        break;
                      case 'delete':
                        if (index === undefined || !sectionArray[index]) {
                          throw new Error(`Invalid index for ${section} deletion`);
                        }
                        sectionArray.splice(index, 1);
                        onUpdateResume(section, sectionArray);
                        break;
                    }
                    break;
                  }

                  default:
                    throw new Error('Invalid section specified');
                }

                functionResult = JSON.stringify({
                  success: true,
                  message: `Successfully ${action}ed ${section}`,
                  section,
                  action,
                  index
                });
              }

              // Add the function result to the messages
              chatMessages.push({
                role: 'function',
                name: functionCallName,
                content: functionResult
              });

              // Add a system message confirming the function call
              setMessages(prev => {
                const newMessages = [...prev];
                // Update the loading message to show completion
                const loadingMessage = newMessages[newMessages.length - 1];
                if (loadingMessage?.role === 'assistant' && loadingMessage.isLoading) {
                  loadingMessage.isLoading = false;
                  // Format the function name to be more readable, with special case for update_name and read operations
                  let displayMessage = 'Operation Complete ✅';
                  console.log('Function Call Name:', functionCallName);
                  if (functionCallName === 'update_name') {
                    displayMessage = 'Changed name ✅';
                  } else if (functionCallName === 'read_resume') {
                    const sectionName = args.section === 'all' ? 'Full Resume' : 
                      args.section.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    displayMessage = `Read ${sectionName} ✅`;
                  } else if (functionCallName === 'modify_resume') {
                    const sectionName = args.section.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    const actionName = args.action.charAt(0).toUpperCase() + args.action.slice(1);
                    displayMessage = `${actionName}d ${sectionName} ✅`;
                  }
                  loadingMessage.content = displayMessage;
                  loadingMessage.isSystemMessage = true;
                }

                

                 // Reset function call tracking
                functionCallName = undefined;
                functionCallArgs = '';


                // Add new assistant message for the upcoming response
                return [...newMessages, {
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isLoading: true
                }];
              });

              // Get a new response with the function result
              const newResponse = await streamChatResponse(chatMessages, resume);
              fullResponse = ''; // Reset fullResponse for new stream
              let isFirstChunk = true;

              for await (const newChunk of newResponse) {
                if (newChunk.choices[0]?.delta?.content === '[DONE]') {
                  continue;
                }
                const content = newChunk.choices[0]?.delta?.content || '';
                fullResponse += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = fullResponse;
                    // Only show loading on first empty chunk
                    if (isFirstChunk) {
                      lastMessage.isLoading = content.length === 0;
                      lastMessage.loadingText = content.length === 0 ? 'Thinking...' : undefined;
                      isFirstChunk = false;
                    } else {
                      lastMessage.isLoading = false;
                      lastMessage.loadingText = undefined;
                    }
                  }
                  return newMessages;
                });
              }
              continue;
            } catch (error) {
              console.error('Error executing function:', error);
              // If we get a JSON parse error, continue accumulating arguments
              if (error instanceof SyntaxError) {
                continue;
              }
            }
          }
          continue;
        }

        // Handle regular content
        const content = delta.content || '';
        if (content === '[DONE]') {
          continue;
        }
        fullResponse += content;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = fullResponse;
            // Once we start getting content, remove loading state
            if (content.length > 0) {
              lastMessage.isLoading = false;
              lastMessage.loadingText = undefined;
            }
          } else {
            newMessages.push({ 
              role: 'assistant', 
              content: fullResponse,
              timestamp: new Date(),
              isLoading: content.length === 0,
              loadingText: content.length === 0 ? 'Thinking...' : undefined
            });
          }
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.isLoading) {
          lastMessage.content = 'Sorry, I encountered an error. Please try again.';
          lastMessage.isLoading = false;
          lastMessage.loadingText = undefined;
          return newMessages;
        }
        return [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("group", className)}>

      {/* MAIN CHAT CONTAINER */}
      <motion.div 
        layout
        className="bg-gradient-to-br from-purple-100/95 via-fuchsia-100/95 to-purple-100/95 relative rounded-3xl backdrop-blur-xl border border-purple-200/60 shadow-2xl shadow-purple-500/20 overflow-hidden transition-all duration-500 ease-in-out
          hover:shadow-purple-500/30 hover:border-purple-300/70
          after:absolute after:bottom-0 after:left-[10%] after:right-[10%] after:h-1/2 after:bg-gradient-to-t after:from-purple-500/30 after:via-fuchsia-500/20 after:to-transparent after:blur-2xl after:-z-10 after:transition-all after:duration-500 group-hover:after:opacity-80
          before:absolute before:bottom-0 before:left-[20%] before:right-[20%] before:h-1/2 before:bg-gradient-to-t before:from-purple-400/40 before:via-fuchsia-400/10 before:to-transparent before:blur-xl before:-z-10 before:transition-all before:duration-500 group-hover:before:opacity-80"
      >
        {/* Inner glow overlay */}
        <div className="absolute -bottom-6 left-[30%] right-[30%] h-12 bg-purple-500/30 blur-2xl transition-all duration-500 group-hover:bg-purple-500/40" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(217,70,219,0.15),transparent_50%)] pointer-events-none animate-pulse" />
        
        {/* Header - Always Visible */}
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsExpanded(prev => !prev)}
          className={cn(
            "relative w-full flex items-center gap-2.5 px-3.5 py-2 rounded-t-3xl",
            isExpanded ? "border border-purple-500/60" : "hover:bg-purple-200/30",
            "transition-all duration-300 group/button",
            "after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-gradient-to-r",
            "after:from-transparent after:via-purple-400/40 after:to-transparent"
          )}
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-md 
            shadow-purple-500/20 transition-all duration-300 group-hover/button:shadow-purple-500/40 
            group-hover/button:scale-105 ring-1 ring-white/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
          </div>
          <div className="flex-1 text-left transition-all duration-300">
            <div className="text-[13px] font-semibold bg-gradient-to-r from-purple-700 to-fuchsia-700 
              bg-clip-text text-transparent leading-none mb-0.5"
            >
              AI Resume Assistant
            </div>
            <p className="text-[11px] text-purple-700/80">Let AI help you craft the perfect resume</p>
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 text-purple-600/80 transition-all duration-300",
            isExpanded ? "rotate-0" : "rotate-180",
            "group-hover/button:text-purple-700 group-hover/button:scale-110"
          )} />
        </motion.button>

        {/* Chat Area - Expandable */}
        <AnimatePresence>
          {isExpanded && (

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "70vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative"
            >
              <ScrollArea 
                className="h-full px-4 py-0 overflow-y-auto" 
                ref={scrollAreaRef}
              >
                <div className="space-y-4">

                  {/* Welcome Message */}
                  {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-purple-700/60 space-y-3">
                      <Bot className="w-10 h-10" />
                      <p className="text-sm text-center max-w-[80%]">
                        Hi! I'm your AI Resume Assistant. Ask me anything about crafting or improving your resume.
                      </p>
                    </div>
                  )}

                  {/* MESSAGES */}
                  {messages.map((msg, index) => (
                    <MessageBubble 
                      key={index} 
                      message={msg} 
                      isLast={index === messages.length - 1} 
                    />
                  ))}
                 
                  {/* Invisible div for scroll anchoring */}
                  <div ref={messagesEndRef} className="h-0 w-full" />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar - Always Visible */}
        <ChatInput 
          message={message} 
          setMessage={setMessage} 
          onSubmit={handleMessageSubmit} 
          isLoading={isLoading} 
        />
      </motion.div>
    </div>
  );
} 