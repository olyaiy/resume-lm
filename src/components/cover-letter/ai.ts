'use server';

import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';
import { streamText } from 'ai';

export async function generateCoverLetter(
  resume: string,
  jobDescription: string,
  config?: AIConfig
) {
  const aiClient = initializeAIClient(config);
  
  try {
    const result = await streamText({
      model: aiClient,
      system: `You are a professional cover letter writer. Create a compelling cover letter that:
              1. Matches the candidate's resume with the job requirements
              2. Highlights relevant skills and experiences
              3. Maintains a professional tone
              4. Is concise (3-4 paragraphs max)
              5. Avoids generic phrases and clichés`,
      prompt: `Generate a cover letter based on the following resume and job description:
              
              Resume:
              ${resume}
              
              Job Description:
              ${jobDescription}
              
              Important Notes:
              - Address the hiring manager directly if possible
              - Focus on measurable achievements from the resume
              - Tailor the letter to the specific job requirements
              - Keep it professional but approachable`
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

