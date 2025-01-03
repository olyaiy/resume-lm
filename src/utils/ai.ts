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
    - Keywords are normalized (e.g., "React.js" → "React")
    - Skills are deduplicated and categorized
    - Required vs. preferred skills are distinguished
    - Seniority level is inferred from context
    Job Listing Text:${jobListing}`,    
    system: `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of technical roles and industry requirements.
  Your task is to:
  1. Parse job listings with high precision
  2. Extract and categorize keywords that match modern ATS systems
  3. Identify both explicit and implicit requirements
  4. Maintain context-awareness for industry-specific terminology
  5. Recognize variations of the same skill (e.g., "AWS" = "Amazon Web Services")
    Focus on accuracy and relevance. Do not infer or add information not present in the original text.`,
  });

  return object.content satisfies Partial<Job>;
  } catch (error) {
    console.error('Error formatting job listing:', error);
    throw error;
  }
}