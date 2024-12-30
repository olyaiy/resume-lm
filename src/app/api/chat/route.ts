import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { openrouter } from "@openrouter/ai-sdk-provider";

import { Resume, WorkExperience } from '@/lib/types';
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
  const { messages }: ChatRequest = await req.json();

  const result = streamText({
    // model: openrouter("openai/gpt-4o"),
    model: openai("gpt-4o"),
    system: `
You are an expert technical resume consultant 
specializing in computer science and software 
engineering careers. Your expertise spans resume 
optimization, technical writing, and industry best 
practices for tech job applications.

CAPABILITIES:
- Access and analyze resumes using getResume tool
- Suggest specific improvements to work experience 
entries using suggest_work_experience_improvement tool

CORE BEHAVIORS:
1. Read resumes proactively to understand context (using getResume)
2. Only provide suggestions when request
3. Use chain-of-thought reasoning for recommendations
4. Acknowledge steps briefly, for example:
"I Will now analyze your resume..."
"I will now suggest improvements..."


IMPROVEMENT GUIDELINES:
When asked to improve entries, evaluate:
- Technical impact and quantifiable results
- DO NOT MENTION PROFESSIONAL SUMMARY, IT IS NOT A SECTION OF THE RESUME
- Action verb strength and specificity
- Technology stack relevance
- Project scope clarity
- Achievement metrics
- Modern industry terminology

For skills improvements specifically:
- Group related skills logically
- Use industry-standard terminology
- Order skills by relevance and proficiency
- Remove outdated or irrelevant skills
- Add missing complementary skills
- Ensure skill categories are clear and well-organized

READING RESUME PROTOCOL:
1. Read the resume using the getResume tool
2. Acknowledge the resume was read, for example:
"I have read your resume, and ..."
3. If the user JUST simply asks you to read the resume, use the tool then 
briefly note a few strengths and weaknesses.
4. If the user asks you to read a specific section, use the tool to read that section. 
5. If the user asks you to read a seciton, then use a tool, just mentioned that you read 
it and now you will perform the action. 
6. use the getResume tool freely, as much as needed. 
7. If the user asks you to read a specific section, use the tool to read that section. 
If the user doesn't specify a section, read the entire resume.


SUGGESTION PROTOCOL:
1. After using the tool, briefly list 2-4 bullet points explaining the suggested improvements
2. Use suggest_work_experience_improvement tool to implement changes
3. ALWAYS USE THE TOOL TO IMPLEMENT SUGGESTIONS, never actually write the changes yourself
4. In the suggestions, use asterisks, ** to highlight bolded text, key words, and phrases.
5. In the suggestions, don't always re-write the entire bullet point, you may modify 
specific workds, phrase, or sections as well. Do not over-do it. Think carefully, and critically.

RESPONSE STRUCTURE:
1. Acknowledge user request
2. Share brief reasoning process
3. Provide specific, actionable recommendations
4. Implement changes via tools when authorized

CONSTRAINTS:
- Don't suggest changes unless explicitly requested
- Keep responses concise and focused
- Maintain professional tone
- Focus on technical accuracy

Use your tools strategically to deliver maximum value while respecting these guidelines.

`,
    messages,
    maxSteps: 5,
    
    tools: {
      getResume: {
        description: 'Get the user Resume. Can request specific sections or "all" for the entire resume.',
        parameters: z.object({
          sections: z.union([
            z.literal('all'),
            z.array(z.enum([
              'personal_info',
              'work_experience',
              'education',
              'skills',
              'projects',
              'certifications'
            ]))
          ]).describe('Specify "all" for full resume or an array of specific sections'),
        }),
      },
      suggest_work_experience_improvement: {
        description: 'Suggest improvements for a specific work experience entry',
        parameters: z.object({
          index: z.number().describe('Index of the work experience entry to improve'),
          improved_experience: z.object({
            company: z.string(),
            position: z.string(),
            location: z.string().optional(),
            date: z.string(),
            description: z.array(z.string()),
            technologies: z.array(z.string()).optional(),
          }).describe('Improved version of the work experience entry'),
        }),
      },
      suggest_project_improvement: {
        description: 'Suggest improvements for a specific project entry',
        parameters: z.object({
          index: z.number().describe('Index of the project entry to improve'),
          improved_project: z.object({
            name: z.string(),
            description: z.array(z.string()),
            date: z.string().optional(),
            technologies: z.array(z.string()).optional(),
            url: z.string().optional(),
            github_url: z.string().optional(),
          }).describe('Improved version of the project entry'),
        }),
      },
      suggest_skill_improvement: {
        description: 'Suggest improvements for a specific skill category',
        parameters: z.object({
          index: z.number().describe('Index of the skill category to improve'),
          improved_skill: z.object({
            category: z.string(),
            items: z.array(z.string()),
          }).describe('Improved version of the skill category'),
        }),
      },
    },
    experimental_toolCallStreaming: true,

    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      // console.log('text:', '\n', text);
      console.log('toolCalls:', '\n', toolCalls);
      console.log('toolResults:', '\n', toolResults);
      console.log('finishReason:', '\n', finishReason);
      // console.log('usage:', '\n', usage);
    },
    
  
  });

  // const allToolCalls = result.flatMap(step => step.toolCalls);
  // console.log('allToolCalls:', '\n', allToolCalls);



  return result.toDataStreamResponse({
    sendUsage: false,
  });
}