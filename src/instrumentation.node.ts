import { PostHogSpanProcessor } from "@posthog/ai/otel";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";

import {
  getPostHogHost,
  getPostHogProjectApiKey,
  isPostHogLLMAnalyticsDisabled,
} from "./lib/ai/posthog-telemetry";

const posthogProjectApiKey = getPostHogProjectApiKey();

if (posthogProjectApiKey && !isPostHogLLMAnalyticsDisabled()) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "resumelm",
      "deployment.environment": process.env.NODE_ENV ?? "development",
    }),
    spanProcessors: [
      new PostHogSpanProcessor({
        apiKey: posthogProjectApiKey,
        host: getPostHogHost(),
      }),
    ],
  });

  sdk.start();
}
