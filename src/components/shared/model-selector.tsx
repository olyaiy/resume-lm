'use client'

import React, { useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ServiceName } from "@/lib/types"
import { toast } from "sonner"
import { Crown, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

interface AIModel {
  id: string
  name: string
  provider: ServiceName
  unstable: boolean
}

const PROVIDERS: { 
  id: ServiceName; 
  name: string; 
  apiLink: string;
  unstable: boolean;
  logo?: string;
}[] = [
  { 
    id: 'anthropic', 
    name: 'Anthropic',
    apiLink: 'https://console.anthropic.com/',
    unstable: false,
    logo: '/logos/claude.png'
  },
  { 
    id: 'openai', 
    name: 'OpenAI',
    apiLink: 'https://platform.openai.com/api-keys',
    unstable: false,
    logo: '/logos/chat-gpt-logo.png'
  },
  {
    id: 'groq', 
    name: 'Llama', 
    apiLink: 'https://console.groq.com/keys',
    unstable: false,
    logo: '/logos/llama-logo.png'
  },
  {
    id: 'google',
    name: 'Google',
    apiLink: 'https://ai.google.dev/',
    unstable: false,
    logo: '/logos/gemini-logo.webp'
  },
  // Unstable providers
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    apiLink: 'https://platform.deepseek.com/api-keys',
    unstable: true,
    logo: '/logos/deepseek-logo-full.png'
  }
]

