'use client';

import { useState, useCallback, useEffect, useRef, useReducer } from "react";
import { Sparkles, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { streamChatResponse } from "@/utils/ai";
import type { OpenAI } from "openai";
import type { Resume } from "@/lib/types";
import { ChatInput } from "./ui/chat-input";
import { FunctionHandler } from '@/utils/function-handler';
import { ChatArea } from "./ui/message-bubble";

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
  role: 'user' | 'assistant' | 'function';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  loadingText?: string;
  isSystemMessage?: boolean;
  isHidden?: boolean;
  name?: string;
}

interface AIAssistantProps {
  className?: string;
  resume: Resume;
  onUpdateResume: (field: keyof Resume, value: any) => void;
}

// Add these types at the top with other interfaces
type MessageAction = 
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_LAST_MESSAGE'; content: string; isLoading?: boolean; loadingText?: string }
  | { type: 'ADD_FUNCTION_RESULT'; message: Message }
  | { type: 'SET_SYSTEM_MESSAGE'; content: string };

// Add this reducer function before the AIAssistant component
function messageReducer(state: Message[], action: MessageAction): Message[] {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.message];
      
    case 'UPDATE_LAST_MESSAGE': {
      const lastMessage = state[state.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') {
        return state;
      }
      // Only create a new array if we're actually updating the message
      if (
        lastMessage.content === action.content &&
        lastMessage.isLoading === action.isLoading &&
        lastMessage.loadingText === action.loadingText
      ) {
        return state;
      }
      return [
        ...state.slice(0, -1),
        {
          ...lastMessage,
          content: action.content,
          isLoading: action.isLoading,
          loadingText: action.loadingText
        }
      ];
    }
      
    case 'ADD_FUNCTION_RESULT':
      return [...state, action.message];
      
    case 'SET_SYSTEM_MESSAGE': {
      const lastMessage = state[state.length - 1];
      if (!lastMessage || !lastMessage.isLoading) {
        return state;
      }
      return [
        ...state.slice(0, -1),
        {
          ...lastMessage,
          content: action.content,
          isLoading: false,
          loadingText: undefined,
          isSystemMessage: true
        }
      ];
    }
    
    default:
      return state;
  }
}

// First, add this interface near the top with other types
interface FunctionArgs {
  section?: string;
  action?: string;
}

