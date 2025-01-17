'use client'

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { toast } from "sonner"
import { ServiceName } from "@/lib/types"
import { Sparkles } from "lucide-react"

const MODEL_STORAGE_KEY = 'resumelm-default-model'
const LOCAL_STORAGE_KEY = 'resumelm-api-keys'

interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

interface AIModel {
  id: string
  name: string
  provider: ServiceName
  shortName: string
}

const AI_MODELS: AIModel[] = [
  { 
    id: 'claude-3-sonnet-20240229', 
    name: 'Claude 3.5 Sonnet (Recommended)', 
    shortName: 'Sonnet 3.5',
    provider: 'anthropic' 
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    shortName: 'GPT 4o',
    provider: 'openai' 
  },
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    shortName: 'GPT 4o mini',
    provider: 'openai' 
  },
  { 
    id: 'deepseek-chat', 
    name: 'DeepSeek Chat', 
    shortName: 'DeepSeek V3',
    provider: 'deepseek' 
  },
]

export function ModelSelector() {
  const [defaultModel, setDefaultModel] = useState<string>('')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])

  // Load stored data on mount
  useEffect(() => {
    // Load API keys
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedKeys) {
      try {
        const keys: ApiKey[] = JSON.parse(storedKeys)
        setApiKeys(keys)

        // Load default model
        const storedModel = localStorage.getItem(MODEL_STORAGE_KEY)
        
        // Check if stored model is still valid with current API keys
        if (storedModel) {
          const model = AI_MODELS.find(m => m.id === storedModel)
          if (model && keys.some((k: ApiKey) => k.service === model.provider)) {
            setDefaultModel(storedModel)
          } else {
            // Find first available model
            const firstAvailableModel = AI_MODELS.find(m => 
              keys.some((k: ApiKey) => k.service === m.provider)
            )
            if (firstAvailableModel) {
              setDefaultModel(firstAvailableModel.id)
              localStorage.setItem(MODEL_STORAGE_KEY, firstAvailableModel.id)
              toast.info(`Switched to ${firstAvailableModel.shortName} as previous model was unavailable`)
            } else {
              setDefaultModel('')
              localStorage.removeItem(MODEL_STORAGE_KEY)
            }
          }
        }
      } catch (error) {
        console.error('Error loading API keys:', error)
      }
    }
  }, [])

  // Watch for API key changes
  useEffect(() => {
    const currentModel = AI_MODELS.find(m => m.id === defaultModel)
    if (currentModel && !apiKeys.some(k => k.service === currentModel.provider)) {
      // Current model's API key was removed, switch to first available model
      const firstAvailableModel = AI_MODELS.find(m => 
        apiKeys.some(k => k.service === m.provider)
      )
      if (firstAvailableModel) {
        setDefaultModel(firstAvailableModel.id)
        localStorage.setItem(MODEL_STORAGE_KEY, firstAvailableModel.id)
        toast.info(`Switched to ${firstAvailableModel.shortName} as previous model was unavailable`)
      } else {
        setDefaultModel('')
        localStorage.removeItem(MODEL_STORAGE_KEY)
        toast.info('No AI models available. Please add an API key in settings.')
      }
    }
  }, [apiKeys, defaultModel])

  const handleModelChange = (modelId: string) => {
    const selectedModel = AI_MODELS.find(m => m.id === modelId)
    if (!selectedModel) return

    const hasRequiredKey = apiKeys.some(k => k.service === selectedModel.provider)
    if (!hasRequiredKey) {
      toast.error(`Please add your ${selectedModel.provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key first`)
      return
    }

    setDefaultModel(modelId)
    localStorage.setItem(MODEL_STORAGE_KEY, modelId)
    toast.success(`Switched to ${selectedModel.shortName}`)
  }

  const isModelSelectable = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId)
    if (!model) return false
    return apiKeys.some(k => k.service === model.provider)
  }

  const selectedModel = AI_MODELS.find(m => m.id === defaultModel)

  return (
    <div className="relative">
      <Select value={defaultModel} onValueChange={handleModelChange}>
        <SelectTrigger 
          className="h-7 px-2 text-xs border-none bg-transparent hover:bg-purple-500/5 transition-colors"
        >
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-500" />
            <span className="text-purple-600">
              {selectedModel?.shortName || "No Model Available"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          {AI_MODELS.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              disabled={!isModelSelectable(model.id)}
              className="text-xs"
            >
              {model.name}
              {!isModelSelectable(model.id) && (
                <span className="ml-1 text-muted-foreground">(No API Key)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 