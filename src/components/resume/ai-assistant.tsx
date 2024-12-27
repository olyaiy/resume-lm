'use client';

import { useState } from "react";
import { Sparkles, ChevronUp, Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { streamChatResponse } from "@/utils/ai";
import { useRef, useEffect } from "react";
import type { OpenAI } from "openai";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2">
      <motion.div
        className="w-1.5 h-1.5 bg-purple-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-purple-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-purple-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
      />
    </div>
  );
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex gap-3 items-start",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-gradient-to-br from-purple-500 to-fuchsia-500" : "bg-gradient-to-br from-purple-400 to-fuchsia-400"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
          isUser 
            ? "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-sm" 
            : "bg-white/90 backdrop-blur-sm border border-purple-200/60 text-gray-800 rounded-bl-sm"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500 px-2 opacity-0 transition-opacity group-hover:opacity-100">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export function AIAssistant({ className }: AIAssistantProps) {
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

      const response = await streamChatResponse(chatMessages);
      let fullResponse = '';

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = fullResponse;
          } else {
            newMessages.push({ 
              role: 'assistant', 
              content: fullResponse,
              timestamp: new Date()
            });
          }
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
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
        </motion.button>

        {/* Chat Area - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 400, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative"
            >
              <ScrollArea 
                className="h-full px-5 py-4 overflow-y-auto" 
                ref={scrollAreaRef}
              >
                <div className="space-y-6">
                  {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-[300px] text-purple-700/60 space-y-4">
                      <Bot className="w-12 h-12" />
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
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/90 backdrop-blur-sm border border-purple-200/60">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                  {/* Invisible div for scroll anchoring */}
                  <div ref={messagesEndRef} className="h-0 w-full" />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar - Always Visible */}
        <div className="relative p-5 border-t border-purple-300/40">
          <form className="flex gap-3" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
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
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white 
                hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 
                shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 
                hover:-translate-y-0.5 rounded-xl px-5 py-3
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 