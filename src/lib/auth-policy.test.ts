import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getEmailSignupBlockedMessage, isEmailSignupAllowed } from "./auth-policy";

describe("auth policy", () => {
  it("requires Google for new account signup", () => {
    assert.equal(isEmailSignupAllowed(), false);
    assert.equal(
      getEmailSignupBlockedMessage(),
      "New accounts must be created with Google. Existing users can still sign in with email and password."
    );
  });
});
