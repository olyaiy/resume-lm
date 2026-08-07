'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import {
  getAttributionProperties,
  getBrowserStorage,
  getUtmParameters,
  persistFirstTouchAttribution,
} from '@/lib/analytics/attribution';
import { AnalyticsEvents, sanitizeAnalyticsProperties } from '@/lib/analytics/events';
import {
  buildOutboundLinkProperties,
  isExternalHttpLink,
} from '@/lib/analytics/outbound';

export function OutboundLinkTracker() {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[data-analytics-id]');
      if (!anchor || !isExternalHttpLink(anchor.href, window.location.origin)) return;

      const currentAttribution = getUtmParameters(window.location.search);
      const firstTouchAttribution = persistFirstTouchAttribution(
        currentAttribution,
        getBrowserStorage(),
      );

      posthog.capture(
        AnalyticsEvents.OutboundLinkClicked,
        sanitizeAnalyticsProperties({
          ...buildOutboundLinkProperties({
            href: anchor.href,
            linkId: anchor.dataset.analyticsId,
            placement: anchor.dataset.analyticsPlacement,
            text: anchor.textContent,
            pathname: window.location.pathname,
            opensInNewTab: anchor.target === '_blank',
          }),
          ...getAttributionProperties(currentAttribution, firstTouchAttribution),
        }),
      );
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [posthog]);

  return null;
}
