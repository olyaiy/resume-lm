'use server';

import { 
  // RESUME_IMPORTER_SYSTEM_MESSAGE,
   TEXT_ANALYZER_SYSTEM_MESSAGE } from "@/lib/prompts";
import {
  //  Profile, 
  Resume } from "@/lib/types";
import {
  //  simplifiedResumeSchema, 
  textImportSchema } from "@/lib/zod-schemas";
import { generateObject } from "ai";
import { z } from "zod";
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';

// AI ACTIONS FOR RESUME MANAGEMENT

// PROFILE -> RESUME
// export async function importProfileToResume(
//   profile: Profile, 
//   targetRole: string,
//   config?: AIConfig
// ) {
//   try {
//     const aiClient = initializeAIClient(config);
    
//     // Log the model being used
//     console.log('Using AI Model:', config?.model || 'gpt-4o-mini (default)');

//     const { object } = await generateObject({
//       model: aiClient,
//       schema: z.object({
//         content: simplifiedResumeSchema
//       }),
//       prompt: `Please analyze my profile and recommend which experiences and skills would be most relevant for a resume targeting the role of "${targetRole}". Here's my complete profile: ${JSON.stringify(profile, null, 2)}`,
//       system: RESUME_IMPORTER_SYSTEM_MESSAGE.content as string,
//     });

//     console.log('USING THE MODEL: ', aiClient);

//     return object.content;
//   } catch (error) {
//     throw error;
//   }
// }

// TEXT CONTENT -> RESUME
export async function convertTextToResume(prompt: string, existingResume: Resume, config?: AIConfig) {
  const aiClient = initializeAIClient(config);
  
  const { object } = await generateObject({
    model: aiClient,
    schema: z.object({
      content: textImportSchema
    }),
    system: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
    prompt: `Extract relevant resume information from the following text, including basic information (name, contact details, etc) and professional experience. Format them according to the schema:\n\n${prompt}`,
    
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