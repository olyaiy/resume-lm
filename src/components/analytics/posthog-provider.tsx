'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PostHogReactProvider } from 'posthog-js/react';
import { sanitizeAnalyticsProperties } from '@/lib/analytics/events';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
let hasInitialized = false;

interface AnalyticsUser {
  id: string;
  subscriptionPlan: string;
  subscriptionStatus: string | null;
  isPro: boolean;
}

export function PostHogProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: AnalyticsUser | null;
}) {
  useEffect(() => {
    if (!posthogKey || hasInitialized) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2026-01-30',
      capture_pageview: false,
      capture_pageleave: true,
    });

    hasInitialized = true;
  }, []);

  useEffect(() => {
    if (!posthogKey || !hasInitialized) return;

    if (!user?.id) {
      posthog.reset();
      return;
    }

    posthog.identify(user.id, sanitizeAnalyticsProperties({
      subscription_plan: user.subscriptionPlan,
      subscription_status: user.subscriptionStatus,
      is_pro: user.isPro,
    }));
  }, [user?.id, user?.isPro, user?.subscriptionPlan, user?.subscriptionStatus]);

  return (
    <PostHogReactProvider client={posthog}>
      {children}
    </PostHogReactProvider>
  );
}
