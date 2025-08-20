'use client'

import React, { useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  getModelById,
  getProviderById,
  isModelAvailable,
  groupModelsByProvider,
  type AIModel,
  type ApiKey
} from '@/lib/ai-models'

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
  const provider = getProviderById(model.provider)
  
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
    return isModelAvailable(modelId, isProPlan, apiKeys)
  }

  const handleModelChange = (modelId: string) => {
    const selectedModel = getModelById(modelId)
    if (!selectedModel) return

    // Check if model is available for the user
    if (!isModelAvailable(modelId, isProPlan, apiKeys)) {
      if (showToast) {
        const provider = getProviderById(selectedModel.provider)
        toast.error(`Please add your ${provider?.name || selectedModel.provider} API key first`)
      }
      return
    }

    onValueChange(modelId)
    if (showToast) {
      toast.success('Model updated successfully')
    }
  }

  // Use the centralized grouping function
  const getModelsByProvider = () => groupModelsByProvider()

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
                  {getProviderById(group.provider)?.logo && (
                    <Image
                      src={getProviderById(group.provider)!.logo!}
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
                const provider = getProviderById(model.provider)
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
                        {model.features.isRecommended && (
                          <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Recommended
                          </span>
                        )}
                        {model.features.isFree && (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Free
                          </span>
                        )}
                        {model.features.isUnstable && (
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

// Re-export types from centralized location
export type { AIModel, ApiKey } from '@/lib/ai-models' 