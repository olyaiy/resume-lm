'use client'

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    posthog.captureException(error, {
      exception_source: 'next_error_boundary',
      error_digest: error.digest ?? null,
      pathname: window.location.pathname,
    });
  }, [error]);

  return <p>Sorry, something went wrong</p>
}
