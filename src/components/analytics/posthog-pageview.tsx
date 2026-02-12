'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

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

    posthog.capture('$pageview', {
      $current_url: currentUrl,
    });
  }, [pathname, posthog, searchParams]);

  return null;
}
