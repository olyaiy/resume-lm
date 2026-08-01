import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: siteUrl("refund") },
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated="August 1, 2026">
      <h2>Billing issues</h2>
      <p>
        Contact <a href="mailto:resumelm@pm.me">resumelm@pm.me</a> as soon as possible if you believe a payment was duplicated, unauthorized, or otherwise incorrect. Include the billing email and relevant Stripe receipt information; do not send full card numbers.
      </p>
      <h2>Subscription cancellation</h2>
      <p>
        You can cancel through the Stripe billing portal. Cancellation prevents future renewals; access remains available according to the subscription state shown in the application.
      </p>
      <h2>Refund decisions</h2>
      <p>
        Refund requests are reviewed individually. ResumeLM does not currently advertise an automatic money-back guarantee. Approved refunds are returned through Stripe to the original payment method.
      </p>
    </LegalPage>
  );
}
