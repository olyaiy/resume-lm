import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Security",
  alternates: { canonical: siteUrl("security") },
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security" updated="August 1, 2026">
      <h2>Application controls</h2>
      <p>
        ResumeLM uses Supabase authentication and row-level access controls for application data. Billing events are processed server-side through Stripe, and provider secrets are kept in server environment variables rather than sent to the browser.
      </p>
      <h2>Limits of the service</h2>
      <p>
        No online service can guarantee absolute security. API keys entered into the browser are stored in local storage and should not be entered on shared devices. Please report suspected security issues to <a href="mailto:resumelm@pm.me">resumelm@pm.me</a>.
      </p>
    </LegalPage>
  );
}
