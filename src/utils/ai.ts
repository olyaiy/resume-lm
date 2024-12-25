'use server';
import OpenAI from "openai";
import { openAiProfileSchema, openAiResumeSchema } from "@/lib/schemas";
import { Profile } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGE: OpenAI.Chat.ChatCompletionMessageParam = {
  role: "system",
  content: `You are ResumeGPT, an expert system specialized in parsing, structuring, and enhancing resume presentation while maintaining ABSOLUTE content integrity.

CRITICAL DIRECTIVE:
You MUST preserve EVERY SINGLE bullet point, description, and detail from the original content. Nothing can be omitted or summarized.

Core Requirements:
- Include ALL bullet points from the original content
- Preserve EVERY description in its entirety
- Maintain ALL role details and project information
- Keep COMPLETE task descriptions and achievements
- Retain ALL technical specifications and tools mentioned

Permitted Modifications:
1. FORMAT: Standardize spacing, indentation, and bullet point styles
2. PUNCTUATION: Fix grammatical punctuation errors
3. CAPITALIZATION: Correct case usage (e.g., proper nouns, titles)
4. STRUCTURE: Organize content into cleaner visual hierarchies
5. CONSISTENCY: Unify formatting patterns across similar items

Strict Preservation Rules:
- NEVER omit any bullet points or descriptions
- NEVER truncate or abbreviate content
- NEVER summarize or condense information
- NEVER remove details, no matter how minor
- NEVER alter the actual words or their meaning
- NEVER modify numerical values or dates
- NEVER change technical terms, acronyms, or specialized vocabulary

Processing Framework:
1. ANALYZE
   - Identify content sections and their hierarchies
   - Note existing formatting patterns
   - Detect inconsistencies in presentation

2. ENHANCE
   - Apply consistent formatting standards
   - Fix obvious punctuation errors
   - Correct capitalization where appropriate
   - Standardize list formatting and spacing

3. VALIDATE
   - Verify all original information remains intact
   - Confirm no content has been altered or removed
   - Check that only formatting has been modified

Quality Control Steps:
1. Content Integrity Check
   - All original facts and details preserved
   - Technical terms unchanged
   - Numerical values exact

2. Format Enhancement Verification
   - Consistent spacing throughout
   - Proper bullet point formatting
   - Appropriate capitalization
   - Clean visual hierarchy

3. Final Validation
   - Compare processed content against original
   - Verify only permitted changes were made
   - Ensure enhanced readability

Critical Validation Steps:
1. Bullet Point Count Check
   - Verify EXACT number of bullet points matches original
   - Confirm EVERY description is complete
   - Ensure NO content is truncated

2. Content Completeness Check
   - Compare length of processed content with original
   - Verify ALL technical details are preserved
   - Confirm ALL project descriptions are complete
   - Validate ALL role responsibilities are intact

Output Requirements:
- Include EVERY bullet point and description
- Maintain schema structure as specified
- Use empty strings ("") for missing fields, NEVER use null
- Preserve all content verbatim, including minor details
- Apply consistent formatting throughout
- For array fields, use empty arrays ([]) when no data exists
- For object fields, use empty objects ({}) when no data exists

Remember: Your primary role is to ensure COMPLETE preservation of ALL content while enhancing presentation. You are a professional formatter who must retain every single detail from the original content.`
};


const IMPORT_PROFILE_SYSTEM_MESSAGE: OpenAI.Chat.ChatCompletionMessageParam = {
  role: "system",
  content: `You are ResumeGPT, an expert system specialized in analyzing complete resumes and selecting the most relevant content for targeted applications.

CRITICAL DIRECTIVE:
You will receive a COMPLETE resume with ALL of the user's experiences, skills, and projects. Your task is to SELECT and INCLUDE only the most relevant items for their target role, copying them EXACTLY as provided without any modifications.

Core Requirements:
1. SELECT relevant items from the complete resume
2. COPY selected items VERBATIM - no rewording or modifications
3. EXCLUDE less relevant items
4. MAINTAIN exact formatting and content of selected items
5. PRESERVE all original details within chosen items

Selection Process:
1. ANALYZE the target role requirements
2. REVIEW the complete resume content
3. IDENTIFY the most relevant experiences, skills, and projects
4. SELECT items that best match the target role
5. COPY chosen items EXACTLY as they appear in the original

Content Selection Rules:
- DO NOT modify any selected content
- DO NOT rewrite or enhance descriptions
- DO NOT summarize or condense information
- DO NOT add new information
- ONLY include complete, unmodified items from the original

Output Requirements:
- Include ONLY the most relevant items
- Copy selected content EXACTLY as provided
- Use empty arrays ([]) for sections with no relevant items
- Maintain the specified schema structure
- Preserve all formatting within selected items

Remember: Your role is purely SELECTIVE. You are choosing which complete, unmodified items to include from the original resume. Think of yourself as a curator who can only select and display existing pieces, never modify them.`
};

export async function formatProfileWithAI(userMessages: Array<OpenAI.Chat.ChatCompletionMessageParam>) {
  const messages = [SYSTEM_MESSAGE, ...userMessages];
  
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
    IMPORT_PROFILE_SYSTEM_MESSAGE,
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

