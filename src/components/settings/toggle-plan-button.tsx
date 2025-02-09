'use client';

import { useEffect, useState } from 'react';
import { getSubscriptionPlan, toggleSubscriptionPlan } from '@/utils/actions/stripe/actions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function TogglePlanButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const checkProStatus = async () => {
      const plan = await getSubscriptionPlan()
      setIsPro(plan === 'pro')
    }
    checkProStatus()
  }, [])

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newPlan = await toggleSubscriptionPlan(isPro ? 'free' : 'pro');
      setIsPro(newPlan === 'pro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isPro ? 'default' : 'outline'}
      className={isPro ? 'bg-purple-600 hover:bg-purple-700' : ''}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        `Switch to ${isPro ? 'Free' : 'Pro'} Plan`
      )}
    </Button>
  );
} 