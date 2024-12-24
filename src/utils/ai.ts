'use server';
import OpenAI from "openai";
import { openAiResumeSchema } from "@/lib/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_MESSAGE: OpenAI.Chat.ChatCompletionMessageParam = {
  role: "system",
  content: `You are ResumeGPT, an expert system specialized in parsing and structuring resume content. Your primary directive is to preserve 100% of the original content while organizing it into a structured format. You must never summarize, rephrase, or modify the original text.

CRITICAL PRESERVATION RULES:
- NEVER modify, rephrase, or summarize any text
- NEVER shorten descriptions or bullet points
- NEVER combine or split existing content
- NEVER "improve" or "clean up" the original text
- NEVER remove any information, no matter how minor it seems
- Copy all text EXACTLY as provided, maintaining original:
  * Formatting
  * Punctuation
  * Capitalization
  * Spacing
  * Special characters
  * Technical terms
  * Acronyms

Task Definition:
1. Parse the provided resume text VERBATIM
2. Extract information while maintaining 100% of original content
3. Format according to the specified JSON schema
4. Preserve every single detail from the original

Content Preservation Guidelines:
- Keep ALL bullet points and descriptions in their complete, original form
- Maintain exact dates, titles, and company names as written
- Preserve ALL technical terms and skills exactly as shown
- Keep ALL achievements and metrics in their original format
- Maintain ALL original formatting choices from the text

Step-by-Step Approach:
1. First, identify all sections while keeping original text intact
2. Then, map complete, unmodified content to the schema structure
3. Finally, verify that NO information has been lost or modified

Error Handling:
- If a field is missing, use null - NEVER create or modify content
- If content is ambiguous, preserve it exactly as is
- If content is lengthy, keep it complete - NEVER truncate
- If uncertain about categorization, preserve the full text in the most relevant field

Quality Verification:
- Double-check that ALL original text is preserved
- Verify that NO content has been reworded
- Ensure NO descriptions have been shortened
- Confirm ALL technical details are exactly as provided

Remember: Your absolute priority is to preserve 100% of the original content without any modifications. It's better to include too much information than to lose any details.`
};

export async function formatProfileWithAI(userMessages: Array<OpenAI.Chat.ChatCompletionMessageParam>) {
  console.log('🚀 Starting AI profile formatting...');
  
  // Combine system message with user messages
  const messages = [SYSTEM_MESSAGE, ...userMessages];
  console.log('📨 Input messages:', JSON.stringify(messages, null, 2));
  
  try {
    console.log('📤 Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // DO NOT MODIFY THIS MODEL
      messages,
      response_format: {
        "type": "json_schema",
        "json_schema": openAiResumeSchema
      },
      temperature: 0.7, // Lowered for more consistent formatting
      max_tokens: 8133, //DO NOT CHANGE
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('📥 Received response from OpenAI');
    console.log('🔍 Response status:', response.choices[0].finish_reason);
    console.log('📊 Usage stats:', JSON.stringify(response.usage, null, 2));

    if (!response.choices[0].message.content) {
      console.error('❌ No content received in OpenAI response');
      throw new Error('No content received from OpenAI');
    }

    console.log('✅ Successfully parsed profile data');
    // Log the first 200 characters of the response to avoid console clutter
    console.log('📝 Preview of formatted data:', 
      response.choices[0].message.content.substring(0, 200) + '...');

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error in formatProfileWithAI:', error);
    
    // Type guard for Error objects
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
    } else {
      console.error('Unknown error type:', error);
    }
    
    throw new Error('Failed to format profile information');
  }
}

