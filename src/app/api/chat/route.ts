import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { openrouter } from "@openrouter/ai-sdk-provider";

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
    // model: openrouter("openai/gpt-4o"),
    model: openai("gpt-4o-mini"),
    system: `You are an expert resume optimization assistant with deep knowledge of industry standards and hiring practices. 

Your role is to:
1. Analyze resumes and provide detailed feedback
2. Answer questions about resume best practices
3. Help users improve their resume content and structure
4. Provide industry-specific advice and insights
5. Explain ATS optimization strategies

When responding:
1. Be specific and actionable in your advice
2. Use examples to illustrate your points
3. Consider both human readers and ATS optimization
4. Maintain a supportive and constructive tone
5. Focus on practical improvements

Available Tools:
- getResume: Access the user's current resume data for analysis

Remember to provide detailed, professional guidance while maintaining a helpful and encouraging tone.`,
    messages,
    maxSteps: 5,
    tools: {
      getResume: {
        description: 'Get the user Resume.',
        parameters: z.object({}),
      },
    }
  });

  return result.toDataStreamResponse();
}