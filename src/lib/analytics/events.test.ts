import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AnalyticsEvents,
  buildAnalyticsInsertId,
  buildAnalyticsPayload,
  sanitizeAnalyticsProperties,
} from "./events";

describe("AnalyticsEvents", () => {
  it("defines the operational lifecycle events used by product and billing analytics", () => {
    assert.equal(AnalyticsEvents.AuthStarted, "auth_started");
    assert.equal(AnalyticsEvents.AuthSucceeded, "auth_succeeded");
    assert.equal(AnalyticsEvents.EmailConfirmationCompleted, "email_confirmation_completed");
    assert.equal(AnalyticsEvents.OAuthCompleted, "oauth_completed");
    assert.equal(AnalyticsEvents.SignupCompleted, "signup_completed");
    assert.equal(AnalyticsEvents.OnboardingCompleted, "onboarding_completed");
    assert.equal(AnalyticsEvents.ProfileCreated, "profile_created");
    assert.equal(AnalyticsEvents.ProfileCompleted, "profile_completed");
    assert.equal(AnalyticsEvents.ResumeCreated, "resume_created");
    assert.equal(AnalyticsEvents.FirstResumeSaved, "first_resume_saved");
    assert.equal(AnalyticsEvents.ResumeTailored, "resume_tailored");
    assert.equal(AnalyticsEvents.AIRequestStarted, "ai_request_started");
    assert.equal(AnalyticsEvents.AIRequestSucceeded, "ai_request_succeeded");
    assert.equal(AnalyticsEvents.FirstAIRequestSucceeded, "first_ai_request_succeeded");
    assert.equal(AnalyticsEvents.AIRequestFailed, "ai_request_failed");
    assert.equal(AnalyticsEvents.CheckoutViewed, "checkout_viewed");
    assert.equal(AnalyticsEvents.CheckoutStarted, "checkout_started");
    assert.equal(AnalyticsEvents.CheckoutError, "checkout_error");
    assert.equal(AnalyticsEvents.CheckoutCompleted, "checkout_completed");
    assert.equal(AnalyticsEvents.PagePerformance, "page_performance");
    assert.equal(AnalyticsEvents.ResumeEditorViewed, "resume_editor_viewed");
    assert.equal(AnalyticsEvents.ResumeEditorTabChanged, "resume_editor_tab_changed");
    assert.equal(AnalyticsEvents.ResumeEditorActionFailed, "resume_editor_action_failed");
    assert.equal(AnalyticsEvents.OutboundLinkClicked, "outbound_link_clicked");
    assert.equal(AnalyticsEvents.TrialStarted, "trial_started");
    assert.equal(AnalyticsEvents.FirstInvoicePaid, "first_invoice_paid");
    assert.equal(AnalyticsEvents.EntitlementActivated, "entitlement_activated");
    assert.equal(AnalyticsEvents.InvoicePaymentFailed, "invoice_payment_failed");
    assert.equal(AnalyticsEvents.SubscriptionCanceled, "subscription_canceled");
    assert.equal(AnalyticsEvents.BillingAlertTriggered, "billing_alert_triggered");
    assert.equal(AnalyticsEvents.ExceptionCaptured, "$exception");
    assert.equal(Object.hasOwn(AnalyticsEvents, "SubscriptionActivated"), false);
  });

  it("builds stable user-scoped lifecycle insert ids", () => {
    assert.equal(
      buildAnalyticsInsertId("user_123", AnalyticsEvents.FirstResumeSaved),
      "user_123:first_resume_saved",
    );
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
          analytics_user_id: "user_123",
          $geoip_disable: true,
          resume_type: "base",
        },
      }
    );
  });

  it("passes a stable insert id when server events need logical deduplication", () => {
    assert.equal(
      buildAnalyticsPayload({
        apiKey: "ph_key",
        distinctId: "user_123",
        event: AnalyticsEvents.FirstInvoicePaid,
        insertId: "in_123:first_invoice_paid",
      }).properties.$insert_id,
      "in_123:first_invoice_paid"
    );
  });
});
