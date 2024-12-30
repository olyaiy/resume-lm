/**
 * AI Utility Functions for Resume Generation and Enhancement
 * This module provides server-side functions for interacting with OpenAI's API
 * to generate, format, and improve resume content.
 */
'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema, openAiWorkExperienceBulletPointsSchema, openAiProjectSchema, openAiWorkExperienceSchema } from "@/lib/schemas";
import { Job, Profile, Resume, WorkExperience } from "@/lib/types";
import { RESUME_FORMATTER_SYSTEM_MESSAGE, RESUME_IMPORTER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE, WORK_EXPERIENCE_IMPROVER_MESSAGE, PROJECT_GENERATOR_MESSAGE, PROJECT_IMPROVER_MESSAGE, TEXT_IMPORT_SYSTEM_MESSAGE, AI_ASSISTANT_SYSTEM_MESSAGE, TEXT_ANALYZER_SYSTEM_MESSAGE } from "@/lib/prompts";
import { openai as openaiVercel } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { resumeSchema, simplifiedJobSchema, simplifiedResumeSchema, textImportSchema } from "@/lib/zod-schemas";


// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/**
 * Formats a user's profile information using AI to ensure consistent and professional presentation
 * @param userMessages - Array of chat messages containing profile information
 * @returns Formatted profile data in JSON format
 * @throws Error if OpenAI API call fails or returns invalid response
 */
export async function formatProfileWithAI(userMessages: Array<OpenAI.Chat.ChatCompletionMessageParam>) {
  const messages = [RESUME_FORMATTER_SYSTEM_MESSAGE, ...userMessages];
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Optimized model for resume formatting
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiProfileSchema
      },
      temperature: 1,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error('Failed to format profile information');
  }
}

/**
 * Analyzes a user's profile and generates tailored resume content for a specific role
 * @param profile - User's complete profile information
 * @param targetRole - The job role being targeted
 * @returns Tailored resume content optimized for the target role
 * @throws Error if the AI processing fails
 */
