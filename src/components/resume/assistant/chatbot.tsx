'use client';

import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import { Resume } from '@/lib/types';
import { Message, ToolInvocation } from 'ai';

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: any) => void;
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
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
            
            {message.toolInvocations?.map((toolInvocation: ToolInvocation) => (
              <div key={toolInvocation.toolCallId} className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted/50 text-sm">
                  {toolInvocation.toolName === 'getResume' && (
                    <span className="text-muted-foreground">📄 Reading resume...</span>
                  )}
                </div>
              </div>
            ))}
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