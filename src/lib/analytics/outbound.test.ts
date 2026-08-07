import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildOutboundLinkProperties,
  isExternalHttpLink,
} from "./outbound";

describe("outbound analytics", () => {
  it("recognizes external HTTP links without treating internal routes as outbound", () => {
    assert.equal(
      isExternalHttpLink("https://github.com/olyaiy/resume-lm?utm_source=resumelm", "https://resumelm.ca"),
      true,
    );
    assert.equal(isExternalHttpLink("/profile", "https://resumelm.ca"), false);
    assert.equal(isExternalHttpLink("mailto:support@example.com", "https://resumelm.ca"), false);
  });

  it("captures safe destination, placement, text, and destination UTM fields", () => {
    assert.deepEqual(
      buildOutboundLinkProperties({
        href: "https://github.com/olyaiy/resume-lm?utm_source=resumelm&utm_medium=referral&utm_campaign=landing",
        linkId: "outbound-github-repo",
        text: "  View source code   on GitHub  ",
        pathname: "/",
        opensInNewTab: true,
      }),
      {
        link_id: "outbound-github-repo",
        link_placement: "outbound-github-repo",
        link_text: "View source code on GitHub",
        destination_host: "github.com",
        destination_path: "/olyaiy/resume-lm",
        destination_protocol: "https",
        current_pathname: "/",
        opens_in_new_tab: true,
        destination_utm_source: "resumelm",
        destination_utm_medium: "referral",
        destination_utm_campaign: "landing",
      },
    );
  });
});