export function AIAssistant({ className, resume, onUpdateResume }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, dispatch] = useReducer(messageReducer, []);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const functionHandler = new FunctionHandler(resume, onUpdateResume);
  const rafIdRef = useRef<number | undefined>(undefined);
  const contentBufferRef = useRef<string>('');

  // Replace debouncedUpdateMessage with updateMessageContent
  const updateMessageContent = useCallback((content: string, isLoading: boolean, loadingText?: string) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      dispatch({
        type: 'UPDATE_LAST_MESSAGE',
        content,
        isLoading,
        loadingText
      });
    });
  }, []);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Focus input when chat expands
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);
  


  
  async function handleAIResponse(message: string) {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      message: userMessage
    });

    // Add initial assistant message
    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true
      }
    });

    setIsLoading(true);
    contentBufferRef.current = '';

    try {
      const chatMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        ...messages.map(msg => {
          if (msg.role === 'function') {
            return {
              role: msg.role,
              name: msg.name!,
              content: msg.content
            };
          }
          return {
            role: msg.role,
            content: msg.content
          };
        }),
        {
          role: userMessage.role,
          content: userMessage.content
        }
      ];

      const response = await streamChatResponse(chatMessages);
      
      let functionCallName: string | undefined;
      let functionCallArgs = '';

      for await (const chunk of response) {
        const delta = (chunk as ChatCompletionChunk).choices[0]?.delta;
        
        if (delta.function_call) {
          const functionCall = delta.function_call;
          
          if (functionCall.name && !functionCallName) {
            functionCallName = functionCall.name;
            dispatch({
              type: 'UPDATE_LAST_MESSAGE',
              content: '',
              isLoading: true,
              loadingText: functionCallName === 'read_resume' 
                ? 'Reading your resume...'
                : 'Calling tool...'
            });
          }

          if (functionCall.arguments) {
            functionCallArgs += functionCall.arguments;
          }

          if (functionCallName && functionCallArgs && !delta.content) {
            if (!functionCallArgs.trim().endsWith('}')) {
              continue;
            }

            const functionResult = await functionHandler.handleFunctionCall(functionCallName, functionCallArgs);
            const args = JSON.parse(functionCallArgs);

            dispatch({
              type: 'ADD_MESSAGE',
              message: {
                role: 'function',
                name: functionCallName,
                content: functionResult,
                timestamp: new Date(),
                isHidden: true
              }
            });

            chatMessages.push({
              role: 'function',
              name: functionCallName,
              content: functionResult
            });

            // Set system message for function completion
            const displayMessage = getFunctionDisplayMessage(functionCallName, args);
            dispatch({
              type: 'SET_SYSTEM_MESSAGE',
              content: displayMessage
            });

            // Add new assistant message for continued conversation
            dispatch({
              type: 'ADD_MESSAGE',
              message: {
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                isLoading: true
              }
            });

            const newResponse = await streamChatResponse(chatMessages);
            contentBufferRef.current = '';
            let isFirstChunk = true;

            for await (const newChunk of newResponse) {
              if (newChunk.choices[0]?.delta?.content === '[DONE]') continue;
              
              const content = newChunk.choices[0]?.delta?.content || '';
              contentBufferRef.current += content;

              updateMessageContent(
                contentBufferRef.current,
                isFirstChunk && content.length === 0,
                isFirstChunk && content.length === 0 ? 'Thinking...' : undefined
              );

              if (isFirstChunk) isFirstChunk = false;
            }
            continue;
          }
          continue;
        }

        if (delta.content) {
          const content = delta.content;
          if (content === '[DONE]') continue;

          contentBufferRef.current += content;
          
          // Only update every few characters to reduce render frequency
          if (contentBufferRef.current.length % 3 === 0 || content.includes('\n')) {
            updateMessageContent(
              contentBufferRef.current,
              false,
              undefined
            );
          }
        }
      }

      // Ensure final content is always updated
      if (contentBufferRef.current) {
        updateMessageContent(
          contentBufferRef.current,
          false,
          undefined
        );
      }

    } catch (error) {
      console.error('Error in chat:', error);
      dispatch({
        type: 'UPDATE_LAST_MESSAGE',
        content: 'Sorry, I encountered an error. Please try again.',
        isLoading: false
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Update the helper function with proper typing
  function getFunctionDisplayMessage(functionName: string, args: FunctionArgs): string {
    const formatSectionName = (section?: string) => 
      section === 'all' ? 'Full Resume' : 
      section?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    switch (functionName) {
      case 'update_name':
        return 'Changed name ✅';
      case 'read_resume':
        return `Read ${formatSectionName(args.section)} ✅`;
      case 'modify_resume':
        const actionName = args.action ? 
          `${args.action.charAt(0).toUpperCase()}${args.action.slice(1)}d` : 
          'Modified';
        return `${actionName} ${formatSectionName(args.section)} ✅`;
      default:
        return 'Operation Complete ✅';
    }
  }

  return (
    <div className={cn("group", className)}>
      {/* MAIN CHAT CONTAINER */}
      <div 
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
        <button 
          onClick={() => setIsExpanded(prev => !prev)}
          className={cn(
            "relative w-full flex items-center gap-2.5 px-3.5 py-2 rounded-t-3xl",
            isExpanded ? "border border-purple-500/60" : "hover:bg-purple-200/30",
            "transition-all duration-300 group/button active:scale-[0.99] hover:scale-[1.01]",
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
        </button>

        {/* Chat Area - Expandable */}
        {isExpanded && (
          <ChatArea 
            messages={messages}
            isLoading={isLoading}
          />
        )}

        {/* Input Bar */}
        <ChatInput 
          onSubmit={handleAIResponse} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
} 