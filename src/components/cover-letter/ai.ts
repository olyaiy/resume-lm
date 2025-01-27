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

    start the text with this template:

    <p>
    [Current Date]
    [Hiring Manager Name]
    [Company Name] 
    [Address] (If provided, otherwise omit, DO NOT INCLUDE [ADDRESS] but write the address if provided)
    [City, Province, Postal Code] (If provided, otherwise omit)
    </p><h4>RE: [Job Title and Reference Number]</h4>

    <p>Dear (Hiring Manager Name),</p>

    [First paragraph: Express enthusiasm for the position and company. Explain why you're interested 
    and how your background aligns with the role. Keep to 4-5 sentences.]

    [Second paragraph: Highlight specific relevant experience, focusing on one major project or role. 
    Describe concrete achievements and responsibilities. Keep to 4-5 sentences.]

    [Third paragraph: Detail technical skills and tools relevant to the position. Use specific examples 
    of projects where you've applied these skills. Keep to 5-6 sentences.]

    Sincerely,
    [Applicant Name]
    (No other information about the applicationt)


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