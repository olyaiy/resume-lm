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
    logo: '/logos/openrouter.png',
    envKey: 'OPENROUTER_API_KEY',
    sdkInitializer: 'openrouter',
    unstable: false
    
  },
}

// ========================
// Model Definitions
// ========================

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 400000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4.1',
    name: 'GPT 4.1',
    provider: 'openai',
    features: {
      isUnstable: false,
      maxTokens: 128000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT 4.1 Nano',
    provider: 'openai',
    features: {
      isFree: true,
      isUnstable: false,
      maxTokens: 128000,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 128000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'openai/gpt-oss-120b:nitro',
    name: 'GPT OSS 120B',
    provider: 'openai', // Show under OpenAI section
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 128000,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true, // Requires OpenRouter API key
      requiresPro: false
    },
  },
  {
    id: 'openai/gpt-oss-20b:nitro',
    name: 'GPT OSS 20B',
    provider: 'openai', // Show under OpenAI section
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 128000,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true, // Requires OpenRouter API key
      requiresPro: false
    },
  },

  // Anthropic Models
  {
    id: 'claude-4-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    features: {
      isRecommended: true,
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
    id: 'claude-4-sonnet-20250514',
    name: 'Claude 4 Sonnet (Legacy)',
    provider: 'anthropic',
    features: {
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



]

// ========================
// Default Model Configuration
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: 'claude-4-sonnet',
  FREE_USER: 'gpt-4.1-nano'
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
  FAST_CHEAP: 'openai/gpt-oss-20b:nitro',
  
  // Alternative fast & cheap option (free for all users)
  FAST_CHEAP_FREE: 'gpt-4.1-nano',
  
  // Frontier model for complex tasks, deep analysis, best quality
  FRONTIER: 'claude-4-sonnet',
  
  // Alternative frontier model
  FRONTIER_ALT: 'gpt-5',
  
  // Balanced model - good quality but faster/cheaper than frontier
  BALANCED: 'openai/gpt-oss-120b:nitro',
  
  // Vision-capable model for image analysis
  VISION: 'gpt-4o',
  
  // Default models by user type
  DEFAULT_PRO: 'claude-4-sonnet',
  DEFAULT_FREE: 'gpt-4.1-nano'
} as const

// Type for model designations
export type ModelDesignation = keyof typeof MODEL_DESIGNATIONS

// ========================
// Utility Functions
// ========================

/**
 * Get all providers as an array
 */
export function getProvidersArray(): AIProvider[] {
  return Object.values(PROVIDERS)
}

/**
 * Get a model by its ID
 */
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id)
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
  // Pro users have access to all models
  if (isPro) return true

  const model = getModelById(modelId)
  if (!model) return false

  // Free model (gpt-4.1-nano)
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
  const providerOrder: ServiceName[] = ['anthropic', 'openai']
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
  const model = getModelById(modelId)
  if (!model) return undefined
  
  const provider = getProviderById(model.provider)
  if (!provider) return undefined
  
  return { provider, modelId }
}