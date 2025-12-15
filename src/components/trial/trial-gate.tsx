'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrialGateContextValue = {
  enabled: boolean;
  open: () => void;
};

const TrialGateContext = createContext<TrialGateContextValue>({
  enabled: false,
  open: () => {},
});

export function useTrialGate() {
  return useContext(TrialGateContext);
}

const features = [
  'Unlimited base resumes',
  'Unlimited AI-tailored resumes',
  'Advanced AI assistance',
  'Premium ATS-optimized templates',
  'Cover letter generation',
];

export function TrialGateProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(enabled);
  const router = useRouter();

  useEffect(() => {
    if (enabled) setIsOpen(true);
  }, [enabled]);

  const value = useMemo<TrialGateContextValue>(
    () => ({
      enabled,
      open: () => setIsOpen(true),
    }),
    [enabled]
  );

  const startTrial = () => {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (!priceId) return;
    router.push(`/subscription/checkout?price_id=${priceId}&trial=true`);
  };

  return (
    <TrialGateContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50" />
            <div className="relative p-6 sm:p-8">
              <DialogHeader className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                    7-day free trial
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Start your free trial
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  You can explore the dashboard, but you’ll need to start your trial to open or create resumes.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-700" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={startTrial}
                  className={cn(
                    'w-full sm:w-auto flex-1',
                    'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start free trial
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
                  Not now
                </Button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Card required. Cancel anytime before your trial ends and you won’t be charged.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TrialGateContext.Provider>
  );
}

