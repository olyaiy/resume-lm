/**
 * Centralized AI Model Management
 * This file contains all AI model and provider configurations used throughout the application
 */

import { ServiceName } from './types'

// ========================
// Type Definitions
// ========================

export interface AIProvider {
  id: ServiceName
  name: string
  apiLink: string
  logo?: string
  envKey: string
  sdkInitializer: string
  unstable?: boolean
}

export interface AIModel {
  id: string
  name: string
  provider: ServiceName
  features: {
    isFree?: boolean
    isRecommended?: boolean
    isUnstable?: boolean
    maxTokens?: number
    supportsVision?: boolean
    supportsTools?: boolean
    isPro?: boolean
  }
  availability: {
    requiresApiKey: boolean
    requiresPro: boolean
  }
}

export interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

export interface AIConfig {
  model: string
  apiKeys: ApiKey[]
  customPrompts?: import('./types').CustomPrompts
}

export interface GroupedModels {
  provider: ServiceName
  name: string
  models: AIModel[]
}

// ========================
// Provider Configurations
// ========================

export const PROVIDERS: Partial<Record<ServiceName, AIProvider>> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    apiLink: 'https://console.anthropic.com/',
    logo: '/logos/claude.png',
    envKey: 'ANTHROPIC_API_KEY',
    sdkInitializer: 'anthropic',
    unstable: false
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiLink: 'https://platform.openai.com/api-keys',
    logo: '/logos/chat-gpt-logo.png',
    envKey: 'OPENAI_API_KEY',
    sdkInitializer: 'openai',
    unstable: false
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    apiLink: 'https://openrouter.ai/account/api-keys',
    logo: '/logos/gemini-logo.webp',
    envKey: 'OPENROUTER_API_KEY',
    sdkInitializer: 'openrouter',
    unstable: false
    
  },
}

// ========================
// Model Definitions
// ========================

export const AI_MODELS: AIModel[] = [
  // OpenAI models served through OpenRouter. Keeping app-funded models on one
  // provider gives us a single billing surface and avoids direct OpenAI key
  // exhaustion taking down the product.
  {
    id: 'openai/gpt-5.5',
    name: 'GPT-5.5',
    provider: 'openrouter',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1050000,
      supportsVision: true,
      supportsTools: true,
      isPro: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: true
    }
  },
  {
    id: 'openai/gpt-5.5-pro',
    name: 'GPT-5.5 Pro',
    provider: 'openrouter',
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1050000,
      supportsVision: true,
      supportsTools: true,
      isPro: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: true
    }
  },
  {
    id: 'openai/gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'openrouter',
    features: {
      // "Free" means app-funded for ResumeLM users, not zero provider cost.
      isFree: true,
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1050000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false
    }
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'openrouter',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1000000,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'openrouter',
    features: {
      isRecommended: false,
      isUnstable: false,
      isFree: true,
      maxTokens: 131072,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'openrouter',
    features: {
      isRecommended: false,
      isUnstable: false,
      isFree: true,
      maxTokens: 131072,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'z-ai/glm-4.6:exacto',
    name: 'GLM-4.6 Exacto',
    provider: 'openrouter',
    features: {
      isRecommended: false,
      isUnstable: false,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'deepseek/deepseek-v3.2:nitro',
    name: 'DeepSeek V3.2',
    provider: 'openrouter',
    features: {
      isFree: true,
      isRecommended: true,
      isUnstable: false,
      maxTokens: 163840,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false
    }
  },

  // Anthropic Models
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1000000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1000000,
      supportsVision: true,
      supportsTools: true,
      isPro: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: true
    }
  },

]

// ========================
// Legacy ID Aliases
// ========================

// Map legacy or shorthand model IDs to current canonical IDs
const MODEL_ALIASES: Record<string, string> = {
  // Older Claude IDs → current best equivalents
  'claude-4-sonnet': 'claude-sonnet-4-6',
  'claude-3-sonnet-20240229': 'claude-sonnet-4-6',
  'claude-sonnet-4-20250514': 'claude-sonnet-4-6',
  'claude-sonnet-4.5': 'claude-sonnet-4-6',
  'claude-sonnet-4-5-20250929': 'claude-sonnet-4-6',
  'claude-opus-4.5': 'claude-opus-4-7',
  'claude-opus-4-5-20251101': 'claude-opus-4-7',
  // Direct OpenAI and older GPT IDs → OpenRouter-managed equivalents.
  // This also migrates existing localStorage selections away from the
  // exhausted direct OpenAI server key.
  'gpt-5': 'openai/gpt-5.5',
  'gpt-5.2': 'openai/gpt-5.5',
  'gpt-5.2-2025-12-11': 'openai/gpt-5.5',
  'gpt-5.2-pro': 'openai/gpt-5.5-pro',
  'gpt-5.2-pro-2025-12-11': 'openai/gpt-5.5-pro',
  'gpt-5.4': 'openai/gpt-5.5',
  'gpt-5.4-pro': 'openai/gpt-5.5-pro',
  'gpt-5.5': 'openai/gpt-5.5',
  'gpt-5.5-pro': 'openai/gpt-5.5-pro',
  'gpt-5.1-chat': 'openai/gpt-5.6-luna',
  'gpt-5.4-mini': 'openai/gpt-5.6-luna',
  'gpt-5.4-nano': 'openai/gpt-5.6-luna',
  'gpt-5-mini-2025-08-07': 'openai/gpt-5.6-luna',
  'gpt-5-mini': 'openai/gpt-5.6-luna',
  'gpt-5-nano': 'openai/gpt-5.6-luna',
  // Allow DeepSeek without the nitro suffix
  'deepseek/deepseek-v3.2': 'deepseek/deepseek-v3.2:nitro',
  // Legacy Gemini 3 model ID without provider prefix
  'gemini-3-pro-preview': 'google/gemini-3-pro-preview',
}

