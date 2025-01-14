'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema, 
} from "@/lib/zod-schemas";
import { Job, Resume } from "@/lib/types";
import { initializeAIClient, type AIConfig } from './ai-tools';

export async function tailorResumeToJob(
  resume: Resume, 
  jobListing: z.infer<typeof simplifiedJobSchema>,
  config?: AIConfig
) {
  const aiClient = initializeAIClient(config);
  try {
    const { object } = await generateObject({
      model: aiClient,
      schema: z.object({
      content: simplifiedResumeSchema,
    }),
    prompt: `
    You are a professional resume writer focusing on tailoring resumes
    to job descriptions.
    Please tailor the following resume to the job description. 
    Do not hallucinate or make up information. 
    Focus on relevent keywords and information from the job description.
    If no items are provided for a section, please leave it blank.
    
    Resume:
    ${JSON.stringify(resume, null, 2)}
    
    Job Description:
    ${JSON.stringify(jobListing, null, 2)}
    `,
  });

    return object.content satisfies z.infer<typeof simplifiedResumeSchema>;
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
}

export async function formatJobListing(jobListing: string, config?: AIConfig) {
  const aiClient = initializeAIClient(config);
  try {
    const { object } = await generateObject({
      model: aiClient,
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
            Do not include chain-of-thought or intermediate reasoning in the final output; provide only the structured results.`,
  
    prompt: `Analyze this job listing carefully and extract structured information.

              TASK 1 - ESSENTIAL INFORMATION:
              Extract the basic details (company, position, URL, location, salary).

              TASK 2 - KEYWORD ANALYSIS:
              1. Technical Skills: Identify all technical skills, programming languages, frameworks, and tools
              2. Soft Skills: Extract interpersonal and professional competencies
              3. Industry Knowledge: Capture domain-specific knowledge requirements
              4. Required Qualifications: List education, certifications, and experience levels
              5. Responsibilities: Key job functions and deliverables

              Format the output according to the schema, ensuring:
              - Keywords as they are (e.g., "React.js" → "React.js")
              - Skills are deduplicated and categorized
              - Seniority level is inferred from context
              Usage Notes:

              - If certain details (like salary or location) are missing, return "" (an empty string).
              - Adhere to the schema you have been provided, and format your response accordingly (e.g., JSON fields must match exactly).
              - Avoid exposing your internal reasoning.
              - DO NOT RETURN "<UNKNOWN>", if you are unsure of a piece of data, return an empty string.
              Job Listing Text: ${jobListing}`,});
  return object.content satisfies Partial<Job>;
  } catch (error) {
    console.error('Error formatting job listing:', error);
    throw error;
  }
}