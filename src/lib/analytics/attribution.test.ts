import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getAnalyticsContextProperties,
  getAttributionProperties,
  getUtmParameters,
  normalizeAnalyticsAnonymousId,
  parseStoredAttributionValue,
  persistFirstTouchAttribution,
  sanitizeAnalyticsUrl,
  withUtmParameters,
} from "./attribution";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

describe("analytics attribution", () => {
  it("accepts a safe stable anonymous ID and rejects unsafe values", () => {
    assert.equal(normalizeAnalyticsAnonymousId("ph_anon-123"), "ph_anon-123");
    assert.equal(normalizeAnalyticsAnonymousId("anon id"), undefined);
    assert.equal(normalizeAnalyticsAnonymousId(""), undefined);
  });

  it("parses the encoded first-touch cookie payload", () => {
    assert.deepEqual(
      parseStoredAttributionValue(
        encodeURIComponent(
          JSON.stringify({
            utm_source: "github",
            utm_medium: "referral",
            ignored: "value",
          }),
        ),
      ),
      { utm_source: "github", utm_medium: "referral" },
    );
    assert.deepEqual(
      parseStoredAttributionValue('{"utm_source":"100%organic"}'),
      { utm_source: "100%organic" },
    );
  });

  it("reads and bounds UTM parameters", () => {
    const result = getUtmParameters(
      "https://resumelm.ca/?utm_source=github&utm_medium=referral&ignored=value&utm_campaign=${" + "a".repeat(200) + "}",
    );

    assert.equal(result.utm_source, "github");
    assert.equal(result.utm_medium, "referral");
    assert.equal(result.utm_campaign?.length, 120);
    assert.equal("ignored" in result, false);
  });

  it("persists first-touch attribution without overwriting it", () => {
    const storage = createStorage();
    const first = persistFirstTouchAttribution(
      { utm_source: "github", utm_medium: "referral" },
      storage,
    );
    const second = persistFirstTouchAttribution(
      { utm_source: "linkedin", utm_medium: "social" },
      storage,
    );

    assert.deepEqual(first, { utm_source: "github", utm_medium: "referral" });
    assert.deepEqual(second, first);
  });

  it("returns current and first-touch properties for event capture", () => {
    assert.deepEqual(
      getAttributionProperties(
        { utm_source: "linkedin", utm_medium: "social" },
        { utm_source: "github", utm_medium: "referral" },
      ),
      {
        utm_source: "linkedin",
        initial_utm_source: "github",
        utm_medium: "social",
        initial_utm_medium: "referral",
      },
    );
  });

  it("adds the stable anonymous ID alongside current and first-touch UTM values", () => {
    assert.deepEqual(
      getAnalyticsContextProperties({
        anonymousId: "ph_anon-123",
        currentAttribution: { utm_source: "resumelm", utm_medium: "referral" },
        firstTouchAttribution: { utm_source: "github", utm_medium: "referral" },
      }),
      {
        analytics_anonymous_id: "ph_anon-123",
        utm_source: "resumelm",
        initial_utm_source: "github",
        utm_medium: "referral",
        initial_utm_medium: "referral",
      },
    );
  });

  it("preserves existing URL parameters while adding campaign parameters", () => {
    assert.equal(
      withUtmParameters("/auth/login?next=%2Fhome#start", {
        utm_source: "github",
        utm_medium: "referral",
      }),
      "/auth/login?next=%2Fhome&utm_source=github&utm_medium=referral#start",
    );
  });

  it("removes credentials and payment identifiers from analytics URLs", () => {
    assert.equal(
      sanitizeAnalyticsUrl(
        "https://resumelm.ca/subscription/checkout/success?session_id=cs_test&code=secret&utm_source=github",
      ),
      "https://resumelm.ca/subscription/checkout/success?utm_source=github",
    );
  });
});