// ========================
// Default Model Configuration
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: 'openai/gpt-5.5',
  FREE_USER: 'openai/gpt-5.6-luna'
} as const

// ========================
// Model Designations for Different Use Cases
// ========================

/**
 * Designated models for specific use cases throughout the application.
 * Change these to update which models are used globally.
 */
export const MODEL_DESIGNATIONS = {
  // Fast & cheap model for parsing, simple tasks, quick analysis
  FAST_CHEAP: 'openai/gpt-5.6-luna',
  // Alternative fast & cheap option (free for all users)
  FAST_CHEAP_FREE: 'openai/gpt-5.6-luna',
  // Structured extraction, parsing, and data normalization
  STRUCTURED_EXTRACTION: 'openai/gpt-5.6-luna',
  // Resume scoring and analysis
  RESUME_SCORING: 'openai/gpt-5.6-luna',
  // Single-item rewrites and lightweight editing
  SIMPLE_REWRITE: 'openai/gpt-5.6-luna',
  // Multi-bullet and polished content generation
  CONTENT_GENERATION: 'openai/gpt-5.6-luna',
  // Cover letter generation
  COVER_LETTER: 'openai/gpt-5.6-luna',
  // Full resume tailoring by plan
  JOB_TAILORING_FREE: 'openai/gpt-5.6-luna',
  JOB_TAILORING_PRO: 'openai/gpt-5.5',
  // Interactive assistant by plan
  CHAT_ASSISTANT_FREE: 'openai/gpt-5.6-luna',
  CHAT_ASSISTANT_PRO: 'openai/gpt-5.5',
  // Frontier model for complex tasks, deep analysis, best quality
  FRONTIER: 'openai/gpt-5.5',
  // Alternative frontier model
  FRONTIER_ALT: 'claude-opus-4-7',
  // Balanced model - good quality but faster/cheaper than frontier
  BALANCED: 'openai/gpt-5.6-luna',
  // Vision-capable model for image analysis
  VISION: 'openai/gpt-5.6-luna',
  // Default models by user type
  DEFAULT_PRO: 'openai/gpt-5.5',
  DEFAULT_FREE: 'openai/gpt-5.6-luna'
} as const

// Type for model designations
export type ModelDesignation = keyof typeof MODEL_DESIGNATIONS

export function getCanonicalModelId(modelId: string): string {
  return MODEL_ALIASES[modelId] || modelId
}

// ========================
// Utility Functions
// ========================

/**
 * Get all providers as an array
 */
export function getProvidersArray(): AIProvider[] {
  const selectableProviders = new Set(AI_MODELS.map(model => model.provider))
  return Object.values(PROVIDERS).filter(provider => selectableProviders.has(provider.id))
}

/**
 * Get a model by its ID
 */
export function getModelById(id: string): AIModel | undefined {
  const resolvedId = getCanonicalModelId(id)
  return AI_MODELS.find(model => model.id === resolvedId)
}

/**
 * Get a provider by its ID
 */
export function getProviderById(id: ServiceName): AIProvider | undefined {
  return PROVIDERS[id]
}

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: ServiceName): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

/**
 * Check if a model is available for a user
 */
export function isModelAvailable(
  modelId: string,
  isPro: boolean,
  apiKeys: ApiKey[]
): boolean {
  modelId = getCanonicalModelId(modelId)
  // Pro users have access to all models
  if (isPro) return true

  const model = getModelById(modelId)
  if (!model) return false

  // Free model allowance
  if (model.features.isFree) return true

  // Check if this is an OpenRouter model (contains forward slash)
  if (modelId.includes('/')) {
    return apiKeys.some(key => key.service === 'openrouter')
  }

  // Check if user has the required API key
  return apiKeys.some(key => key.service === model.provider)
}

/**
 * Get the default model for a user type
 */
export function getDefaultModel(isPro: boolean): string {
  return isPro ? DEFAULT_MODELS.PRO_USER : DEFAULT_MODELS.FREE_USER
}

/**
 * Get the provider for a model
 */
export function getModelProvider(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  return getProviderById(model.provider)
}

/**
 * Group models by provider for display
 */
export function groupModelsByProvider(): GroupedModels[] {
  const providerOrder: ServiceName[] = ['anthropic', 'openai', 'openrouter']
  const grouped = new Map<ServiceName, AIModel[]>()

  // Group models by provider
  AI_MODELS.forEach(model => {
    if (!grouped.has(model.provider)) {
      grouped.set(model.provider, [])
    }
    grouped.get(model.provider)!.push(model)
  })

  // Return in ordered format
  return providerOrder
    .map(providerId => {
      const provider = getProviderById(providerId)
      if (!provider) return null
      
      return {
        provider: providerId,
        name: provider.name,
        models: grouped.get(providerId) || []
      }
    })
    .filter((group): group is GroupedModels => group !== null && group.models.length > 0)
}

/**
 * Get selectable models for a user
 */
export function getSelectableModels(isPro: boolean, apiKeys: ApiKey[]): AIModel[] {
  return AI_MODELS.filter(model => isModelAvailable(model.id, isPro, apiKeys))
}

/**
 * Determine which SDK to use for a model
 */
export function getModelSDKConfig(modelId: string): { provider: AIProvider; modelId: string } | undefined {
  const canonicalModelId = getCanonicalModelId(modelId)
  const model = getModelById(canonicalModelId)
  if (!model) return undefined
  
  const provider = getProviderById(model.provider)
  if (!provider) return undefined
  
  return { provider, modelId: canonicalModelId }
}
