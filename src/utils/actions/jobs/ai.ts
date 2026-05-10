'use server';

import { generateObject, LanguageModelUsage, LanguageModelV1 } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema, 
} from "@/lib/zod-schemas";
import { Job, Resume } from "@/lib/types";
import { AIConfig } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '../stripe/actions';
import { dedupeAIConfigs, withTaskModel, type AITaskModel } from '@/lib/ai/task-models';
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
    useThinking?: boolean;
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

function getFallbackConfig(config: AIConfig | undefined, model: string): AIConfig {
  return {
    apiKeys: config?.apiKeys || [],
    ...(config?.customPrompts ? { customPrompts: config.customPrompts } : {}),
    model,
  };
}

// Build model candidates list - prioritize the task model, then cheaper fallbacks.
function getModelCandidates(config: AIConfig | undefined, isPro: boolean, task: AITaskModel) {
  const primaryModel = withTaskModel({ task, isPro, config });
  const fallbackModels: AIConfig[] = [
    getFallbackConfig(config, 'gpt-5.4-mini'),
    getFallbackConfig(config, 'gpt-5.4-nano'),
    getFallbackConfig(config, 'z-ai/glm-4.6:exacto'),
    getFallbackConfig(config, 'openai/gpt-oss-120b'),
    getFallbackConfig(config, 'openai/gpt-oss-20b'),
    getFallbackConfig(config, 'deepseek/deepseek-v3.2:nitro'),
  ];

  return dedupeAIConfigs([primaryModel, ...fallbackModels]);
}

export async function tailorResumeToJob(
  resume: Resume,
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
) {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const overallStart = Date.now();
  const modelCandidates = getModelCandidates(config, isPro, "jobTailoring");

  let lastError: unknown;

  for (const candidate of modelCandidates) {
    let start = Date.now();
    try {
      start = Date.now();
      console.log(
        `[TAILOR][TRY] ${candidate.model} | STEP: Tailoring resume content | Subscription: ${isPro ? 'PRO' : 'FREE'}`
      );
      const { object } = await runTrackedAIRequest({
        route: 'actions.jobs.tailorResumeToJob',
        userId: id,
        isPro,
        config: candidate,
        useThinking: isPro,
      }, (aiClient) => generateObject({
        model: aiClient as LanguageModelV1,
        schema: z.object({
          content: simplifiedResumeSchema,
        }),
        maxRetries: 2, // retry on failure
        system: `

You are ResumeLM, an advanced AI resume transformer. Rewrite the resume so it is ATS-friendly and tightly aligned to the job description—without adding new facts or inventing experience.

Guidelines:
- Integrate job-specific terminology and reorder content to surface the most relevant experience first. Mirror the job's vocabulary when it is factual.
- Use STAR reasoning internally but write each bullet as a single, natural resume bullet. NEVER include labels like "Situation", "Task", "Action", "Result", "Context", or "Outcome" in the output.
- Lead bullets with strong action verbs, keep them concise, and anchor claims with concrete, job-relevant metrics.
- Enrich tech details with versions/frameworks when present in the source; do not fabricate tools or versions.
- Preserve chronology and factual accuracy; if something is missing in the resume, do not invent it—map to the closest truthful concept instead.
- Remove any internal notes/annotations; final output should be clean, professional resume content only.

Your task: produce a polished, tailored resume that meets the schema exactly and reads like a refined human-written resume, not a template with explicit STAR labels.

        `,
        prompt: `
    This is the Resume:
    ${JSON.stringify(resume, null, 2)}
    
    This is the Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    `,
      }));

      console.log(
        `[TAILOR][SUCCESS ✅] ${candidate.model} | Duration: ${Date.now() - start}ms | STEP: Tailoring resume content`
      );
      return object.content satisfies z.infer<typeof simplifiedResumeSchema>;
    } catch (error) {
      lastError = error;
      console.error(
        `[TAILOR][FAILED ❌] ${candidate.model} | STEP: Tailoring resume content | Duration: ${Date.now() - start}ms | Reason: ${(error as Error)?.message ?? 'Unknown error'}`,
        error
      );
    }
  }

  console.error(
    `[TAILOR][ABORT 🚨] All models failed | Tried: ${modelCandidates.map(m => m.model).join(', ')} | Total Duration: ${
      Date.now() - overallStart
    }ms`
  );
  throw lastError ?? new Error('Failed to tailor resume');
}

