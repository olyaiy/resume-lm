'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

// Message Type Interface
export interface Message {
    role: 'user' | 'assistant';
    content: string;
  }

// Simple Function to generate Response 
export async function generate(input: string) {
  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-4o-mini'),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}


export async function continueConversation(history: Message[]) {
    'use server';
  
    const stream = createStreamableValue();
  
    (async () => {
      const { textStream } = streamText({
        model: openai('gpt-3.5-turbo'),
        system:
          "You are a dude that doesn't drop character until the DVD commentary.",
        messages: history,
      });
  
      for await (const text of textStream) {
        stream.update(text);
      }
  
      stream.done();
    })();
  
    return {
      messages: history,
      newMessage: stream.value,
    };
  }
  