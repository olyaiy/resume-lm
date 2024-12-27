'use client';

import { useState } from "react";
import { Sparkles, ChevronUp, Send, Bot, User, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { streamChatResponse } from "@/utils/ai";
import { useRef, useEffect } from "react";
import type { OpenAI } from "openai";
import { motion, AnimatePresence } from "framer-motion";
import { Resume } from "@/lib/types";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface Message {
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

function TypingIndicator({ text }: { text?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {text && (
        <span className="text-[11px] text-purple-600/70 font-medium">{text}</span>
      )}
      <div className="flex items-center gap-0.5">
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
        />
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
        />
        <motion.div
          className="w-1 h-1 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
        />
      </div>
    </div>
  );
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
        isUser ? "bg-gradient-to-br from-purple-500 to-fuchsia-500" : "bg-gradient-to-br from-purple-400 to-fuchsia-400"
      )}>
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-3.5 py-2 rounded-2xl text-sm shadow-sm",
          isUser 
            ? "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-sm" 
            : message.isSystemMessage
              ? "bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 text-purple-600 rounded-bl-sm"
              : "bg-white/90 backdrop-blur-sm border border-purple-200/60 text-gray-800 rounded-bl-sm"
        )}>
          {message.isLoading ? (
            <TypingIndicator text={message.loadingText} />
          ) : message.isSystemMessage ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              <p className="whitespace-pre-wrap font-medium text-xs">{message.content}</p>
            </div>
          ) : (
            <div className={cn(
              "prose-sm max-w-none",
              isUser ? "prose-invert" : "prose-purple",
              "markdown-content"
            )}>
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
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-500 px-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { 
      role: 'user' as const, 
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    scrollToBottom();
    
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
            // Update loading message to show reading state
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                lastMessage.isLoading = true;
                lastMessage.loadingText = 'Reading your resume...';
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
              
              // Execute the function based on the name
              let functionResult = '';
              if (functionCallName === 'read_resume') {
                const section = args.section as string;
                if (section === 'all') {
                  functionResult = JSON.stringify(resume);
                } else if (section === 'basic_info') {
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
                } else {
                  // Type assertion for other valid resume sections
                  functionResult = JSON.stringify(resume[section as keyof Resume]);
                }
              }

              // Add the function result to the messages
              chatMessages.push({
                role: 'function',
                name: functionCallName,
                content: functionResult
              });

              // Reset function call tracking
              functionCallName = undefined;
              functionCallArgs = '';

              // Add a system message confirming the function call
              setMessages(prev => {
                const newMessages = [...prev];
                // Update the loading message to show completion
                const loadingMessage = newMessages[newMessages.length - 1];
                if (loadingMessage?.role === 'assistant' && loadingMessage.isLoading) {
                  loadingMessage.isLoading = false;
                  loadingMessage.content = 'Read over the resume ✅';
                  loadingMessage.isSystemMessage = true;
                }
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
      <motion.div 
        layout
        className="bg-gradient-to-br from-purple-100/95 via-fuchsia-100/95 to-purple-100/95 relative rounded-3xl backdrop-blur-xl border border-purple-200/60 shadow-2xl shadow-purple-500/20 overflow-hidden transition-all duration-500 ease-in-out
          hover:shadow-purple-500/30 hover:border-purple-300/70
          after:absolute after:bottom-0 after:left-[10%] after:right-[10%] after:h-1/2 after:bg-gradient-to-t after:from-purple-500/30 after:via-fuchsia-500/20 after:to-transparent after:blur-2xl after:-z-10 after:transition-all after:duration-500 group-hover:after:opacity-80
          before:absolute before:bottom-0 before:left-[20%] before:right-[20%] before:h-1/2 before:bg-gradient-to-t before:from-purple-400/40 before:via-fuchsia-400/10 before:to-transparent before:blur-xl before:-z-10 before:transition-all before:duration-500 group-hover:before:opacity-80"
      >
        {/* Enhanced inner glow overlay */}
        <div className="absolute -bottom-6 left-[30%] right-[30%] h-12 bg-purple-500/30 blur-2xl transition-all duration-500 group-hover:bg-purple-500/40" />
        
        {/* Enhanced gradient overlays */}
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
                 
                  {/* Invisible div for scroll anchoring */}
                  <div ref={messagesEndRef} className="h-0 w-full" />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar - Always Visible */}
        <div className="relative px-4 py-3 border-t border-purple-300/40">
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask AI for help with your resume..."
              className="flex-1 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-3.5 py-2.5 border border-purple-300/50 
                focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 
                transition-all duration-300 placeholder:text-purple-600/50
                shadow-inner shadow-purple-500/10"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              type="submit"
              size="sm"
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white 
                hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 
                shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 
                hover:-translate-y-0.5 rounded-lg px-4 py-2.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 