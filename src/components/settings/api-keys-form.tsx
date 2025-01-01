'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Key, Loader2, Plus } from "lucide-react"
import { useState } from "react"

export function ApiKeysForm() {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-6">
      {/* Add New Key Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Add New API Key</Label>
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="bg-white/50 w-[200px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Enter API key"
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
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Key
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="space-y-4">
        <Label>Active API Keys</Label>
        <div className="space-y-3">
          {/* Example Key Item */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                <Key className="h-4 w-4 text-teal-700" />
              </div>
              <div>
                <p className="font-medium text-sm">OpenAI</p>
                <p className="text-sm text-muted-foreground">Added on Dec 25, 2023</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="bg-rose-500 hover:bg-rose-600"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-0" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 