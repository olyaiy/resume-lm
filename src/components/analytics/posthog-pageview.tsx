'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import {
  getAttributionProperties,
  getBrowserStorage,
  getUtmParameters,
  persistFirstTouchAttribution,
  sanitizeAnalyticsUrl,
} from '@/lib/analytics/attribution';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog || !pathname) return;

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

    if (Object.keys(attribution).length > 0) {
      posthog.register(attribution);
    }

    posthog.capture('$pageview', {
      $current_url: sanitizeAnalyticsUrl(currentUrl),
      ...attribution,
    });
  }, [pathname, posthog, searchParams]);

  return null;
}
