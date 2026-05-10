import { LanguageModelV1, ToolInvocation, smoothStream, streamText } from 'ai';
import { Resume, Job } from '@/lib/types';
import { type AIConfig } from '@/utils/ai-tools';
import { tools } from '@/lib/tools';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';
import { AI_ASSISTANT_SYSTEM_MESSAGE } from '@/lib/prompts';
import {
  AIUsageError,
  finishAIUsageRequest,
  startAIUsageRequest,
} from '@/lib/ai/usage-ledger';
import { withTaskModel } from '@/lib/ai/task-models';

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
    const requestBody = await req.json();
    const { messages, target_role, config, job, resume }: ChatRequest = requestBody;

    // Get subscription plan and user ID
    const { plan, id } = await getSubscriptionPlan(true);
    const isPro = plan === 'pro';
    const routedConfig = withTaskModel({ task: "chatAssistant", isPro, config });

    // Initialize the AI client using the provided config and plan.
    const {
      model: aiClient,
      usageEventId,
    } = await startAIUsageRequest({
      userId: id,
      route: 'api.chat',
      config: routedConfig,
      isPro,
    });

    // Some models (e.g., GPT-5 family / GPT-5 Mini) only support the default temperature (1)
    const requiresDefaultTemp = [
      'gpt-5',
      'gpt-5.4',
      'gpt-5.4-mini',
      'gpt-5.4-nano',
      'gpt-5.4-pro',
      'gpt-5.5',
      'gpt-5.5-pro',
    ].includes(routedConfig.model);
    
    // Gemini models support a thinking phase—explicitly disable it to avoid added latency/cost
    // For OpenRouter models, use the unified 'reasoning' parameter via providerOptions.openrouter
    const isGeminiModel = routedConfig.model.toLowerCase().includes('gemini-3');
    const isOpenRouterModel = routedConfig.model.includes('/');
    
    // Configure provider options based on model type
    type ProviderOptions = 
      | {
          openrouter: {
            reasoning: {
              exclude: boolean;
            };
          };
        }
      | {
          google: {
            thinkingConfig: {
              thinkingBudget: number;
              includeThoughts: boolean;
            };
          };
        }
      | undefined;
    
    let providerOptions: ProviderOptions = undefined;
    
    if (isGeminiModel) {
      if (isOpenRouterModel) {
        // OpenRouter models: use reasoning parameter via providerOptions.openrouter
        // Set exclude: true to disable reasoning tokens in response (model still thinks internally)
        providerOptions = {
          openrouter: {
            reasoning: {
              exclude: true,
            },
          },
        };
      } else {
        // Direct Google models: use provider-specific options
        providerOptions = {
          google: {
            thinkingConfig: {
              thinkingBudget: 0,
              includeThoughts: false,
            },
          },
        };
      }
    }

    // Use custom prompt if provided, otherwise fall back to default
    const baseSystemPrompt = config?.customPrompts?.aiAssistant 
      ?? (AI_ASSISTANT_SYSTEM_MESSAGE.content as string);
    
    // Append context-specific information to the system prompt
    const systemPrompt = `${baseSystemPrompt}

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
      The target role is ${target_role}. The job is ${job ? JSON.stringify(job) : 'No job specified'}.
      Current resume summary: ${resume ? `${resume.first_name} ${resume.last_name} - ${resume.target_role}` : 'No resume data'}.
      `;

    // Build and send the AI call.
    const result = streamText({
      model: aiClient as LanguageModelV1,
      ...(requiresDefaultTemp ? { temperature: 1 } : {}),
      ...(providerOptions ? { providerOptions } : {}),
      system: systemPrompt,
      messages,
      maxSteps: 5,
      tools,
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: 'word', // optional: defaults to 'word'
      }),
      onFinish: async ({ usage }) => {
        await finishAIUsageRequest({
          usageEventId,
          status: 'succeeded',
          usage,
        });
      },
      onError: async ({ error }) => {
        await finishAIUsageRequest({
          usageEventId,
          status: 'failed',
          errorCode: error instanceof Error ? error.message : 'stream_error',
        });
      },
    });

    return result.toDataStreamResponse({
      sendUsage: false,
      getErrorMessage: error => {
        if (!error) return 'Unknown error occurred';
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    if (error instanceof AIUsageError) {
      const retryAfter = error.code === 'rate_limited'
        ? parseInt(error.message.match(/(\d+) seconds/)?.[1] ?? '60', 10)
        : undefined;

      return new Response(
        JSON.stringify({
          error: error.message,
          ...(retryAfter ? { expirationTimestamp: Date.now() + retryAfter * 1000 } : {}),
        }),
        {
          status: error.status,
          headers: {
            'Content-Type': 'application/json',
            ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
