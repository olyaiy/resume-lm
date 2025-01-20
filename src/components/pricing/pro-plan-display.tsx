'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';

interface ProPlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
  } | null;
}

export function ProPlanDisplay({ initialProfile }: ProPlanDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePortalSession = async () => {
    try {
      setIsLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-12 text-center rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50 backdrop-blur-xl">
        <div className="space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Thank You for Being a Pro Member!
          </h2>
          <p className="text-muted-foreground text-lg">
            Enjoy unlimited access to all premium features and priority support.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={handlePortalSession}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 