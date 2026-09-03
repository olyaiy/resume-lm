import type { Instrumentation } from 'next';

import { AnalyticsEvents } from '@/lib/analytics/events';
import { captureServerAnalyticsEvent } from '@/lib/analytics/server';

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}

function truncate(value: string | undefined, maxLength: number) {
  return value?.slice(0, maxLength) ?? null;
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const capturedError = error instanceof Error ? error : new Error('Unknown request error');
  const digest =
    typeof (error as { digest?: unknown })?.digest === 'string'
      ? (error as { digest: string }).digest
      : null;

  await captureServerAnalyticsEvent({
    distinctId: 'resumelm-server',
    event: AnalyticsEvents.ExceptionCaptured,
    identitySource: 'server',
    properties: {
      $exception_type: capturedError.name,
      $exception_message: truncate(capturedError.message, 1000),
      $exception_stack_trace_raw: truncate(capturedError.stack, 6000),
      $exception_handled: false,
      $exception_digest: digest,
      exception_source: 'next_on_request_error',
      route_path: context.routePath,
      route_type: context.routeType,
      request_method: request.method,
      pathname: request.path.split('?')[0].slice(0, 300),
      runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
    },
  });
};
