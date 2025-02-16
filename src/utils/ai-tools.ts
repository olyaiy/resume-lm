import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
// import { createDeepSeek } from '@ai-sdk/deepseek';

export type ApiKey = {
  service: string;
  key: string;
  addedAt: string;
};

export type AIConfig = {
  model: string;
  apiKeys: Array<ApiKey>;
};

/**
 * Initializes an AI client based on the provided configuration
 * Falls back to default OpenAI configuration if no config is provided
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {


  // Handle Pro subscription with environment variables
  if (isPro && config) {

  
    const { model } = config;

    // if (useThinking) {
    //   return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })('o1-mini');
    // }
    
    if (model.startsWith('claude')) {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('Anthropic API key not found');
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(model);
    }

    void useThinking;
    // if (model.startsWith('deepseek')) {
    //   if (!process.env.DEEPSEEK_API_KEY) throw new Error('DeepSeek API key not found');
    //   return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })(model);
    // }

    // Default to OpenAI for Pro
    if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not found');
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })('gpt-4o-mini');
  }

  // Existing logic for free users
  if (!config) {
    return createOpenAI({ apiKey: '' })('no-model');
  }

  const { model, apiKeys } = config;
  
  if (model.startsWith('claude')) {
    const anthropicKey = apiKeys.find(k => k.service === 'anthropic')?.key;
    if (!anthropicKey) throw new Error('Anthropic API key not found');
    return createAnthropic({ apiKey: anthropicKey })(model);
  }

  // if (model.startsWith('deepseek')) {
  //   const deepseekKey = apiKeys.find(k => k.service === 'deepseek')?.key;
  //   if (!deepseekKey) throw new Error('DeepSeek API key not found');
  //   return createDeepSeek({ apiKey: deepseekKey })(model);
  // }
  
  const openaiKey = apiKeys.find(k => k.service === 'openai')?.key;
  if (!openaiKey) throw new Error('OpenAI API key not found');
  return createOpenAI({ apiKey: openaiKey })(model);
}
