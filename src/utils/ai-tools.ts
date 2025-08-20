import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { LanguageModelV1 } from 'ai';
import { 
  getModelById, 
  getModelProvider,
  type AIConfig
} from '@/lib/ai-models';

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

/**
 * Initializes an AI client based on the provided configuration
 * Falls back to default OpenAI configuration if no config is provided
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  void useThinking; // Keep for future use

  // Handle Pro subscription with environment variables
  if (isPro && config) {
    const { model } = config;
    const modelData = getModelById(model);
    const provider = modelData ? getModelProvider(model) : undefined;
    
    if (!modelData || !provider) {
      throw new Error(`Unknown model: ${model}`);
    }

    // Get the environment key and check if it exists
    const envKey = process.env[provider.envKey];
    if (!envKey) {
      throw new Error(`${provider.name} API key not found (${provider.envKey})`);
    }

    // Create the appropriate SDK client based on provider
    switch (provider.id) {
      case 'anthropic':
        return createAnthropic({ apiKey: envKey })(model) as LanguageModelV1;
      
      case 'openai':
        return createOpenAI({ 
          apiKey: envKey,
          compatibility: 'strict'
        })(model) as LanguageModelV1;
      
      default:
        throw new Error(`Unsupported provider: ${provider.id}`);
    }
  }

  // Existing logic for free users
  if (!config) {
    return createOpenAI({ apiKey: '' })('no-model') as LanguageModelV1;
  }

  const { model, apiKeys } = config;
  const modelData = getModelById(model);
  const provider = modelData ? getModelProvider(model) : undefined;
  
  if (!modelData || !provider) {
    throw new Error(`Unknown model: ${model}`);
  }
  
  // Special case: GPT 4.1 Nano is free for all users
  if (modelData.features.isFree) {
    const envKey = process.env[provider.envKey];
    if (!envKey) throw new Error(`${provider.name} API key not found`);
    
    if (provider.id === 'openai') {
      return createOpenAI({ 
        apiKey: envKey,
        compatibility: 'strict',
      })(model) as LanguageModelV1;
    }
  }
  
  // For non-free models, user must provide their own API key
  const userApiKey = apiKeys.find(k => k.service === provider.id)?.key;
  if (!userApiKey) {
    throw new Error(`${provider.name} API key not found in user configuration`);
  }

  // Create the appropriate SDK client based on provider
  switch (provider.id) {
    case 'anthropic':
      return createAnthropic({ apiKey: userApiKey })(model) as LanguageModelV1;
    
    case 'openai':
      return createOpenAI({ 
        apiKey: userApiKey,
        compatibility: 'strict'
      })(model) as LanguageModelV1;
    
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }
}
