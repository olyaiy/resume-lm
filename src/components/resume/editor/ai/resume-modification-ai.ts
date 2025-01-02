'use server';

import { generateObject } from "ai";
import { z } from "zod";
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { PROJECT_GENERATOR_MESSAGE, PROJECT_IMPROVER_MESSAGE, TEXT_ANALYZER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE, WORK_EXPERIENCE_IMPROVER_MESSAGE } from "@/lib/prompts";
import { workExperienceBulletPointsSchema } from "@/lib/zod-schemas";
import { projectAnalysisSchema, workExperienceItemsSchema } from "@/lib/zod-schemas";
import { textImportSchema } from "@/lib/zod-schemas";
import { WorkExperience, Resume } from "@/lib/types";

    // WORK EXPERIENCE BULLET POINTS
    export async function generateWorkExperiencePoints(
    position: string,
    company: string,
    technologies: string[],
    targetRole: string,
    numPoints: number = 3,
    customPrompt: string = '',
    config?: AIConfig
  ) {
    const aiClient = initializeAIClient(config);
    
    const { object } = await generateObject({
      model: aiClient,
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
    export async function improveWorkExperience(point: string, customPrompt?: string, config?: AIConfig) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
        schema: z.object({
            content: z.string().describe("The improved work experience bullet point")
        }),
        prompt: `Please improve this work experience bullet point while maintaining its core message and truthfulness${customPrompt ? `. Additional requirements: ${customPrompt}` : ''}:\n\n"${point}"`,
        system: WORK_EXPERIENCE_IMPROVER_MESSAGE.content as string,
        });
    
        return object.content;
    }
  
    // PROJECT BULLET POINTS IMPROVEMENT
    export async function improveProject(point: string, customPrompt?: string, config?: AIConfig) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
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
        customPrompt: string = '',
        config?: AIConfig
    ) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
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
    export async function processTextImport(text: string, config?: AIConfig) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
        schema: z.object({
            content: textImportSchema
        }),
        prompt: text,
        system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
        });
    
        return object.content;
    }
    
    // WORK EXPERIENCE MODIFICATION
    export async function modifyWorkExperience(
        experience: WorkExperience[],
        prompt: string,
        config?: AIConfig
    ) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
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
    
    // ADDING TEXT CONTENT TO RESUME
    export async function addTextToResume(prompt: string, existingResume: Resume, config?: AIConfig) {
        const aiClient = initializeAIClient(config);
        
        const { object } = await generateObject({
        model: aiClient,
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