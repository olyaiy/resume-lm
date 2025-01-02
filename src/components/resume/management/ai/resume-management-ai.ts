'use server';

import { RESUME_IMPORTER_SYSTEM_MESSAGE } from "@/lib/prompts";
import { Profile } from "@/lib/types";
import { simplifiedResumeSchema } from "@/lib/zod-schemas";
import { generateObject } from "ai";
import { z } from "zod";
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';

// AI ACTIONS FOR RESUME MANAGEMENT

// PROFILE -> RESUME
export async function importProfileToResume(
  profile: Profile, 
  targetRole: string,
  config?: AIConfig
) {
  try {
    const aiClient = initializeAIClient(config);
    
    // Log the model being used
    console.log('Using AI Model:', config?.model || 'gpt-4o-mini (default)');

    const { object } = await generateObject({
      model: aiClient,
      schema: z.object({
        content: simplifiedResumeSchema
      }),
      prompt: `Please analyze my profile and recommend which experiences and skills would be most relevant for a resume targeting the role of "${targetRole}". Here's my complete profile: ${JSON.stringify(profile, null, 2)}`,
      system: RESUME_IMPORTER_SYSTEM_MESSAGE.content as string,
    });

    console.log('USING THE MODEL: ', aiClient);

    return object.content;
  } catch (error) {
    throw error;
  }
}