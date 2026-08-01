import { Suspense } from "react";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { PostHogProvider } from "@/components/analytics/posthog-provider";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PostHogProvider user={null}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}
