import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isEmailSignupAllowed } from "./auth-policy";

describe("auth policy", () => {
  it("allows email signup", () => {
    assert.equal(isEmailSignupAllowed(), true);
  });
});
