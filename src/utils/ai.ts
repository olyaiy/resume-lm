/**
 * AI Utility Functions for Resume Generation and Enhancement
 * This module provides server-side functions for interacting with OpenAI's API
 * to generate, format, and improve resume content.
 */
'use server';
import { openai as openaiVercel } from '@ai-sdk/openai';
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from 'ai';
import { z } from 'zod';
import { 
  simplifiedJobSchema, 
  simplifiedResumeSchema, 
  textImportSchema,
  workExperienceBulletPointsSchema,
  projectAnalysisSchema,
  workExperienceItemsSchema
} from "@/lib/zod-schemas";
import { Job, Resume, WorkExperience } from "@/lib/types";
import { 
  // RESUME_FORMATTER_SYSTEM_MESSAGE, 
  WORK_EXPERIENCE_GENERATOR_MESSAGE, 
  WORK_EXPERIENCE_IMPROVER_MESSAGE, 
  PROJECT_GENERATOR_MESSAGE, 
  PROJECT_IMPROVER_MESSAGE, 
  TEXT_ANALYZER_SYSTEM_MESSAGE 
} from "@/lib/prompts";

// Model declarations
const defaultModel = openaiVercel("gpt-4o-mini");
const tailoringModel = anthropic("claude-3-5-sonnet-20240620");






// WORK EXPERIENCE BULLET POINTS
export async function generateWorkExperiencePoints(
  position: string,
  company: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = ''
) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: workExperienceBulletPointsSchema
    }),
    prompt: `Position: ${position}
Company: ${company}
Technologies: ${technologies.join(', ')}
Target Role: ${targetRole}
Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ''}`,
    system: WORK_EXPERIENCE_GENERATOR_MESSAGE.content as string,
  });

  return object.content;
}

// WORK EXPERIENCE BULLET POINTS IMPROVEMENT
export async function improveWorkExperience(point: string, customPrompt?: string) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: z.string().describe("The improved work experience bullet point")
    }),
    prompt: `Please improve this work experience bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ''}:\n\n"${point}"`,
    system: WORK_EXPERIENCE_IMPROVER_MESSAGE.content as string,
  });

  return object.content;
}

// PROJECT BULLET POINTS IMPROVEMENT
export async function improveProject(point: string, customPrompt?: string) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: z.string().describe("The improved project bullet point")
    }),
    prompt: `Please improve this project bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ''}:\n\n"${point}"`,
    system: PROJECT_IMPROVER_MESSAGE.content as string,
  });

  return object.content;
}

// PROJECT BULLET POINTS
export async function generateProjectPoints(
  projectName: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = ''
) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: projectAnalysisSchema
    }),
    prompt: `Project Name: ${projectName}
Technologies: ${technologies.join(', ')}
Target Role: ${targetRole}
Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ''}`,
    system: PROJECT_GENERATOR_MESSAGE.content as string,
  });

  return object.content;
}

// Text Import for profile
export async function processTextImport(text: string) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: textImportSchema
    }),
    prompt: text,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });

  return object.content;
}

export async function modifyWorkExperience(
  experience: WorkExperience[],
  prompt: string
) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: workExperienceItemsSchema
    }),
    prompt: `Please modify this work experience entry according to these instructions: ${prompt}\n\nCurrent work experience:\n${JSON.stringify(experience, null, 2)}`,
    system: `You are a professional resume writer. Modify the given work experience based on the user's instructions. 
    Maintain professionalism and accuracy while implementing the requested changes. 
    Keep the same company and dates, but modify other fields as requested.
    Use strong action verbs and quantifiable achievements where possible.`,
  });

  return object.content;
}

export async function addTextToResume(prompt: string, existingResume: Resume) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: textImportSchema
    }),
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });
  
  // Merge the AI-generated content with existing resume data
  const updatedResume = {
    ...existingResume,
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && { phone_number: object.content.phone_number }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && { linkedin_url: object.content.linkedin_url }),
    ...(object.content.github_url && { github_url: object.content.github_url }),
    
    work_experience: [...existingResume.work_experience, ...(object.content.work_experience || [])],
    education: [...existingResume.education, ...(object.content.education || [])],
    skills: [...existingResume.skills, ...(object.content.skills || [])],
    projects: [...existingResume.projects, ...(object.content.projects || [])],
    certifications: [...(existingResume.certifications || []), ...(object.content.certifications || [])],
  };
  
  return updatedResume;
}

export async function convertTextToResume(prompt: string, existingResume: Resume) {
  const { object } = await generateObject({
    model: defaultModel,
    schema: z.object({
      content: textImportSchema
    }),
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });
  
  const updatedResume = {
    ...existingResume,
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && { phone_number: object.content.phone_number }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && { linkedin_url: object.content.linkedin_url }),
    ...(object.content.github_url && { github_url: object.content.github_url }),
    
    work_experience: [...existingResume.work_experience, ...(object.content.work_experience || [])],
    education: [...existingResume.education, ...(object.content.education || [])],
    skills: [...existingResume.skills, ...(object.content.skills || [])],
    projects: [...existingResume.projects, ...(object.content.projects || [])],
    certifications: [...(existingResume.certifications || []), ...(object.content.certifications || [])],
  };
  
  return updatedResume;
}

export async function tailorResumeToJob(resume: Resume, jobListing: z.infer<typeof simplifiedJobSchema>) {
  const { object } = await generateObject({
    model: tailoringModel,
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
}

export async function formatJobListing(jobListing: string) {
  const { object } = await generateObject({
    model: defaultModel,
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
}