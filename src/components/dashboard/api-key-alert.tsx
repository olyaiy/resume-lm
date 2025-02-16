'use client'

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button"

function checkForApiKeys() {
  const storedKeys = localStorage.getItem('resumelm-api-keys')
  if (!storedKeys) return false
  
  try {
    const keys = JSON.parse(storedKeys)
    return Array.isArray(keys) && keys.length > 0
  } catch {
    return false
  }
}

export function ApiKeyAlert() {
  const [hasApiKeys, setHasApiKeys] = useState(true) // Start with true to prevent flash

  useEffect(() => {
    setHasApiKeys(checkForApiKeys())

    // Listen for storage changes
    const handleStorageChange = () => {
      setHasApiKeys(checkForApiKeys())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (hasApiKeys) return null

  return (
    <Alert className="border border-red-200/60 bg-red-50/90 backdrop-blur-sm">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-red-600 block">
              No API keys configured. You need API Keys to use the AI Features.
            </span>
            <div className="flex flex-col gap-1">
              <a 
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
              >
                Get your Anthropic API key (Recommended) →
              </a>
              <a 
                href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
              >
                Get your OpenAI API key →
              </a>
            </div>
          </div>
          <Link href="/settings">
            <Button
              size="sm"
              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
            >
              Set your API Keys
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between border-t border-red-200/60 pt-4">
          <span className="text-red-600">
            Or upgrade to Pro to get Full Access to All Models
          </span>
          <ProUpgradeButton />
        </div>
      </AlertDescription>
    </Alert>
  )
} 