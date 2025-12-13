'use server';

import { generateObject, LanguageModelV1 } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema, 
} from "@/lib/zod-schemas";
import { Job, Resume } from "@/lib/types";
import { AIConfig } from '@/utils/ai-tools';
import { initializeAIClient } from '@/utils/ai-tools';
import { getSubscriptionPlan } from '../stripe/actions';
import { checkRateLimit } from '@/lib/rateLimiter';


export async function tailorResumeToJob(
  resume: Resume,
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
) {
  const { plan, id } = await getSubscriptionPlan(true);
  const isPro = plan === 'pro';
  const overallStart = Date.now();
  const modelCandidates: AIConfig[] = [
    { model: 'openai/gpt-5-nano', apiKeys: config?.apiKeys || [] }, // fast/free courtesy model for formatting
    { model: 'openai/gpt-oss-120b', apiKeys: config?.apiKeys || [] },
    { model: 'openai/gpt-oss-20b', apiKeys: config?.apiKeys || [] },
    { model: 'z-ai/glm-4.6:exacto', apiKeys: config?.apiKeys || [] },
    { model: 'deepseek/deepseek-v3.2:nitro', apiKeys: config?.apiKeys || [] },
  ];

  // Check rate limit once per tailoring request
  await checkRateLimit(id);

  let lastError: unknown;

  for (const candidate of modelCandidates) {
    let start = Date.now();
    try {
      start = Date.now();
      console.log(
        `[TAILOR][TRY] ${candidate.model} | STEP: Tailoring resume content | Subscription: ${isPro ? 'PRO' : 'FREE'}`
      );
      const aiClient = isPro ? initializeAIClient(candidate, isPro, true) : initializeAIClient(candidate);
      const { object } = await generateObject({
        model: aiClient as LanguageModelV1,
        temperature: 0.5, // reduced for structured output reliability
        schema: z.object({
          content: simplifiedResumeSchema,
        }),
        maxRetries: 2, // retry on failure
        system: `

You are ResumeLM, an advanced AI resume transformer that specializes in optimizing technical resumes for software engineering roles using machine-learning-driven ATS strategies. Your mission is to transform the provided resume into a highly targeted, ATS-friendly document that precisely aligns with the job description.

**Core Objectives:**

1. **Integrate Job-Specific Terminology & Reorder Content:**  
   - Replace generic descriptions with precise, job-specific technical terms drawn from the job description (e.g., "Generative AI," "Agentic AI," "LLMOps," "Azure OpenAI," "Azure Machine Learning Studio," etc.).
   - Reorder or emphasize sections and bullet points to prioritize experiences that most closely match the role's requirements.
   - Use strong, active language that mirrors the job description's vocabulary and focus.
   - Ensure all modifications are strictly based on the resume's original data—never invent new tools, versions, or experiences.

2. **STAR Framework for Technical Storytelling:**  
   For every bullet point describing work experience, structure the content as follows (using reasonable assumptions when needed without hallucinating details):
   - **Situation:** Briefly set the technical or business context (e.g., "During a cloud migration initiative…" or "When addressing the need for advanced generative AI solutions…").
   - **Task:** Define the specific responsibility or challenge aligned with the job's requirements (e.g., "To design and implement scalable AI models using Azure OpenAI…").
   - **Action:** Describe the technical actions taken, using job-specific verbs and detailed technology stack information (e.g., "Leveraged containerization with Docker and orchestrated microservices via Kubernetes to deploy models in a secure, scalable environment").
   - **Result:** Quantify the impact with clear, job-relevant metrics (e.g., "Achieved a 3.2x throughput increase" or "Reduced processing time by 80%").

3. **Enhanced Technical Detailing:**  
   - Convert simple technology lists into detailed, hierarchical representations that include versions and relevant frameworks (e.g., "Python → Python 3.10 (NumPy, PyTorch 2.0, FastAPI)").
   - Enrich work experience descriptions with architectural context and measurable performance metrics (e.g., "Designed event-driven microservices handling 25k RPS").
   - Use internal annotations (e.g., [JD: ...]) during processing solely as references. These annotations must be completely removed from the final output.

4. **Strict Transformation Constraints:**  
   - Preserve the original employment chronology and all factual details.
   - Maintain a 1:1 mapping between the job description requirements and the resume content.
   - If a direct match is missing, map the resume content to a relevant job description concept (e.g., "Legacy system modernization" → "Cloud migration patterns").
   - Every claim of improvement must be supported with a concrete, quantifiable metric.
   - Eliminate all internal transformation annotations (e.g., [JD: ...]) from the final output.

**Your Task:**  
Transform the resume according to these principles, ensuring the final output is a polished, ATS-optimized document that accurately reflects the candidate's technical expertise and directly addresses the job description—without any internal annotations.


        `,
        prompt: `
    This is the Resume:
    ${JSON.stringify(resume, null, 2)}
    
    This is the Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    `,
      });

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
  const modelCandidates: AIConfig[] = [
    { model: 'z-ai/glm-4.6:exacto', apiKeys: config?.apiKeys || [] }, // prioritize GLM for parsing
    { model: 'openai/gpt-5-nano', apiKeys: config?.apiKeys || [] }, // fast/free courtesy model for formatting
    { model: 'openai/gpt-oss-120b', apiKeys: config?.apiKeys || [] },
    { model: 'openai/gpt-oss-20b', apiKeys: config?.apiKeys || [] },
    { model: 'deepseek/deepseek-v3.2:nitro', apiKeys: config?.apiKeys || [] },
  ];

  // Check rate limit once per formatting request
  await checkRateLimit(id);

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
      const aiClient = isPro ? initializeAIClient(candidate, isPro, true) : initializeAIClient(candidate);
      const { object } = await generateObject({
        model: aiClient as LanguageModelV1,
        temperature: 0.7, // reduced for better structured output compatibility
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
      });

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
