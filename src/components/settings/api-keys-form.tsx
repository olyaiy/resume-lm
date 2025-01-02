'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { ServiceName } from "@/lib/types"
import { toast } from "sonner"

interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

const LOCAL_STORAGE_KEY = 'resumelm-api-keys'

const PROVIDERS: { id: ServiceName; name: string }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google AI' },
  { id: 'mistral', name: 'Mistral AI' },
  { id: 'azure', name: 'Azure OpenAI' },
  { id: 'bedrock', name: 'Amazon Bedrock' },
  { id: 'vertex', name: 'Google Vertex' },
  { id: 'xai', name: 'xAI Grok' },
  { id: 'together', name: 'Together.ai' },
  { id: 'cohere', name: 'Cohere' },
  { id: 'fireworks', name: 'Fireworks' },
  { id: 'deepinfra', name: 'DeepInfra' },
  { id: 'groq', name: 'Groq' },
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

  // Load API keys from local storage on mount
  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys))
      } catch (error) {
        console.error('Error loading API keys:', error)
        toast.error('Failed to load API keys')
      }
    }
  }, [])

  // Save API keys to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys))
  }, [apiKeys])

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {PROVIDERS.map(provider => {
          const existingKey = getExistingKey(provider.id)
          const isVisible = visibleKeys[provider.id]

          return (
            <div 
              key={provider.id}
              className="p-4 rounded-lg bg-white/50 border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-base">{provider.name}</Label>
                {existingKey && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVisibleKeys(prev => ({
                        ...prev,
                        [provider.id]: !prev[provider.id]
                      }))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKey(provider.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {existingKey ? (
                <div className="text-sm space-y-1">
                  <div className="text-muted-foreground">
                    Added {new Date(existingKey.addedAt).toLocaleDateString()}
                  </div>
                  {isVisible && (
                    <div className="font-mono bg-muted/50 px-2 py-1 rounded">
                      {existingKey.key}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type={isVisible ? "text" : "password"}
                    placeholder="Enter API key"
                    value={newKeyValues[provider.id] || ''}
                    onChange={(e) => setNewKeyValues(prev => ({
                      ...prev,
                      [provider.id]: e.target.value
                    }))}
                    className="bg-white/50 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVisibleKeys(prev => ({
                      ...prev,
                      [provider.id]: !prev[provider.id]
                    }))}
                    className="bg-white/50"
                  >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
                    onClick={() => handleUpdateKey(provider.id)}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 