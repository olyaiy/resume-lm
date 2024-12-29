import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { Resume } from '@/lib/types';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatRequest {
  messages: Message[];
  resume: Resume; // Resume data passed from the client
}

export async function POST(req: Request) {
  const { messages, resume }: ChatRequest = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful resume assistant. You can access the user\'s resume data to provide specific advice and answers.',
    messages,
    maxSteps: 5,
    tools: {

      // client-side tool that is automatically executed on the client:
      getResume: {
        description:
          'Get the user Resume.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}