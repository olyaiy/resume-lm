/**
 * AI Utility Functions for Resume Generation and Enhancement
 * This module provides server-side functions for interacting with OpenAI's API
 * to generate, format, and improve resume content.
 */
'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema, openAiWorkExperienceSchema, openAiProjectSchema } from "@/lib/schemas";
import { Profile, Resume } from "@/lib/types";
import { RESUME_FORMATTER_SYSTEM_MESSAGE, RESUME_IMPORTER_SYSTEM_MESSAGE, WORK_EXPERIENCE_GENERATOR_MESSAGE, WORK_EXPERIENCE_IMPROVER_MESSAGE, PROJECT_GENERATOR_MESSAGE, PROJECT_IMPROVER_MESSAGE, TEXT_IMPORT_SYSTEM_MESSAGE } from "@/lib/prompts";
import { FunctionHandler, functionSchemas } from "./function-handler";

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
        "json_schema": openAiWorkExperienceSchema
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
    TEXT_IMPORT_SYSTEM_MESSAGE,
    {
      role: "user",
      content: `Please analyze the following text and extract relevant professional information:\n\n${text}`
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
 * Streams a chat response from the AI assistant
 * @param messages - Array of previous chat messages
 * @param resume - The current resume being edited
 * @returns Streaming response from OpenAI
 */
export async function streamChatResponse(
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  resume: Resume
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI resume assistant helping users craft and improve their resumes. You have access to functions that can read and modify resume content. Follow this process for every request:
                    1. If the request involves modifying content, first use read_resume to understand the current state
                    2. Think through your proposed changes and explain your reasoning briefly
                    3. Execute the necessary modifications immediately using the available functions
                    4. Provide a concise summary of what you've done

                    Available functions:
                    - read_resume: View current resume content by section
                    - update_name: Update first and last name
                    - modify_resume: Add, update, or delete entries in any section

                    Be direct, professional, and execute changes without waiting for confirmation. Focus on actionable improvements that enhance the resume's impact.`
        },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      functions: [functionSchemas.read_resume, functionSchemas.update_name],
      function_call: "auto"
    });

    // Create an async generator to handle the stream
    async function* processStream() {
      try {
        for await (const chunk of response) {
          // Simply pass through all chunks, including function calls
          yield chunk;
        }
      } catch (error) {
        console.error('❌ Error in stream processing:', error);
        throw error;
      }
    }

    return processStream();
  } catch (error) {
    console.error('❌ Fatal error in streamChatResponse:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Failed to stream chat response: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
