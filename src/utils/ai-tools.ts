import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { LanguageModelV1 } from 'ai';
import { 
  getModelById, 
  getProviderById,
  type AIModel,
  type AIConfig
} from '@/lib/ai-models';

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

// Hidden/internal-only models that should not appear in the public selector
type HiddenModel = Pick<AIModel, 'id' | 'provider' | 'features' | 'availability'>;
const HIDDEN_MODELS: Record<string, HiddenModel> = {
  'openai/gpt-5-nano': {
    id: 'openai/gpt-5-nano',
    provider: 'openrouter',
    features: {
      isFree: true,
      isUnstable: false,
      maxTokens: 400000,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
};

/**
 * Initializes an AI client based on the provided configuration
 * Falls back to default OpenAI configuration if no config is provided
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  void useThinking; // Keep for future use

  // Pro: server env keys first, then keys from Settings (client sends config.apiKeys for /api/chat, etc.)
  if (isPro && config) {
    const { model, apiKeys = [] } = config;
    const modelData = getModelById(model) ?? HIDDEN_MODELS[model];
    const resolvedModelId = modelData?.id ?? model;
    const provider = modelData ? getProviderById(modelData.provider) : undefined;

    if (!modelData || !provider) {
      throw new Error(`Unknown model: ${model}`);
    }

    const userOpenRouter = apiKeys.find((k) => k.service === 'openrouter')?.key;
    const userOpenAI = apiKeys.find((k) => k.service === 'openai')?.key;
    const userAnthropic = apiKeys.find((k) => k.service === 'anthropic')?.key;
    const userGoogle = apiKeys.find((k) => k.service === 'google')?.key;

    const openRouterKey = process.env.OPENROUTER_API_KEY || userOpenRouter;
    const openaiKey = process.env.OPENAI_API_KEY || userOpenAI;
    const anthropicKey = process.env.ANTHROPIC_API_KEY || userAnthropic;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || userGoogle;

    const missingKeyMsg = (name: string, envVar: string) =>
      `${name} API key not found. Add ${envVar} to .env.local and restart the dev server, or add your key in Settings → API keys.`;

    switch (provider.id) {
      case 'anthropic': {
        if (!anthropicKey) {
          throw new Error(missingKeyMsg('Anthropic', 'ANTHROPIC_API_KEY'));
        }
        return createAnthropic({ apiKey: anthropicKey })(resolvedModelId) as LanguageModelV1;
      }

      case 'openai':
        if (resolvedModelId.includes('/')) {
          if (!openRouterKey) {
            throw new Error(missingKeyMsg('OpenRouter', 'OPENROUTER_API_KEY'));
          }
          return createOpenRouter({
            apiKey: openRouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              'X-Title': 'ResumeLM',
            },
          })(resolvedModelId) as LanguageModelV1;
        }
        if (!openaiKey && openRouterKey) {
          return createOpenRouter({
            apiKey: openRouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              'X-Title': 'ResumeLM',
            },
          })(`openai/${resolvedModelId}`) as LanguageModelV1;
        }
        if (!openaiKey) {
          throw new Error(missingKeyMsg('OpenAI', 'OPENAI_API_KEY'));
        }
        return createOpenAI({
          apiKey: openaiKey,
          compatibility: 'strict',
        })(resolvedModelId) as LanguageModelV1;

      case 'openrouter': {
        if (!openRouterKey) {
          throw new Error(missingKeyMsg('OpenRouter', 'OPENROUTER_API_KEY'));
        }
        return createOpenRouter({
          apiKey: openRouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeLM',
          },
        })(resolvedModelId) as LanguageModelV1;
      }

      case 'google': {
        if (!googleKey) {
          throw new Error(missingKeyMsg('Google Generative AI', 'GOOGLE_GENERATIVE_AI_API_KEY'));
        }
        return createGoogleGenerativeAI({ apiKey: googleKey })(resolvedModelId) as LanguageModelV1;
      }

      default:
        throw new Error(`Unsupported provider: ${provider.id}`);
    }
  }

  // Existing logic for free users
  if (!config) {
    return createOpenAI({ apiKey: '' })('no-model') as LanguageModelV1;
  }

  const { model, apiKeys } = config;
  const modelData = getModelById(model) ?? HIDDEN_MODELS[model];
  const resolvedModelId = modelData?.id ?? model;
  const provider = modelData ? getProviderById(modelData.provider) : undefined;
  
  if (!modelData || !provider) {
    throw new Error(`Unknown model: ${model}`);
  }
  
  // Special case: free-tier models (e.g., GPT-5 Mini) skip user key requirement
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

    case 'google':
      return createGoogleGenerativeAI({ apiKey: userApiKey })(resolvedModelId) as LanguageModelV1;
    
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }
}
