'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import {
  getAttributionProperties,
  getBrowserStorage,
  getUtmParameters,
  getAnalyticsContextProperties,
  persistBrowserAnalyticsContext,
  persistFirstTouchAttribution,
  readBrowserAnalyticsAnonymousId,
  sanitizeAnalyticsUrl,
} from '@/lib/analytics/attribution';

export function PostHogPageView({ userId }: { userId?: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname) return;

    // Identify before capturing the first authenticated pageview so browser
    // events and server-side lifecycle events share the Supabase user UUID.
    if (userId) {
      posthog.identify(userId);
    }

    const search = searchParams.toString();
    const currentUrl =
      search.length > 0
        ? `${window.location.origin}${pathname}?${search}`
        : `${window.location.origin}${pathname}`;

    const currentAttribution = getUtmParameters(searchParams);
    const firstTouchAttribution = persistFirstTouchAttribution(
      currentAttribution,
      getBrowserStorage(),
    );
    const attribution = getAttributionProperties(
      currentAttribution,
      firstTouchAttribution,
    );
    const anonymousId =
      readBrowserAnalyticsAnonymousId() ??
      (!userId ? posthog?.get_distinct_id?.() : undefined);
    const analyticsContext = {
      anonymousId,
      currentAttribution,
      firstTouchAttribution,
    };
    const contextProperties = getAnalyticsContextProperties(analyticsContext);

    persistBrowserAnalyticsContext(analyticsContext);

    if (!posthog) return;

    if (Object.keys(contextProperties).length > 0) {
      posthog.register(contextProperties);
    }

    posthog.capture('$pageview', {
      $current_url: sanitizeAnalyticsUrl(currentUrl),
      ...attribution,
      ...contextProperties,
    });
  }, [pathname, posthog, searchParams, userId]);

  return null;
}
