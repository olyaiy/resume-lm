'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Crown, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button"
import { useApiKeys } from "@/hooks/use-api-keys"
import { useRouter } from "next/navigation"

type ApiKeyAlertVariant = 'upgrade' | 'trial'

export function ApiKeyAlert({ variant = 'upgrade' }: { variant?: ApiKeyAlertVariant }) {
  // Use synchronized hook for instant updates when API keys change
  const { apiKeys } = useApiKeys()
  const router = useRouter()
  
  // Check if user has any API keys configured
  const hasApiKeys = apiKeys.length > 0

  if (hasApiKeys) return null

  return (
    <Alert className="border-0 p-0 bg-transparent">
      <AlertDescription className="p-0">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 shadow-lg">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-indigo-100/20" />
          
          <div className="relative p-4">
            {/* Main Content - Horizontal Layout */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    {variant === 'trial' ? 'Try Pro free for 7 days' : 'Unlock Full AI Power'}
                  </h3>
                  {variant === 'trial' ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full">
                      Free trial
                    </span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full">
                        Most Popular
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">🚀 Unlimited resumes</span>
                  <span className="flex items-center gap-1">🤖 Latest AI models</span>
                  <span className="flex items-center gap-1">⚡ Instant access</span>
                </div>

                <p className="text-xs text-gray-500">
                  {variant === 'trial' ? 'Join 1,800+ users building with ResumeLM' : 'Join 1,800+ users building with ResumeLM'}
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0">
                {variant === 'trial' ? (
                  <Button
                    onClick={() => {
                      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
                      if (priceId) {
                        router.push(`/subscription/checkout?price_id=${priceId}&trial=true`)
                        return
                      }
                      router.push('/start-trial')
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    <Clock className="h-4 w-4" />
                    Start trial
                  </Button>
                ) : (
                  <ProUpgradeButton />
                )}
              </div>
            </div>

            {variant === 'upgrade' && (
              <div className="mt-3 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Or use your own API keys:</span>
                    <a 
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
                    >
                      Anthropic <ArrowRight className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
                    >
                      OpenAI <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                  <Link href="/settings">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-gray-600 hover:text-purple-600 h-6 px-2"
                    >
                      Configure
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
} 
