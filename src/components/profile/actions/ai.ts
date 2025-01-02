'use server';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { RESUME_FORMATTER_SYSTEM_MESSAGE } from "@/lib/prompts";

type ApiKey = {
  service: string;
  key: string;
  addedAt: string;
};

type AIConfig = {
  model: string;
  apiKeys: Array<ApiKey>;
};

// Initialize AI client based on model and API keys
function initializeAIClient(config?: AIConfig) {
  if (!config) {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })('gpt-4o-mini');
  }

  const { model, apiKeys } = config;
  
  // Determine which service to use based on model name
  if (model.startsWith('claude')) {
    const anthropicKey = apiKeys.find(k => k.service === 'anthropic')?.key;
    if (!anthropicKey) throw new Error('Anthropic API key not found');
    return createAnthropic({ apiKey: anthropicKey })(model);
  } 
  
  // Default to OpenAI
  const openaiKey = apiKeys.find(k => k.service === 'openai')?.key;
  if (!openaiKey) throw new Error('OpenAI API key not found');
  return createOpenAI({ apiKey: openaiKey })(model);
}

// RESUME -> PROFILE
export async function formatProfileWithAI(
  userMessages: string,
  config?: AIConfig
) {
    try {
      const aiClient = initializeAIClient(config);
      
      // Log the model being used
      console.log('Using AI Model:', config?.model || 'gpt-4o-mini (default)');

      const { object } = await generateObject({
        model: aiClient,
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
            })).optional(),
            certifications: z.array(z.object({
              name: z.string(),
              issuer: z.string(),
              date_acquired: z.string().optional(),
              expiry_date: z.string().optional(),
              credential_id: z.string().optional(),
              url: z.string().optional()
            })).optional()
          })
        }),
        prompt: `Please analyze this resume text and extract all relevant information into a structured profile format. 
                Include all sections (personal info, work experience, education, skills, projects, certifications) if present.
                Ensure all arrays (like description, technologies, achievements) are properly formatted as arrays.
                For any missing or unclear information, use optional fields rather than making assumptions.
  
                Resume Text:
  ${userMessages}`,
        system: RESUME_FORMATTER_SYSTEM_MESSAGE.content as string,
      });

  
    //   console.dir(object.content, { depth: null, colors: true });
      console.log('USING THE MODEL: ', aiClient);
  
      return object.content;
    } catch (error) {
      throw error;
    }
  }