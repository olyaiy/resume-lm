import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';

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
export function initializeAIClient(config?: AIConfig) {
  // If no config provided, use default OpenAI with environment variable
  if (!config) {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })('gpt-4-turbo-preview');
  }

  const { model, apiKeys } = config;
  
  // Determine which service to use based on model name
  if (model.startsWith('claude')) {
    const anthropicKey = apiKeys.find(k => k.service === 'anthropic')?.key || process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error('Anthropic API key not found');
    return createAnthropic({ apiKey: anthropicKey })(model);
  } 

  // Check for DeepSeek models
  if (model.startsWith('deepseek')) {
    const deepseekKey = apiKeys.find(k => k.service === 'deepseek')?.key || process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) throw new Error('DeepSeek API key not found');
    return createDeepSeek({ apiKey: deepseekKey })(model);
  }
  
  // Default to OpenAI
  const openaiKey = apiKeys.find(k => k.service === 'openai')?.key || process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error('OpenAI API key not found');
  return createOpenAI({ apiKey: openaiKey })(model);
}
