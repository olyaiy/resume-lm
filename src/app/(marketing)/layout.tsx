import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { PostHogProvider } from "@/components/analytics/posthog-provider";

const isVercel = process.env.VERCEL === "1";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PostHogProvider user={null}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <div className="relative min-h-screen">{children}</div>
      {isVercel && <Analytics />}
    </PostHogProvider>
  );
}
