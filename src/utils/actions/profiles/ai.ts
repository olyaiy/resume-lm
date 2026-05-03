'use server';
import { generateObject, LanguageModelUsage, LanguageModelV1 } from 'ai';
import { z } from 'zod';
import { RESUME_FORMATTER_SYSTEM_MESSAGE } from "@/lib/prompts";
import { type AIConfig } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '@/utils/actions/stripe/actions';
import { sanitizeUnknownStrings } from '@/lib/utils';
import {
  finishAIUsageRequest,
  startAIUsageRequest,
} from '@/lib/ai/usage-ledger';

async function runTrackedAIRequest<T extends { usage?: LanguageModelUsage }>(
  input: {
    route: string;
    userId: string;
    isPro: boolean;
    config?: AIConfig;
  },
  task: (model: LanguageModelV1) => Promise<T>
) {
  const { model, usageEventId } = await startAIUsageRequest(input);

  try {
    const result = await task(model);
    await finishAIUsageRequest({
      usageEventId,
      status: 'succeeded',
      usage: result.usage,
    });
    return result;
  } catch (error) {
    await finishAIUsageRequest({
      usageEventId,
      status: 'failed',
      errorCode: error instanceof Error ? error.message : 'ai_request_failed',
    });
    throw error;
  }
}

// TEXT RESUME -> PROFILE
export async function formatProfileWithAI(
  userMessages: string,
  config?: AIConfig
) {
    try {
      const { plan, id } = await getSubscriptionPlan(true);
      const isPro = plan === 'pro';
  
      
      const { object } = await runTrackedAIRequest({
        route: 'actions.profiles.formatProfileWithAI',
        userId: id,
        isPro,
        config,
      }, (aiClient) => generateObject({
        model: aiClient as LanguageModelV1,
        schema: z.object({
          content: z.object({
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            email: z.string().optional(),
            phone_number: z.string().optional(),
            location: z.string().optional(),
            website: z.string().optional(),
            linkedin_url: z.string().optional(),
            github_url: z.string().optional(),
            work_experience: z.array(z.object({
              company: z.string(),
              position: z.string(),
              date: z.string(),
              location: z.string().optional(),
              description: z.array(z.string()),
              technologies: z.array(z.string()).optional()
            })).optional(),
            education: z.array(z.object({
              school: z.string(),
              degree: z.string(),
              field: z.string(),
              date: z.string(),
              location: z.string().optional(),
              gpa: z.string().optional(),
              achievements: z.array(z.string()).optional()
            })).optional(),
            skills: z.array(z.object({
              category: z.string(),
              items: z.array(z.string())
            })).optional(),
            projects: z.array(z.object({
              name: z.string(),
              description: z.array(z.string()),
              technologies: z.array(z.string()).optional(),
              date: z.string().optional(),
              url: z.string().optional(),
              github_url: z.string().optional()
            })).optional()
          })
        }),
        prompt: `Please analyze this resume text and extract all relevant information into a structured profile format. 
                Include all sections (personal info, work experience, education, skills, projects) if present.
                Ensure all arrays (like description, technologies, achievements) are properly formatted as arrays.
                For any missing or unclear information, use optional fields rather than making assumptions.
  
                Resume Text:
  ${userMessages}`,
        // Use custom prompt if provided in config, otherwise fall back to default
        system: config?.customPrompts?.resumeFormatter 
          ?? (RESUME_FORMATTER_SYSTEM_MESSAGE.content as string),
      }));

  
      return sanitizeUnknownStrings(object.content);
    } catch (error) {
      throw error;
    }
  }
