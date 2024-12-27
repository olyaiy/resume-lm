'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema, openAiWorkExperienceSchema, openAiProjectSchema } from "@/lib/schemas";
import { Profile } from "@/lib/types";
import { RESUME_FORMATTER_SYSTEM_MESSAGE, RESUME_IMPORTER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE, WORK_EXPERIENCE_IMPROVER_MESSAGE, PROJECT_GENERATOR_MESSAGE, PROJECT_IMPROVER_MESSAGE, TEXT_IMPORT_SYSTEM_MESSAGE } from "@/lib/prompts";

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
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      temperature: 0.7,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Work Experience Improver Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Remove any quotation marks from the response
    const improvedPoint = response.choices[0].message.content.replace(/^"(.*)"$|^'(.*)'$/, '$1$2');

    // Log the improved point for debugging
    console.log('\n=== AI WORK EXPERIENCE IMPROVEMENT ===');
    console.log('Original:', point);
    console.log('Improved:', improvedPoint);
    console.log('\n=== END IMPROVEMENT ===\n');

    return improvedPoint;
  } catch (error) {
    console.error('[AI Work Experience Improver Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to improve work experience point: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

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
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      temperature: 0.7,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Project Improver Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Remove any quotation marks from the response
    const improvedPoint = response.choices[0].message.content.replace(/^"(.*)"$|^'(.*)'$/, '$1$2');

    // Log the improved point for debugging
    console.log('\n=== AI PROJECT IMPROVEMENT ===');
    console.log('Original:', point);
    console.log('Improved:', improvedPoint);
    console.log('\n=== END IMPROVEMENT ===\n');

    return improvedPoint;
  } catch (error) {
    console.error('[AI Project Improver Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to improve project point: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

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
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiProjectSchema
      },
      temperature: 0.7,
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.2
    });

    if (!response.choices[0].message.content) {
      console.error('[AI Project Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Log the generated points for debugging
    console.log('\n=== AI PROJECT POINTS ===');
    console.log('Project:', projectName);
    console.log('\nGenerated Points:');
    console.log(response.choices[0].message.content);
    console.log('\n=== END POINTS ===\n');

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[AI Project Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to generate project points: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function processTextImport(text: string) {
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    TEXT_IMPORT_SYSTEM_MESSAGE,
    {
      role: "user",
      content: `Please analyze the following text and extract relevant professional information:\n\n${text}`
    }
  ];

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
      console.error('[AI Text Import Error] No content in response:', response);
      throw new Error('No content received from OpenAI');
    }

    // Log the complete analysis
    console.log('\n=== AI TEXT IMPORT ANALYSIS ===');
    console.log('\nExtracted Information:');
    console.log(response.choices[0].message.content);
    console.log('\n=== END ANALYSIS ===\n');

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[AI Text Import Error]:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      statusCode: (error as any)?.status || (error as any)?.statusCode,
    });
    throw new Error('Failed to process text import: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

