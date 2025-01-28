'use client';

import { Button } from '@/components/ui/button';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';

export default function ManageSubscriptionButton() {
  const handleManageSubscription = async () => {
    try {
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
      void error
    }
  };

  return (
    <Button 
      onClick={handleManageSubscription}
      variant="outline"
    >
      Manage Subscription
    </Button>
  );
} 