export async function importProfileToResume(profile: Profile, targetRole: string) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    RESUME_IMPORTER_SYSTEM_MESSAGE,
    {
      role: "user",
      content: `Please analyze my profile and recommend which experiences and skills would be most relevant for a resume targeting the role of "${targetRole}". Here's my complete profile:
      ${JSON.stringify(profile, null, 2)}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiResumeSchema
      },
      temperature: 1,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error('Failed to import profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Generates professional bullet points for work experience
 * @param position - Job position title
 * @param company - Company name
 * @param technologies - Array of technologies used
 * @param targetRole - Target job role
 * @param numPoints - Number of bullet points to generate (default: 3)
 * @param customPrompt - Optional custom focus for the generated points
 * @returns Array of generated work experience bullet points
 */
export async function generateWorkExperiencePoints(
  position: string,
  company: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = ''
) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    WORK_EXPERIENCE_GENERATOR_MESSAGE,
    {
      role: "user",
      content: `Position: ${position}
Company: ${company}
Technologies: ${technologies.join(', ')}
Target Role: ${targetRole}
Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ''}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiWorkExperienceBulletPointsSchema
      },
      temperature: 0.7,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error('Failed to generate work experience points: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Enhances a single work experience bullet point
 * @param point - Original work experience bullet point
 * @param customPrompt - Optional custom requirements for improvement
 * @returns Improved version of the bullet point
 */
export async function improveWorkExperience(point: string, customPrompt?: string) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    WORK_EXPERIENCE_IMPROVER_MESSAGE,
    {
      role: "user",
      content: `Please improve this work experience bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ''}:\n\n"${point}"`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    // Remove any quotation marks from the response
    return response.choices[0].message.content.replace(/^"(.*)"$|^'(.*)'$/, '$1$2');
  } catch (error) {
    throw new Error('Failed to improve work experience point: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Enhances a single project bullet point
 * @param point - Original project bullet point
 * @param customPrompt - Optional custom requirements for improvement
 * @returns Improved version of the project bullet point
 */
export async function improveProject(point: string, customPrompt?: string) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    PROJECT_IMPROVER_MESSAGE,
    {
      role: "user",
      content: `Please improve this project bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ''}:\n\n"${point}"`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    // Remove any quotation marks from the response
    return response.choices[0].message.content.replace(/^"(.*)"$|^'(.*)'$/, '$1$2');
  } catch (error) {
    throw new Error('Failed to improve project point: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Generates professional bullet points for projects
 * @param projectName - Name of the project
 * @param technologies - Array of technologies used
 * @param targetRole - Target job role
 * @param numPoints - Number of bullet points to generate (default: 3)
 * @param customPrompt - Optional custom focus for the generated points
 * @returns Array of generated project bullet points
 */
export async function generateProjectPoints(
  projectName: string,
  technologies: string[],
  targetRole: string,
  numPoints: number = 3,
  customPrompt: string = ''
) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    PROJECT_GENERATOR_MESSAGE,
    {
      role: "user",
      content: `Project Name: ${projectName}
Technologies: ${technologies.join(', ')}
Target Role: ${targetRole}
Number of Points: ${numPoints}${customPrompt ? `\nCustom Focus: ${customPrompt}` : ''}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiProjectSchema
      },
      temperature: 0.7,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error('Failed to generate project points: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Processes raw text input to extract structured professional information
 * @param text - Raw text containing professional information
 * @returns Structured profile data extracted from the text
 */
export async function processTextImport(text: string) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    TEXT_ANALYZER_SYSTEM_MESSAGE,
    {
      role: "user",
      content: `:\n\n${text}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiProfileSchema
      },
      temperature: 1,
      max_tokens: 8133,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error('Failed to process text import: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Modifies a work experience entry based on a custom prompt
 * @param experience - Original work experience entry
 * @param prompt - Custom instructions for modification
 * @returns Modified work experience entry
 */
export async function modifyWorkExperience(
  experience: WorkExperience[],
  prompt: string
) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    {
      role: "system",
      content: `You are a professional resume writer. Modify the given work experience based on the user's instructions. 
      Maintain professionalism and accuracy while implementing the requested changes. 
      Keep the same company and dates, but modify other fields as requested.
      Use strong action verbs and quantifiable achievements where possible.`
    },
    {
      role: "user",
      content: `Please modify this work experience entry according to these instructions: ${prompt}

Current work experience:
${JSON.stringify(experience, null, 2)}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiWorkExperienceSchema
      },
      temperature: 0.7,
      max_tokens: 8287,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(response.choices[0].message.content) as WorkExperience;
  } catch (error) {
    throw new Error('Failed to modify work experience: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}


export async function addTextToResume(prompt: string, existingResume: Resume) {
  const { object } = await generateObject({
    model: openaiVercel("gpt-4o-mini"),
    schema: z.object({
      content: textImportSchema
    }),
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  });
  
  // Merge the AI-generated content with existing resume data
  const updatedResume = {
    ...existingResume,
    // Update basic information if provided
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && { phone_number: object.content.phone_number }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && { linkedin_url: object.content.linkedin_url }),
    ...(object.content.github_url && { github_url: object.content.github_url }),
    
    // Merge section arrays
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
    model: openaiVercel("gpt-4o-mini"),
    schema: z.object({
      content: textImportSchema
    }),
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
  
  });
  
  // Merge the AI-generated content with existing resume data
  const updatedResume = {
    ...existingResume,
    // Update basic information if provided
    ...(object.content.first_name && { first_name: object.content.first_name }),
    ...(object.content.last_name && { last_name: object.content.last_name }),
    ...(object.content.email && { email: object.content.email }),
    ...(object.content.phone_number && { phone_number: object.content.phone_number }),
    ...(object.content.location && { location: object.content.location }),
    ...(object.content.website && { website: object.content.website }),
    ...(object.content.linkedin_url && { linkedin_url: object.content.linkedin_url }),
    ...(object.content.github_url && { github_url: object.content.github_url }),
    
    // Merge section arrays
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
    model: openaiVercel("gpt-4o-mini"),
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

  console.log('THIS IS THE BASE RESUME\n');
  console.dir(resume, { depth: null, colors: true });

  console.log('THIS IS THE TAILORED RESUME\n');
  console.dir(object.content, { depth: null, colors: true });


  return object.content satisfies z.infer<typeof simplifiedResumeSchema>;
}




export async function formatJobListing(jobListing: string) {
  

  const { object } = await generateObject({
    model: openaiVercel("gpt-4o-mini"),
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