'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PostHogReactProvider } from 'posthog-js/react';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
let hasInitialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!posthogKey || hasInitialized) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2026-01-30',
      capture_pageview: true,
      capture_pageleave: true,
    });

    hasInitialized = true;
  }, []);

  return (
    <PostHogReactProvider client={posthog}>
      {children}
    </PostHogReactProvider>
  );
}
