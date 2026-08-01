import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CREATOR_X_URL, GITHUB_REPO_URL, SITE_URL, siteUrl } from "./site-config";

describe("site configuration", () => {
  it("uses the canonical public domain and normalizes paths", () => {
    assert.equal(SITE_URL, "https://resumelm.ca");
    assert.equal(siteUrl("/auth/login"), "https://resumelm.ca/auth/login");
    assert.equal(siteUrl("privacy"), "https://resumelm.ca/privacy");
  });

  it("points public links at the current project and creator profiles", () => {
    assert.equal(GITHUB_REPO_URL, "https://github.com/olyaiy/resume-lm");
    assert.equal(CREATOR_X_URL, "https://x.com/alexfromvan");
  });
});
