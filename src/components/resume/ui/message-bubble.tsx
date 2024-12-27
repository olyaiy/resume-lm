// Import necessary dependencies for animations, icons, and markdown rendering
import { motion } from "framer-motion";
import { Bot, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TypingIndicator } from "./typing-indicator";
import { Message } from "../ai-assistant";

// Define the props interface for the MessageBubble component
interface MessageBubbleProps {
  message: Message;  // The message object containing content, role, and metadata
  isLast: boolean;  // Flag to indicate if this is the last message in the chat
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';  // Determine if the message is from the user
  
  return (
    // Wrapper with animation properties for smooth entry
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex gap-2",
        isUser ? "items-end " : "items-start "  // Align user messages to end, AI messages to start
      )}
    >
      <div className={cn(
        "flex flex-col gap-2 w-full",
        // Reverse column for user messages to place avatar at bottom
        isUser ? "flex-col  items-end" : "flex-col  items-start"
      )}>
        {/* Message content container */}
        <div className={cn(
          "flex flex-col gap-1 w-full",
          isUser ? "items-end " : "items-start "
        )}>
          {/* Message bubble with conditional styling based on message type */}
          <div className={cn(
            "px-3.5 py-2 rounded-2xl text-sm shadow-sm",
            isUser 
              ? "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-sm"  // User message styling
              : message.isSystemMessage
                ? "bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 text-purple-600 rounded-bl-sm"  // System message styling
                : "bg-white/90 backdrop-blur-sm border border-purple-200/60 text-gray-800 rounded-bl-sm"  // AI message styling
          )}>
            
            {/* Conditional rendering based on message state */}
            {message.isLoading ? (
              <TypingIndicator text={message.loadingText} />
            ) : message.isSystemMessage ? (


              // System message with checkmark icon
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <p className="whitespace-pre-wrap font-medium text-xs">{message.content}</p>
              </div>
            ) : (

              // Regular message with markdown support
              <div className={cn(
                "prose-sm max-w-none",
                isUser ? "prose-invert" : "prose-purple",
                "markdown-content"
              )}>
                {/* ReactMarkdown component with custom element styling */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom components for markdown elements with responsive styling
                    // Each component is styled differently based on user/AI context
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
          
          {/* Timestamp - visible on hover */}
          <span className="text-[10px] text-gray-500 px-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Avatar container with gradient background */}
        <div className={cn(
          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
          isUser 
            ? "bg-gradient-to-br from-purple-500 to-fuchsia-500"  // User avatar gradient
            : "bg-gradient-to-br from-purple-400 to-fuchsia-400"  // AI avatar gradient
        )}>
          {/* Conditional icon rendering based on message sender */}
          {isUser ? (
            <User className="w-3.5 h-3.5 text-white" />
          ) : (
            <Bot className="w-3.5 h-3.5 text-white" />
          )}
        </div>
      </div>
    </motion.div>
  );
}