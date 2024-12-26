'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema, openAiWorkExperienceSchema } from "@/lib/schemas";
import { Profile } from "@/lib/types";
import { RESUME_FORMATTER_SYSTEM_MESSAGE, RESUME_IMPORTER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE } from "@/lib/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function formatProfileWithAI(userMessages: Array<OpenAI.Chat.ChatCompletionMessageParam>) {
  const messages = [RESUME_FORMATTER_SYSTEM_MESSAGE, ...userMessages];
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiProfileSchema
      },
      temperature: 1,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Format Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[AI Format Error] Details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      messages: messages.map(m => ({ role: m.role, contentLength: m.content?.length }))
    });
    throw new Error('Failed to format profile information');
  }
}

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
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiResumeSchema
      },
      temperature: 1,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Import Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Log the complete analysis
    console.log('\n=== AI PROFILE IMPORT ANALYSIS ===');
    console.log('Target Role:', targetRole);
    console.log('\nAI Recommendations:');
    console.log(response.choices[0].message.content);
    console.log('\n=== END ANALYSIS ===\n');

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[AI Import Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to import profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function generateWorkExperiencePoints(
  position: string,
  company: string,
  technologies: string[],
  targetRole: string,
  isCurrentRole: boolean = false
) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    WORK_EXPERIENCE_GENERATOR_MESSAGE,
    {
      role: "user",
      content: `Please generate impactful bullet points for the following work experience:

Position: ${position}
Company: ${company}
Technologies Used: ${technologies.join(', ')}
Target Role: ${targetRole}
Current Role: ${isCurrentRole ? 'Yes' : 'No'}

Generate bullet points that:
1. Highlight achievements and impact
2. Incorporate the listed technologies appropriately
3. Align with the target role of "${targetRole}"
4. Use ${isCurrentRole ? 'present' : 'past'} tense
5. Follow ATS-optimization best practices

Please provide 3-8 bullet points that would make this experience stand out to both ATS systems and human recruiters.`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiWorkExperienceSchema
      },
      temperature: 0.7,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Work Experience Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Log the generated points for debugging
    console.log('\n=== AI WORK EXPERIENCE POINTS ===');
    console.log('Position:', position);
    console.log('Company:', company);
    console.log('\nGenerated Points:');
    console.log(response.choices[0].message.content);
    console.log('\n=== END POINTS ===\n');

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[AI Work Experience Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to generate work experience points: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

