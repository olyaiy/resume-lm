export const AnalyticsEvents = {
  SignupCompleted: "signup_completed",
  ProfileCreated: "profile_created",
  ResumeCreated: "resume_created",
  ResumeTailored: "resume_tailored",
  AIRequestStarted: "ai_request_started",
  AIRequestSucceeded: "ai_request_succeeded",
  AIRequestFailed: "ai_request_failed",
  CheckoutStarted: "checkout_started",
  CheckoutCompleted: "checkout_completed",
  SubscriptionActivated: "subscription_activated",
  SubscriptionCanceled: "subscription_canceled",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export type AnalyticsPropertyValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

const SENSITIVE_PROPERTY_KEYS = new Set([
  "api_key",
  "api_keys",
  "apikey",
  "card",
  "card_number",
  "email",
  "full_email",
  "job_description",
  "password",
  "payment_method",
  "raw_email",
  "resume_content",
  "resume_text",
  "stripe_customer_email",
]);

export function sanitizeAnalyticsProperties(
  properties: AnalyticsProperties = {}
): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (value === undefined) return false;
      return !SENSITIVE_PROPERTY_KEYS.has(key.toLowerCase());
    })
  ) as Record<string, string | number | boolean | null>;
}

export function buildAnalyticsPayload(input: {
  apiKey: string;
  distinctId: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
}) {
  return {
    api_key: input.apiKey,
    distinct_id: input.distinctId,
    event: input.event,
    properties: {
      ...sanitizeAnalyticsProperties(input.properties),
      $geoip_disable: true,
    },
  };
}
