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
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-violet-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Pro Plan</p>
              <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                Current Plan
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">$29/month • Renews on Jan 1, 2024</p>
          </div>
        </div>
        <Button 
          variant="outline"
          className="bg-white/50 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
        >
          Change Plan
        </Button>
      </div>

      {/* Payment Method */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-violet-700" />
          </div>
          <div>
            <p className="font-medium">Payment Method</p>
            <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
          </div>
        </div>
        <Button 
          variant="outline"
          className="bg-white/50 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-0" />
          Update
        </Button>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Billing History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/40 bg-white/30 backdrop-blur-sm">
            <div>
              <p className="font-medium">December 2023</p>
              <p className="text-sm text-muted-foreground">Pro Plan • $29.00</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white/50 hover:bg-violet-50 text-violet-700"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 