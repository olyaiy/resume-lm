'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Key, Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { ApiKey, ServiceName } from "@/lib/types"
import { addApiKey, removeApiKey } from "@/utils/actions"
import { toast } from "sonner"
import { format } from "date-fns"

interface ApiKeysFormProps {
  apiKeys: ApiKey[];
}

export function ApiKeysForm({ apiKeys }: ApiKeysFormProps) {
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceName | ''>('')
  const [keyValue, setKeyValue] = useState('')

  const handleAddKey = async () => {
    if (!selectedService || !keyValue) {
      toast.error("Please select a provider and enter an API key")
      return
    }

    try {
      setIsLoading('add')
      await addApiKey(selectedService, keyValue)
      setKeyValue('')
      setSelectedService('')
      toast.success("API key added successfully")
    } catch {
      toast.error("Failed to add API key")
    } finally {
      setIsLoading(null)
    }
  }

  const handleRemoveKey = async (keyId: string) => {
    try {
      setIsLoading(keyId)
      await removeApiKey(keyId)
      toast.success("API key removed successfully")
    } catch {
      toast.error("Failed to remove API key")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Key Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Add New API Key</Label>
          <div className="flex gap-4">
            <Select
              value={selectedService}
              onValueChange={(value) => setSelectedService(value as ServiceName)}
            >
              <SelectTrigger className="bg-white/50 w-[200px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="bedrock">Amazon Bedrock</SelectItem>
                <SelectItem value="vertex">Google Vertex</SelectItem>
                <SelectItem value="xai">xAI Grok</SelectItem>
                <SelectItem value="together">Together.ai</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
                <SelectItem value="fireworks">Fireworks</SelectItem>
                <SelectItem value="deepinfra">DeepInfra</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Enter API key"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              className="bg-white/50 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              className="bg-white/50"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
              onClick={handleAddKey}
              disabled={isLoading === 'add'}
            >
              {isLoading === 'add' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Key
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="space-y-4">
        <Label>Active API Keys</Label>
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div 
              key={key.id}
              className="flex items-center justify-between p-4 rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Key className="h-4 w-4 text-teal-700" />
                </div>
                <div>
                  <p className="font-medium text-sm">{key.service_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Added on {format(new Date(key.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-rose-500 hover:bg-rose-600"
                onClick={() => handleRemoveKey(key.id)}
                disabled={isLoading === key.id}
              >
                {isLoading === key.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Remove
              </Button>
            </div>
          ))}
          
          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active API keys
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 