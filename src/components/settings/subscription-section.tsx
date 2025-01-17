'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, Zap } from "lucide-react"

export function SubscriptionSection() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-gray-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Free Plan</p>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                Current Plan
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Basic features • Limited to 1 resume</p>
          </div>
        </div>
        <Button 
          variant="outline"
          className="bg-violet-600 text-white border-0 hover:bg-violet-700 transition-colors"
        >
          Upgrade to Pro $20/mo
        </Button>
      </div>

      {/* Pro Plan Features */}
      <div className="p-4 rounded-lg border border-violet-200/40 bg-violet-50/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Zap className="h-3 w-3 text-violet-700" />
          </div>
          <p className="font-medium text-violet-700">Pro Plan Features</p>
        </div>
        <ul className="space-y-2 text-sm text-violet-700">
          <li>• Unlimited resumes</li>
          <li>• AI-powered resume tailoring</li>
          <li>• Custom styling options</li>
          <li>• Priority support</li>
          <li>• Export to multiple formats</li>
        </ul>
      </div>
    </div>
  )
} 