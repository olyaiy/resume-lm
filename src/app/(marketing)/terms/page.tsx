import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: siteUrl("terms") },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="August 1, 2026">
      <h2>Using ResumeLM</h2>
      <p>
        ResumeLM provides resume editing, tailoring, export, and related AI-assisted tools. You are responsible for the accuracy of information you submit and for reviewing generated content before using it in an application.
      </p>
      <h2>AI output</h2>
      <p>
        AI suggestions are generated from the information and instructions provided. ResumeLM does not guarantee interviews, employment, ATS ranking, or any other hiring outcome.
      </p>
      <h2>Subscriptions and trials</h2>
      <p>
        Pro subscriptions are billed at the price shown at checkout. A trial, when offered, requires a payment method and converts to the displayed recurring subscription unless canceled before the trial ends. Billing and cancellation are managed through Stripe.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <a href="mailto:resumelm@pm.me">resumelm@pm.me</a>.
      </p>
    </LegalPage>
  );
}
