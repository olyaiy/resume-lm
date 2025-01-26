'use server';

import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { initializeAIClient, type AIConfig } from '@/utils/ai-tools';

export async function generate(input: string, config?: AIConfig) {
  try {
    const stream = createStreamableValue('');
    const aiClient = initializeAIClient(config);

    const system = `You are a professional cover letter writer with expertise in crafting compelling, 
    personalized cover letters. Focus on:
    - Clear and concise writing
    - Professional tone
    - Highlighting relevant experience
    - Matching job requirements
    - Maintaining authenticity
    - aim for 500 words
    
    Ensure that your output is in an HTML format, but do NOT start with html tags.
    `;

    (async () => {
      const { textStream } = streamText({
        model: aiClient,
        system,
        prompt: input,
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }

      stream.done();
    })();

    return { output: stream.value };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}