export async function formatJobListing(jobListing: string, config?: AIConfig) {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const overallStart = Date.now();
  const modelCandidates = getModelCandidates(config, isPro, "structuredExtraction");

  let lastError: unknown;

  for (const candidate of modelCandidates) {
    let start = Date.now();
    try {
      start = Date.now();
      console.log(
        `[FORMAT][TRY] ${candidate.model} | STEP: Analyzing job description → Formatting requirements | Subscription: ${
          isPro ? 'PRO' : 'FREE'
        }`
      );
      const { object } = await runTrackedAIRequest({
        route: 'actions.jobs.formatJobListing',
        userId: id,
        isPro,
        config: candidate,
        useThinking: isPro,
      }, (aiClient) => generateObject({
        model: aiClient as LanguageModelV1,
        schema: z.object({
          content: simplifiedJobSchema
        }),
        system: `You are an AI assistant specializing in structured data extraction from job listings. You have been provided with a schema
                and must adhere to it strictly. When processing the given job listing, follow these steps:
                IMPORTANT: For any missing or uncertain information, you must return an empty string ("") - never return "<UNKNOWN>" or similar placeholders.

              Read the entire job listing thoroughly to understand context, responsibilities, requirements, and any other relevant details.
              Perform the analysis as described in each TASK below.
              Return your final output in a structured format (e.g., JSON or the prescribed schema), using the exact field names you have been given.
              Do not guess or fabricate information that is not present in the listing; instead, return an empty string for missing fields.
              Do not include chain-of-thought or intermediate reasoning in the final output; provide only the structured results.
              
              For the description field:
              1. Start with 3-5 bullet points highlighting the most important responsibilities of the role.
                 - Format these bullet points using markdown, with each point on a new line starting with "• "
                 - These should be the most critical duties mentioned in the job listing
              2. After the bullet points, include the full job description stripped of:
                 - Any non-job-related content
              3. Format the full description as a clean paragraph, maintaining proper grammar and flow.`,
        prompt: `Analyze this job listing carefully and extract structured information.

                TASK 1 - ESSENTIAL INFORMATION:
                Extract the basic details (company, position, URL, location, salary).
                For the description, include 3-5 key responsibilities as bullet points.

                TASK 2 - KEYWORD ANALYSIS:
                1. Technical Skills: Identify all technical skills, programming languages, frameworks, and tools
                2. Soft Skills: Extract interpersonal and professional competencies
                3. Industry Knowledge: Capture domain-specific knowledge requirements
                4. Required Qualifications: List education, and experience levels
                5. Responsibilities: Key job functions and deliverables

                Format the output according to the schema, ensuring:
                - Keywords as they are (e.g., "React.js" → "React.js")
                - Skills are deduplicated and categorized
                - Seniority level is inferred from context
                - Description contains 3-5 bullet points of key responsibilities
                Usage Notes:

                - If certain details (like salary or location) are missing, return "" (an empty string).
                - Adhere to the schema you have been provided, and format your response accordingly (e.g., JSON fields must match exactly).
                - Avoid exposing your internal reasoning.
                - DO NOT RETURN "<UNKNOWN>", if you are unsure of a piece of data, return an empty string.
                - FORMAT THE FOLLOWING JOB LISTING AS A JSON OBJECT: ${jobListing}`,
      }));

      console.log(
        `[FORMAT][SUCCESS ✅] ${candidate.model} | Duration: ${Date.now() - start}ms | STEP: Analyzing job description → Formatting requirements`
      );
      return object.content satisfies Partial<Job>;
    } catch (error) {
      lastError = error;
      console.error(
        `[FORMAT][FAILED ❌] ${candidate.model} | STEP: Analyzing job description → Formatting requirements | Duration: ${Date.now() - start}ms | Reason: ${(error as Error)?.message ?? 'Unknown error'}`,
        error
      );
    }
  }

  console.error(
    `[FORMAT][ABORT 🚨] All models failed | Tried: ${modelCandidates.map(m => m.model).join(', ')} | Total Duration: ${
      Date.now() - overallStart
    }ms`
  );
  throw lastError ?? new Error('Failed to format job listing');
}
