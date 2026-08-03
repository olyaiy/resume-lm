import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTH_ERROR_CODES,
  addAuthIntentToUrl,
  buildAuthCallbackUrl,
  classifyOAuthError,
  getAuthIntentFromSearchParams,
  getAuthRedirectPath,
  getSafeRedirectPath,
} from "./auth-intent";

test("only allows same-origin relative redirect paths", () => {
  assert.equal(getSafeRedirectPath("/subscription"), "/subscription");
  assert.equal(getSafeRedirectPath("/subscription?plan=pro"), "/subscription?plan=pro");
  assert.equal(getSafeRedirectPath("https://evil.example"), "/");
  assert.equal(getSafeRedirectPath("//evil.example"), "/");
  assert.equal(getSafeRedirectPath("/\\\\evil.example"), "/");
});

test("serializes the selected plan and next path into the callback URL", () => {
  const callbackUrl = new URL(buildAuthCallbackUrl("https://resumelm.ca", {
    next: "/subscription",
    plan: "pro",
  }));

  assert.equal(callbackUrl.pathname, "/auth/callback");
  assert.equal(callbackUrl.searchParams.get("next"), "/subscription");
  assert.equal(callbackUrl.searchParams.get("plan"), "pro");
});

test("preserves intent when building a retry URL and chooses a Pro fallback", () => {
  const retryUrl = addAuthIntentToUrl(new URL("https://resumelm.ca/auth/login"), {
    next: "/subscription",
    plan: "pro",
  });

  assert.equal(retryUrl.search, "?next=%2Fsubscription&plan=pro");
  assert.deepEqual(
    getAuthIntentFromSearchParams(retryUrl.searchParams),
    { next: "/subscription", plan: "pro" },
  );
  assert.equal(getAuthRedirectPath({ plan: "pro" }), "/subscription");
});

test("classifies provider, state, and exchange failures separately", () => {
  assert.equal(
    classifyOAuthError({ providerError: "access_denied" }),
    AUTH_ERROR_CODES.oauthProviderDenied,
  );
  assert.equal(
    classifyOAuthError({ message: "State has already been used" }),
    AUTH_ERROR_CODES.oauthStateMismatch,
  );
  assert.equal(
    classifyOAuthError({ providerErrorCode: "bad_oauth_state" }),
    AUTH_ERROR_CODES.oauthStateMismatch,
  );
  assert.equal(
    classifyOAuthError({
      providerError: "invalid_request",
      providerErrorCode: "flow_state_already_used",
      providerErrorDescription: "State has already been used",
    }),
    AUTH_ERROR_CODES.oauthStateMismatch,
  );
  assert.equal(
    classifyOAuthError({ message: "invalid authorization code" }),
    AUTH_ERROR_CODES.oauthExchangeFailed,
  );
});
