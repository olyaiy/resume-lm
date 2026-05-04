import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AnalyticsEvents,
  buildAnalyticsPayload,
  sanitizeAnalyticsProperties,
} from "./events";

describe("AnalyticsEvents", () => {
  it("defines the operational lifecycle events used by product and billing analytics", () => {
    assert.equal(AnalyticsEvents.SignupCompleted, "signup_completed");
    assert.equal(AnalyticsEvents.ProfileCreated, "profile_created");
    assert.equal(AnalyticsEvents.ResumeCreated, "resume_created");
    assert.equal(AnalyticsEvents.ResumeTailored, "resume_tailored");
    assert.equal(AnalyticsEvents.AIRequestStarted, "ai_request_started");
    assert.equal(AnalyticsEvents.AIRequestSucceeded, "ai_request_succeeded");
    assert.equal(AnalyticsEvents.AIRequestFailed, "ai_request_failed");
    assert.equal(AnalyticsEvents.CheckoutStarted, "checkout_started");
    assert.equal(AnalyticsEvents.CheckoutCompleted, "checkout_completed");
    assert.equal(AnalyticsEvents.SubscriptionActivated, "subscription_activated");
    assert.equal(AnalyticsEvents.SubscriptionCanceled, "subscription_canceled");
  });
});

describe("sanitizeAnalyticsProperties", () => {
  it("keeps safe scalar properties and drops undefined values", () => {
    assert.deepEqual(
      sanitizeAnalyticsProperties({
        plan: "free",
        resume_type: "base",
        has_job: false,
        count: 2,
        unset: undefined,
      }),
      {
        plan: "free",
        resume_type: "base",
        has_job: false,
        count: 2,
      }
    );
  });

  it("removes sensitive content fields before analytics capture", () => {
    assert.deepEqual(
      sanitizeAnalyticsProperties({
        email: "person@example.com",
        raw_email: "person@example.com",
        resume_content: "full resume text",
        job_description: "full job text",
        api_key: "secret",
        stripe_subscription_id: "sub_123",
        subscription_status: "active",
      }),
      {
        stripe_subscription_id: "sub_123",
        subscription_status: "active",
      }
    );
  });
});

describe("buildAnalyticsPayload", () => {
  it("builds a PostHog capture payload without unsafe properties", () => {
    assert.deepEqual(
      buildAnalyticsPayload({
        apiKey: "ph_key",
        distinctId: "user_123",
        event: AnalyticsEvents.ResumeCreated,
        properties: {
          resume_type: "base",
          email: "person@example.com",
        },
      }),
      {
        api_key: "ph_key",
        distinct_id: "user_123",
        event: "resume_created",
        properties: {
          $geoip_disable: true,
          resume_type: "base",
        },
      }
    );
  });
});
