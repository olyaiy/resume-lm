'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema } from "@/lib/schemas";
import { Profile } from "@/lib/types";
import { RESUME_FORMATTER_SYSTEM_MESSAGE, RESUME_IMPORTER_SYSTEM_MESSAGE } from "@/lib/prompts";

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

  // Log the system message and user prompt before sending
  console.log('\n=== AI IMPORT PROMPT ===');
  console.log('System Message:');
  // console.log(IMPORT_PROFILE_SYSTEM_MESSAGE.content);
  console.log('\nUser Message:');
  // console.log(messages[1].content);
  console.log('=== END PROMPT ===\n');
  
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