const AI_MODELS: AIModel[] = [
  // Stable models
  { id: 'gpt-4.1', name: 'GPT 4.1', provider: 'openai', unstable: false },
  { id: 'gpt-4.1-mini', name: 'GPT 4.1 Mini', provider: 'openai', unstable: false },
  { id: 'gpt-4.1-nano', name: 'GPT 4.1 Nano', provider: 'openai', unstable: false },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', unstable: false },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', unstable: false },
  { id: 'claude-4-sonnet-20250514', name: 'Claude 4 Sonnet', provider: 'anthropic', unstable: false },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', unstable: false },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', unstable: false },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', unstable: false },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'groq', unstable: false },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B ', provider: 'groq', unstable: false },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq', unstable: false },
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro preview 0506', provider: 'google', unstable: false },
  { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash Preview', provider: 'google', unstable: false },

  // Unstable models
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', unstable: true },
  { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite', provider: 'google', unstable: true },
  { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', provider: 'deepseek', unstable: true }
]

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  apiKeys: ApiKey[]
  isProPlan: boolean
  className?: string
  placeholder?: string
  showToast?: boolean
}

// Helper component for unavailable model popover
function UnavailableModelPopover({ children, model }: { children: React.ReactNode; model: AIModel }) {
  const [open, setOpen] = useState(false)
  const provider = PROVIDERS.find(p => p.id === model.provider)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="w-full"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 z-50" 
        side="right" 
        align="start"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">
              {model.name} is not available
            </h4>
            <p className="text-xs text-muted-foreground">
              To use this model, you need either a Pro subscription or a {provider?.name} API key.
            </p>
          </div>
          
          <div className="space-y-2">
            {/* Pro Option */}
            <div className="p-3 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-purple-100/30">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Recommended</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-2">
                Get unlimited access to all AI models without managing API keys
              </p>
              <Link href="/subscription">
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 h-7 text-xs">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            {/* API Key Option */}
            <div className="p-3 rounded-lg border border-gray-200/50 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-800">Alternative</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Add your own {provider?.name} API key to use this model
              </p>
              <div className="flex gap-2">
                <Link href="/settings" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                    Configure API Key
                  </Button>
                </Link>
                {provider?.apiLink && (
                  <Link href={provider.apiLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ModelSelector({ 
  value, 
  onValueChange, 
  apiKeys, 
  isProPlan, 
  className,
  placeholder = "Select an AI model",
  showToast = true
}: ModelSelectorProps) {
  
  const isModelSelectable = (modelId: string) => {
    if (isProPlan) return true // Bypass check for Pro users
    if (modelId === 'gpt-4.1-nano') return true // GPT 4.1 Nano is free for everyone
    const model = AI_MODELS.find(m => m.id === modelId)
    if (!model) return false
    return apiKeys.some(k => k.service === model.provider)
  }

  const handleModelChange = (modelId: string) => {
    const selectedModel = AI_MODELS.find(m => m.id === modelId)
    if (!selectedModel) return

    // Skip key check for Pro users and free models
    if (!isProPlan && modelId !== 'gpt-4.1-nano') {
      const hasRequiredKey = apiKeys.some(k => k.service === selectedModel.provider)
      if (!hasRequiredKey) {
        if (showToast) {
          toast.error(`Please add your ${selectedModel.provider === 'openai' ? 'OpenAI' : selectedModel.provider === 'anthropic' ? 'Anthropic' : selectedModel.provider} API key first`)
        }
        return
      }
    }

    onValueChange(modelId)
    if (showToast) {
      toast.success('Model updated successfully')
    }
  }

  // Helper function to group models by provider
  const getModelsByProvider = () => {
    const providerOrder = ['anthropic', 'openai', 'groq', 'google', 'deepseek']
    const grouped = new Map<ServiceName, AIModel[]>()
    
    // Group models by provider
    AI_MODELS.forEach(model => {
      if (!grouped.has(model.provider)) {
        grouped.set(model.provider, [])
      }
      grouped.get(model.provider)!.push(model)
    })
    
    // Return in ordered format
    return providerOrder.map(provider => ({
      provider: provider as ServiceName,
      name: PROVIDERS.find(p => p.id === provider)?.name || provider,
      models: grouped.get(provider as ServiceName) || []
    })).filter(group => group.models.length > 0)
  }

  return (
    <Select value={value} onValueChange={handleModelChange}>
      <SelectTrigger className={cn(
        "bg-white/50 border-purple-600/60 hover:border-purple-600/80 focus:border-purple-600/40 transition-colors",
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[300px] max-w-[400px]">
        {getModelsByProvider().map((group, groupIndex) => (
          <div key={group.provider}>
            <SelectGroup>
              <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                <div className="flex items-center gap-2">
                  {PROVIDERS.find(p => p.id === group.provider)?.logo && (
                    <Image
                      src={PROVIDERS.find(p => p.id === group.provider)!.logo!}
                      alt={`${group.name} logo`}
                      width={14}
                      height={14}
                      className="rounded-sm"
                    />
                  )}
                  {group.name}
                </div>
              </SelectLabel>
              {group.models.map((model) => {
                const provider = PROVIDERS.find(p => p.id === model.provider)
                const isSelectable = isModelSelectable(model.id)
                
                const selectItem = (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    disabled={!isSelectable}
                    className={cn(
                      "transition-colors",
                      !isSelectable ? 'opacity-50' : 'hover:bg-purple-50'
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {provider?.logo && (
                        <Image
                          src={provider.logo}
                          alt={`${provider.name} logo`}
                          width={16}
                          height={16}
                          className="rounded-sm flex-shrink-0"
                        />
                      )}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate font-medium">{model.name}</span>
                        {(model.id === 'claude-4-sonnet-20250514' || model.id === 'gpt-4o') && (
                          <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Recommended
                          </span>
                        )}
                        {model.id === 'gpt-4.1-nano' && (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Free
                          </span>
                        )}
                        {model.unstable && (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Unstable
                          </span>
                        )}
                      </div>
                      {!isSelectable && (
                        <span className="ml-1.5 text-muted-foreground flex-shrink-0">(No API Key set)</span>
                      )}
                    </div>
                  </SelectItem>
                )

                // Wrap unavailable models with popover
                if (!isSelectable) {
                  return (
                    <UnavailableModelPopover key={model.id} model={model}>
                      {selectItem}
                    </UnavailableModelPopover>
                  )
                }

                return selectItem
              })}
            </SelectGroup>
            {groupIndex < getModelsByProvider().length - 1 && (
              <SelectSeparator />
            )}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

// Export the types and constants for reuse
export type { AIModel, ApiKey }
export { AI_MODELS, PROVIDERS } 