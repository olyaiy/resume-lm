'use client';

import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { AnalyticsEvents, sanitizeAnalyticsProperties } from '@/lib/analytics/events';

function roundMilliseconds(value: number | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value);
}

export function PagePerformance() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const reportedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const routeGroup = pathname === '/home'
      ? 'home'
      : pathname?.startsWith('/resumes/')
        ? 'editor'
        : null;

    if (!posthog || !routeGroup || reportedPathRef.current === pathname) return;

    reportedPathRef.current = pathname;
    const timer = window.setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;

      posthog.capture(AnalyticsEvents.PagePerformance, sanitizeAnalyticsProperties({
        route_group: routeGroup,
        pathname: routeGroup === 'home' ? '/home' : '/resumes/:id',
        navigation_type: navigation?.type ?? null,
        ttfb_ms: roundMilliseconds(navigation?.responseStart),
        dom_interactive_ms: roundMilliseconds(navigation?.domInteractive),
        dom_content_loaded_ms: roundMilliseconds(navigation?.domContentLoadedEventEnd),
        load_event_end_ms: roundMilliseconds(navigation?.loadEventEnd),
        capture_source: 'browser',
      }));
    }, routeGroup === 'home' ? 5000 : 2000);

    return () => window.clearTimeout(timer);
  }, [pathname, posthog]);

  return null;
}
