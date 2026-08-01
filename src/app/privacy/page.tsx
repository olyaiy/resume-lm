import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: siteUrl("privacy") },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 1, 2026">
      <h2>What ResumeLM stores</h2>
      <p>
        ResumeLM stores account, profile, resume, subscription, and usage data needed to provide the service. Resume content is associated with your account so it can be edited, exported, and tailored.
      </p>
      <h2>Service providers</h2>
      <p>
        ResumeLM uses Supabase for authentication and application data, Stripe for billing, PostHog for product analytics, and configured AI providers to process AI requests. These providers process data only as needed to provide their services under their own terms and privacy policies.
      </p>
      <h2>API keys</h2>
      <p>
        API keys that you add yourself are stored in this browser&apos;s local storage. They are not encrypted by ResumeLM, so do not use this feature on a shared or untrusted device. Pro requests may use ResumeLM&apos;s server-side provider credentials for eligible models.
      </p>
      <h2>Your choices</h2>
      <p>
        You may self-host the open-source application, remove locally stored API keys from Settings, or contact <a href="mailto:resumelm@pm.me">resumelm@pm.me</a> with privacy questions or deletion requests.
      </p>
    </LegalPage>
  );
}
