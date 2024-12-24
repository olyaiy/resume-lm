'use server';
import OpenAI from "openai";
import { openAiResumeSchema } from "@/lib/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function formatProfileWithAI(messages: Array<OpenAI.Chat.ChatCompletionMessageParam>) {
  console.log('🚀 Starting AI profile formatting...');
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

