'use server';

// import { RESUME_IMPORTER_SYSTEM_MESSAGE, } from "@/lib/prompts";
import { Resume } from "@/lib/types";
import { textImportSchema, workExperienceBulletPointsSchema } from "@/lib/zod-schemas";
import { generateObject } from "ai";
import { z } from "zod";
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { getSubscriptionPlan } from "@/utils/actions/stripe/actions";
import { PROJECT_GENERATOR_MESSAGE, PROJECT_IMPROVER_MESSAGE, TEXT_ANALYZER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE, WORK_EXPERIENCE_IMPROVER_MESSAGE } from "@/lib/prompts";
import { projectAnalysisSchema, workExperienceItemsSchema } from "@/lib/zod-schemas";
import { WorkExperience } from "@/lib/types";



// Base Resume Creation 
// TEXT CONTENT -> RESUME
export async function convertTextToResume(prompt: string, existingResume: Resume, targetRole: string, config?: AIConfig) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedConfig = config; // Keep parameter for future use
  
  // Hardcode to use gpt-4.1-nano for now
  const hardcodedConfig = { model: 'gpt-4.1-nano', apiKeys: [] };
  const aiClient = initializeAIClient(hardcodedConfig);

  
  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: textImportSchema
    }),
    system: `You are ResumeFormatter, an expert system specialized in analyzing complete resumes and converting them into a structured JSON object tailored for targeted job applications.

        Your task is to transform the complete resume text into a JSON object according to the provided schema. You will identify and extract the most relevant experiences, skills, projects, and educational background based on the target role. While doing so, you are allowed to make minimal formatting changes only to enhance clarity and highlight relevance—**do not reword, summarize, or alter the core details of any content.**

        CRITICAL DIRECTIVES:
        1. **Analysis & Selection:**
          - Analyze the full resume text that includes all user experiences, skills, projects, and education.
          - Identify the items that best match the target role: ${targetRole}.
          - Always include the education section:
            - If only one educational entry exists, include it.
            - If multiple entries exist, select the one(s) most relevant to the target role.

        2. **Formatting & Emphasis:**
          - Transform the resume into a JSON object following the schema, with sections such as basic information, professional experience, projects, skills, and education.
          - Preserve all original details, dates, and descriptions. Only modify the text for formatting purposes.
          - **Enhance relevance by marking keywords** within work experience descriptions, project details, achievements, and education details with bold formatting (i.e., wrap them with two asterisks like **this**). Apply this only to keywords or phrases that are highly relevant to the target role.
          - Do not add any formatting to section titles or headers.
          - Use empty arrays ([]) for any sections that do not contain relevant items.

        3. **Output Requirements:**
          - The final output must be a valid JSON object that adheres to the specified schema.
          - Include only the most relevant items, optimized for the target role.
          - Do not add any new information or rephrase the provided content—only apply minor formatting (like bolding) to emphasize key points.
        `,
    prompt: `INPUT:
    Extract and transform the resume information from the following text:
    ${prompt}
    Now, format this information into the JSON object according to the schema, ensuring it is optimized for the target role: ${targetRole}.`,
    
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
  };

  
  return updatedResume;
}



    // NEW WORK EXPERIENCE BULLET POINTS
    export async function generateWorkExperiencePoints(
      position: string,
      company: string,
      technologies: string[],
      targetRole: string,
      numPoints: number = 3,
      customPrompt: string = '',
      config?: AIConfig
    ) { 
      const subscriptionPlan = await getSubscriptionPlan();
      const isPro = subscriptionPlan === 'pro';
      const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
  
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
          const subscriptionPlan = await getSubscriptionPlan();
          const isPro = subscriptionPlan === 'pro';
          const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
          
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
          
          const subscriptionPlan = await getSubscriptionPlan();
          const isPro = subscriptionPlan === 'pro';
          const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);

  
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
      
      // NEW PROJECT BULLET POINTS
      export async function generateProjectPoints(
          projectName: string,
          technologies: string[],
          targetRole: string,
          numPoints: number = 3,
          customPrompt: string = '',
          config?: AIConfig
      ) {
          const subscriptionPlan = await getSubscriptionPlan();
          const isPro = subscriptionPlan === 'pro';
          const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
          
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
          const subscriptionPlan = await getSubscriptionPlan();
          const isPro = subscriptionPlan === 'pro';
          const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
          
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
          const subscriptionPlan = await getSubscriptionPlan();
          const isPro = subscriptionPlan === 'pro';
          const aiClient = isPro ? initializeAIClient(config, isPro) : initializeAIClient(config);
  
          
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
          };
          
          return updatedResume;
      }