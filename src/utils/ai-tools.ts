import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
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
    const resolvedModelId = modelData?.id ?? model;
    const provider = modelData ? getModelProvider(resolvedModelId) : undefined;
    
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
        return createAnthropic({ apiKey: envKey })(resolvedModelId) as LanguageModelV1;
      
      case 'openai':
        // Check if this is actually an OpenRouter model (contains forward slash)
        if (resolvedModelId.includes('/')) {
          // Use OpenRouter for models with provider prefix
          const openRouterKey = process.env.OPENROUTER_API_KEY;
          if (!openRouterKey) {
            throw new Error('OpenRouter API key not found (OPENROUTER_API_KEY)');
          }
          return createOpenRouter({
            apiKey: openRouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              'X-Title': 'ResumeLM'
            },
            
          })(resolvedModelId) as LanguageModelV1;
        }
        // Regular OpenAI models
        return createOpenAI({ 
          apiKey: envKey,
          compatibility: 'strict'
        })(resolvedModelId) as LanguageModelV1;
      
      case 'openrouter':
        return createOpenRouter({
          apiKey: envKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeLM'
          }
        })(resolvedModelId) as LanguageModelV1;
      
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
  const resolvedModelId = modelData?.id ?? model;
  const provider = modelData ? getModelProvider(resolvedModelId) : undefined;
  
  if (!modelData || !provider) {
    throw new Error(`Unknown model: ${model}`);
  }
  
  // Special case: GPT 4.1 Nano is free for all users
  // Also allow GPT OSS models to use server-side OpenRouter key
  if (modelData.features.isFree || resolvedModelId.includes('/')) {
    // For OpenRouter models (with slash), use OpenRouter key
    if (resolvedModelId.includes('/')) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OpenRouter API key not found');
      
      return createOpenRouter({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'ResumeLM'
        }
      })(resolvedModelId) as LanguageModelV1;
    }
    
    // For regular free models like GPT 4.1 Nano
    const envKey = process.env[provider.envKey];
    if (!envKey) throw new Error(`${provider.name} API key not found`);
    
    if (provider.id === 'openai') {
      return createOpenAI({ 
        apiKey: envKey,
        compatibility: 'strict',
      })(resolvedModelId) as LanguageModelV1;
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
      return createAnthropic({ apiKey: userApiKey })(resolvedModelId) as LanguageModelV1;
    
    case 'openai':
      // Check if this is actually an OpenRouter model (contains forward slash)
      if (resolvedModelId.includes('/')) {
        // Use OpenRouter for models with provider prefix
        const openRouterKey = apiKeys.find(k => k.service === 'openrouter')?.key;
        if (!openRouterKey) {
          throw new Error('OpenRouter API key not found in user configuration');
        }
        return createOpenRouter({
          apiKey: openRouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeLM'
          }
        })(resolvedModelId) as LanguageModelV1;
      }
      // Regular OpenAI models
      return createOpenAI({ 
        apiKey: userApiKey,
        compatibility: 'strict'
      })(resolvedModelId) as LanguageModelV1;
    
    case 'openrouter':
      return createOpenRouter({
        apiKey: userApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'ResumeLM'
        }
      })(resolvedModelId) as LanguageModelV1;
    
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }
}
