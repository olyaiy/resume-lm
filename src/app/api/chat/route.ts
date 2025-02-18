import { ToolInvocation, smoothStream, streamText } from 'ai';
import { Resume, Job } from '@/lib/types';
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { tools } from '@/lib/tools';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';
import redis from '@/lib/redis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatRequest {
  messages: Message[];
  resume: Resume;
  target_role: string;
  config?: AIConfig;
  job?: Job;
}

export async function POST(req: Request) {
  try {
    const { messages, target_role, config, job }: ChatRequest = await req.json();

    // Get subscription plan and user id.
    const { plan, id } = await getSubscriptionPlan(true);
    const isPro = plan === 'pro';

    // Only apply rate limiting for Pro users.
    if (isPro) {
      // Use the user id for rate limiting.
      const redisKey = `rate-limit:pro:${id}`;

      // Leaky bucket parameters:
      // Capacity: 40 messages per 5 hours.
      const CAPACITY = 80;
      const DURATION = 5 * 60 * 60; // 5 hours in seconds (i.e. 18,000 seconds)
      const LEAK_RATE = CAPACITY / DURATION; // tokens per second

      // Get the current time in seconds.
      const now = Date.now() / 1000;

      // Fetch existing bucket data.
      // We expect a hash with fields: "tokens" (current bucket level) and "last" (timestamp of last update)
      const bucket = await redis.hgetall(redisKey);

      let tokens: number;
      let last: number;

      if (!bucket || !bucket.tokens || !bucket.last) {
        // No bucket yet, so start fresh.
        tokens = 0;
        last = now;
        await redis.expire(redisKey, DURATION + 3600); // 6h total
      } else {
        tokens = parseFloat(bucket.tokens as string);
        last = parseFloat(bucket.last as string);
      }

      // Calculate the time difference and leak tokens.
      const delta = now - last;
      tokens = Math.max(0, tokens - delta * LEAK_RATE);

      // Now add one token for the current message.
      const newTokens = tokens + 1;

      if (newTokens > CAPACITY) {
        const timeLeft = Math.ceil(
          ((newTokens - CAPACITY) * DURATION) / CAPACITY
        );
       
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Try again later.",
            expirationTimestamp: Date.now() + (timeLeft * 1000)
          }),
          {
            status: 429,
            headers: { 
              "Content-Type": "application/json",
              "Retry-After": String(timeLeft) 
            },
          }
        );
      }

      // Update the bucket with the new token count and current time.
      await redis.hset(redisKey, { tokens: newTokens.toString(), last: now.toString() });
      await redis.expire(redisKey, DURATION + 3600); // Refresh expiration on successful update
    }

    // Initialize the AI client using the provided config and plan.
    const aiClient = initializeAIClient(config, isPro);


    // Build and send the AI call.
    const result = streamText({
      model: aiClient,
      system: `
      You are ResumeLM, an expert technical resume consultant 
      specializing in computer science and software 
      engineering careers. Your expertise spans resume 
      optimization, technical writing, and industry best 
      practices for tech job applications.

      TOOL USAGE INSTRUCTIONS:
      1. For work experience improvements:
         - Use 'suggest_work_experience_improvement' with 'index' and 'improved_experience' fields
         - Always include company, position, date, and description
      
      2. For project improvements:
         - Use 'suggest_project_improvement' with 'index' and 'improved_project' fields
         - Always include name and description
      
      3. For skill improvements:
         - Use 'suggest_skill_improvement' with 'index' and 'improved_skill' fields
         - Only use for adding new or removing existing skills
      
      4. For education improvements:
         - Use 'suggest_education_improvement' with 'index' and 'improved_education' fields
         - Always include school, degree, field, and date
      
      5. For viewing resume sections:
         - Use 'getResume' with 'sections' array
         - Valid sections: 'all', 'personal_info', 'work_experience', 'education', 'skills', 'projects'

      6. For multiple section updates:
         - Use 'modifyWholeResume' when changing multiple sections at once

      Aim to use a maximum of 5 tools in one go, then confirm with the user if they would like you to continue.
      The target role is ${target_role}. The job is ${job}.
      `,
      messages,
      maxSteps: 5,
      tools,
      experimental_transform: smoothStream(),
      onFinish: async ({ usage }) => {
        const { promptTokens, completionTokens, totalTokens } = usage;
        const metadata = await result.experimental_providerMetadata;
        console.log('Prompt tokens:', promptTokens);
        console.log('Completion tokens:', completionTokens);
        console.log('Total tokens:', totalTokens);
        console.log('Cached prompt tokens:', metadata?.openai?.cachedPromptTokens);
      },
  
    });

    return result.toDataStreamResponse({
      sendUsage: false,
      getErrorMessage: error => {
        if (error == null) {
          console.log('Error:', error);
          return 'Unknown error occurred';
        }
        if (error instanceof Error) {
          console.log('Error:', error);
          if (error.message.includes('OpenAI API key not found')) {
            return 'OpenAI API key not found';
          }
          return error.message;
        }
        if (typeof error === 'string') {
          console.log('Error:', error);
          return error;
        }
        console.log('Error:', error);
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
