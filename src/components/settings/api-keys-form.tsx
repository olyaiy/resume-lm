'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { ServiceName } from "@/lib/types"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

interface AIModel {
  id: string
  name: string
  provider: ServiceName
}

const LOCAL_STORAGE_KEY = 'resumelm-api-keys'
const MODEL_STORAGE_KEY = 'resumelm-default-model'
const DEFAULT_MODEL = 'claude-3-sonnet-20240229'

const PROVIDERS: { id: ServiceName; name: string }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google AI' },
  { id: 'vertex', name: 'Google Vertex' },
]

const AI_MODELS: AIModel[] = [
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-4-mini', name: 'GPT-4 Mini', provider: 'openai' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
  { id: 'vertex-gemini-2.0-flash-exp', name: 'Vertex Gemini 2.0 Flash Exp', provider: 'vertex' },
  { id: 'vertex-gemini-1.5-flash', name: 'Vertex Gemini 1.5 Flash', provider: 'vertex' },
  { id: 'vertex-gemini-1.5-pro', name: 'Vertex Gemini 1.5 Pro', provider: 'vertex' },
]

export function ApiKeysForm() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Record<ServiceName, boolean>>(() => {
    const initialState: Partial<Record<ServiceName, boolean>> = {}
    return initialState as Record<ServiceName, boolean>
  })
  const [newKeyValues, setNewKeyValues] = useState<Record<ServiceName, string>>(() => {
    const initialState: Partial<Record<ServiceName, string>> = {}
    return initialState as Record<ServiceName, string>
  })
  const [defaultModel, setDefaultModel] = useState<string>(DEFAULT_MODEL)

  // Load API keys from local storage on mount
  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY)
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY)
    
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys))
      } catch (error) {
        console.error('Error loading API keys:', error)
        toast.error('Failed to load API keys')
      }
    }

    if (storedModel) {
      setDefaultModel(storedModel)
    } else {
      setDefaultModel(DEFAULT_MODEL)
      localStorage.setItem(MODEL_STORAGE_KEY, DEFAULT_MODEL)
    }
  }, [])

  // Save API keys to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys))
  }, [apiKeys])

  // Save default model to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, defaultModel)
  }, [defaultModel])

  const handleUpdateKey = (service: ServiceName) => {
    const keyValue = newKeyValues[service]
    if (!keyValue?.trim()) {
      toast.error('Please enter an API key')
      return
    }

    const newKey: ApiKey = {
      service,
      key: keyValue.trim(),
      addedAt: new Date().toISOString(),
    }

    setApiKeys(prev => {
      const exists = prev.findIndex(k => k.service === service)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newKey
        return updated
      }
      return [...prev, newKey]
    })

    setNewKeyValues(prev => ({
      ...prev,
      [service]: ''
    }))
    toast.success('API key saved successfully')
  }

  const handleRemoveKey = (service: ServiceName) => {
    setApiKeys(prev => prev.filter(k => k.service !== service))
    setVisibleKeys(prev => {
      const updated = { ...prev }
      delete updated[service]
      return updated
    })
    toast.success('API key removed successfully')
  }

  const getExistingKey = (service: ServiceName) => 
    apiKeys.find(k => k.service === service)

  const handleModelChange = (modelId: string) => {
    setDefaultModel(modelId)
    toast.success('Default model updated successfully')
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">API Keys</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Your API keys are stored securely in your browser and only transmitted over HTTPS when making requests to AI models.
          These keys never touch our servers.
        </p>
      </div>
      <div className="p-3 rounded-lg bg-white/50 border border-gray-200">
        <Label className="text-sm font-medium">Default AI Model</Label>
        <Select value={defaultModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {PROVIDERS.map(provider => {
          const existingKey = getExistingKey(provider.id)
          const isVisible = visibleKeys[provider.id]
          const providerModels = AI_MODELS.filter(model => model.provider === provider.id)

          return (
            <div 
              key={provider.id}
              className="p-3 rounded-lg bg-white/50 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">{provider.name}</Label>
                {existingKey && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVisibleKeys(prev => ({
                        ...prev,
                        [provider.id]: !prev[provider.id]
                      }))}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      {isVisible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKey(provider.id)}
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {existingKey ? (
                <div className="text-xs space-y-0.5">
                  <div className="text-muted-foreground">
                    Added {new Date(existingKey.addedAt).toLocaleDateString()}
                  </div>
                  {isVisible && (
                    <div className="font-mono bg-muted/50 px-2 py-0.5 rounded text-sm">
                      {existingKey.key}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-1">
                  <Input
                    type={isVisible ? "text" : "password"}
                    placeholder="Enter API key"
                    value={newKeyValues[provider.id] || ''}
                    onChange={(e) => setNewKeyValues(prev => ({
                      ...prev,
                      [provider.id]: e.target.value
                    }))}
                    className="bg-white/50 flex-1 h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVisibleKeys(prev => ({
                      ...prev,
                      [provider.id]: !prev[provider.id]
                    }))}
                    className="bg-white/50 h-8 w-8"
                  >
                    {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 h-8 text-sm"
                    onClick={() => handleUpdateKey(provider.id)}
                  >
                    Save
                  </Button>
                </div>
              )}

              {providerModels.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1.5">
                  Models: {providerModels.map(m => m.name).join(', ')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 