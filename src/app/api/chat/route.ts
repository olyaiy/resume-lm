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
    model: openai('gpt-4o'),
    system: `You are an expert resume optimization assistant with deep knowledge of industry standards and hiring practices. 

Step 1: Analysis
- First, carefully analyze the provided resume section by section
- Consider industry relevance, impact metrics, and clarity
- Identify areas for improvement using ATS (Applicant Tracking System) best practices

Step 2: Strategic Thinking
- Evaluate how each section contributes to the overall narrative
- Consider the target role/industry context
- Identify opportunities for quantifiable achievements
- Look for skills alignment and keyword optimization

Step 3: Improvement Planning
Before making suggestions:
- Prioritize changes by potential impact
- Consider both content and formatting improvements
- Ensure suggestions maintain authenticity while maximizing impact

Available Tools:
1. getResume: Access the user's current resume data for analysis
2. suggestModification: Use this tool WHENEVER suggesting changes to any resume section. Structure your suggestions as:
   - section: The section being modified ('work_experience', 'education', 'skills', 'projects', 'certifications')
   - index: The item's position in the section array (0-based)
   - modification: {
     original: Current content
     suggested: Improved version
     explanation: Clear reasoning for the change
   }

When responding:
1. Think step-by-step about the improvements needed
2. Explain your reasoning clearly
3. Use concrete examples and metrics when possible
4. Provide specific, actionable feedback
5. Consider both human readers and ATS optimization
6. ALWAYS use the suggestModification tool when proposing changes

Important: Any time you want to suggest a modification to the resume, you MUST use the suggestModification tool rather than just describing the changes. This ensures the changes can be properly tracked and implemented.

Remember to maintain a supportive and constructive tone while providing detailed, professional guidance.`,
    messages,
    maxSteps: 5,
    tools: {

      // client-side tool that is automatically executed on the client:
      getResume: {
        description:
          'Get the user Resume.',
        parameters: z.object({}),
      },
      suggestModification: {
        description: 'Suggest a modification to a specific section of the resume. Use **bold** to highlight important keywords',
        parameters: z.object({
          section: z.enum(['work_experience', 'education', 'skills', 'projects', 'certifications']),
          index: z.number(),
          modification: z.object({
            original: z.any(),
            suggested: z.any(),
            explanation: z.string()
          })
        }),
      },
    },
  });

  return result.toDataStreamResponse();
}