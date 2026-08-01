import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicSources = [
  "README.md",
  "src/app/(marketing)/page.tsx",
  "src/components/landing/Hero.tsx",
  "src/components/landing/FeatureHighlights.tsx",
  "src/components/landing/PricingPlans.tsx",
  "src/components/landing/pricing-section.tsx",
  "src/components/pricing/optimized-subscription-page.tsx",
  "src/components/settings/subscription-section.tsx",
  "src/components/dashboard/api-key-alert.tsx",
];

const forbidden = [
  "resumelm.com",
  "resume-ai",
  "No credit card required",
  "50,000+",
  "12,000+",
  "1,800+",
  "3x Higher Interview Rate",
  "300% increase",
  "30-day money-back guarantee",
  "Priority job matching algorithm",
  "Advanced analytics dashboard",
  "coming soon",
];

for (const relativePath of publicSources) {
  const content = readFileSync(join(root, relativePath), "utf8");
  for (const phrase of forbidden) {
    assert.equal(content.includes(phrase), false, `${relativePath} still contains stale trust copy: ${phrase}`);
  }
}

assert.equal(existsSync(join(root, "public/ResumeLM.mp4")), true);
assert.equal(existsSync(join(root, "public/logos/deepseek-logo-full.png")), true);
for (const route of [
  "(marketing)/privacy",
  "(marketing)/terms",
  "(marketing)/refund",
  "(marketing)/security",
  "robots.ts",
  "sitemap.ts",
]) {
  assert.equal(existsSync(join(root, `src/app/${route}`)), true, `missing public route ${route}`);
}

console.log("Public contract checks passed");
