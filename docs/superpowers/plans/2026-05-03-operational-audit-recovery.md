# ResumeLM Operational Audit Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make billing, subscription access, AI spend, and analytics trustworthy enough that ResumeLM can be operated without guessing.

**Architecture:** Treat Stripe as the billing source of truth, Supabase as the entitlement/cache layer, and PostHog as product analytics only after explicit events are added. The recovery sequence is: repair webhook persistence, reconcile production state, tighten server-side access checks, centralize AI spend controls, then add observability so future failures are visible quickly.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase Auth/Postgres/RLS, Stripe Billing, PostHog, Vercel AI SDK, OpenRouter/OpenAI/Anthropic/Gemini/Groq, Upstash Redis.

---

## Audit Snapshot

Captured during a read-only operational audit in May 2026.

Production Supabase aggregate state:

- Auth users: `2,617`
- Confirmed users: `2,244`
- Users with at least one sign-in: `2,096`
- Users created in the last 7 days: `34`
- Users created in the last 30 days: `156`
- Profiles: `2,617`
- Resumes: `3,561`
- Jobs: `322`
- Subscriptions: `2,617`
- Users missing profiles: `0`
- Users missing subscriptions: `0`
- Users with at least one resume: `2,574`
- Users with at least one job: `200`
- Resumes by type: `base = 3,335`, `tailored = 226`
- Jobs by active flag: `true = 322`
- Subscriptions by plan/status: `free:null = 2,510`, `free:active = 74`, `free:canceled = 16`, `pro:active = 6`, `pro:canceled = 11`

Production Stripe dashboard state:

- Current Stripe account: `acct_1QchQSCv6RlaQFiM`
- Today gross volume visible on home dashboard: `$0.00`
- CAD balance visible on home dashboard: `CA$49.21`
- Total live subscriptions visible in Stripe: `42`
- Active paid subscriptions: `2`
- Free trials: `2`
- Canceled subscriptions: `38`
- Succeeded payments: `19`
- Refunded payments: `1`
- Disputed payments: `0`
- Failed payments: `11`
- Subscription product visible in rows: `ResumeLM Premium`, `$20 USD/month`

Stripe webhook destination state:

- Destination URL: `https://resumelm.ca/api/webhooks/stripe`
- Destination status: active
- Stripe dashboard showed this week: `91` total event deliveries, `54` failed
- Failing event types included `customer.subscription.created`, `invoice.paid`, and `checkout.session.completed`
- Failed delivery response body was the app's generic `{"error":"Webhook handler failed", ...}` HTTP 500 response

PostHog state:

- Project visible in browser: `ResumeLM`, project id `311922`
- Dashboard visible: `My App Dashboard`, dashboard id `1273083`
- DAU/WAU charts show real traffic
- Retention table showed weak week-1 retention in visible cohorts
- Current code initializes PostHog, but does not identify users or capture first-class product events for signup, resume creation, checkout, AI usage, or subscription lifecycle

Build health:

- `pnpm lint` passed
- `pnpm exec tsc --noEmit --pretty false` passed
- `pnpm build` passed

Local environment caveat:

- Local `.env.local` Stripe key appeared to be test-mode, while the browser dashboard was live Stripe.
- Local Stripe test state is not enough to validate live billing.
- Keep production Stripe, test Stripe, and local development config explicitly separated before doing billing work.

---

## Current Recovery Status

Updated after Task 3 production entitlement reconciliation on May 3, 2026.

- **Task 1 persistence repair is deployed and verified.** Production Supabase now has `public.stripe_webhook_events`, RLS is enabled, `anon` and `authenticated` cannot access the table, and `service_role` can insert/update/delete as required by the webhook route.
- **GitHub production delivery succeeded for the schema repair.** Commit `a4ea80d` added the table and RLS hardening locally, and GitHub Actions reported success for both `Helm Chart Publish` and `Build and Push Docker Image`.
- **Handled Stripe webhook replay worked.** Replayed unique live `invoice.paid` and `checkout.session.completed` events against `https://resumelm.ca/api/webhooks/stripe`; both wrote rows to `public.stripe_webhook_events` with non-null `processed_at`.
- **Supabase subscription state changed after replay.** A full paginated production check showed `2,617` subscription rows and `pro:active = 7`; the audit snapshot had `pro:active = 6`.
- **Task 2 subscription sync repair is locally implemented and verified.** The webhook route now handles `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`, and `invoice.paid` through the same deterministic Stripe-to-Supabase sync path. `manageSubscriptionStatusChange` no longer selects the non-existent `subscriptions.id` column and now upserts by `user_id`.
- **Subscription access is now stricter.** A row with free plan plus Stripe fields no longer grants Pro access; Pro access now requires `subscription_plan = 'pro'` with active, trialing, or canceling-with-unexpired-period state.
- **Task 2 verification passed locally.** Focused Node tests passed with `7` tests across subscription mapping and access behavior, and `pnpm lint`, `pnpm exec tsc --noEmit --pretty false`, and `pnpm build` all passed.
- **Task 3 entitlement reconciliation is repaired and verified.** Stripe CLI live reads showed `4` active/trialing subscriptions, but only `3` distinct Supabase users because customer `cus_UGYZ...LYNE` has two active paid subscriptions. Production Supabase now has `3` `pro:active` rows, `0` stale `pro:active` rows, and `0` active/trialing Stripe customers missing `metadata.supabaseUUID`.
- **Stripe duplicate subscription cleanup is partially completed.** The older duplicate subscription `sub_1TI1ShCv6RlaQFiMVwxEviBt` was canceled through the Stripe dashboard on May 3, 2026 and verified by live Stripe CLI: `status = canceled`, `canceled_at = 2026-05-03T18:43:15Z`, `ended_at = 2026-05-03T18:43:15Z`. Supabase still grants entitlement using the newer/current subscription `sub_1TI1ZbCv6RlaQFiMQHIZVzZI`.
- **Duplicate refund is handled by Stripe/Link, not by a normal merchant refund object.** A direct dashboard refund attempt for the intended duplicate April 10, 2026 `$20 USD` charge on invoice `in_1TKYo4Cv6RlaQFiM5Qf00Gmg` / payment intent `pi_3TKZlDCv6RlaQFiM1SPXsRQd` failed with Stripe error `charge_not_refundable` and message code `payment_refund_hidden_link_refunded`: "This payment is not refundable as Stripe has already refunded it. This refund has been executed by Stripe and you have not been charged." This explains why live Stripe CLI still shows `latest_charge.amount_refunded = 0`, `latest_charge.refunded = false`, no merchant refund objects, and no invoice credit notes: the refund is hidden/Stripe-funded rather than debited from the ResumeLM Stripe balance. No additional merchant refund should be attempted for this payment unless Stripe Support says otherwise.
- **Duplicate Checkout creation prevention is locally implemented and verified.** The checkout server action now rejects arbitrary price IDs, checks live Stripe subscriptions for the customer and Pro price before creating Checkout, sends users with active/trialing/past_due/unpaid/incomplete Stripe subscriptions to the billing portal, reuses matching open Checkout sessions, and creates new Checkout sessions with `client_reference_id`, metadata, subscription metadata, and a stable idempotency key. Verification passed on May 3, 2026: checkout guard tests plus existing subscription tests passed (`22` tests), `pnpm exec tsc --noEmit --pretty false` passed, `pnpm lint` passed, and `pnpm build` passed. Note: `pnpm exec tsx` is not available as a direct package binary in this workspace, so the focused test run used the installed transitive `tsx` CLI path.
- **Production price note:** The deployed `resumelm.ca` client bundle contains live price id `price_1QckQwCv6RlaQFiMVN24pn3M`, matching the four live Stripe active/trialing subscriptions. Local `.env.local` still contains a stale/test-ish value, so do not use local `.env.local` as evidence for live Stripe pricing.
- **Current git note.** The replay documentation update was committed and pushed as `a3cb14e` with `[skip ci]`; Task 2 source was committed and pushed as `9678719`. Local uncommitted changes currently visible in the working tree include unrelated files (`package.json`, `pnpm-lock.yaml`, `AGENTS.md`, `pnpm-workspace.yaml`, `.claude/settings.local.json`) plus the Task 3 reconciliation script, this plan update, and the duplicate Checkout prevention changes.

---

## Highest-Risk Findings

### 1. Stripe webhooks are failing because production schema is missing a table

The webhook route calls Supabase table `public.stripe_webhook_events` before processing relevant Stripe events.

Relevant file:

- `src/app/api/webhooks/stripe/route.ts`

The table exists in:

- `schema.sql`
- `docker/supabase/volumes/db/init/01-app-schema.sql`

The table was not found in production Supabase during the audit. The deployed Helm DB init file also did not include it:

- `helm/resumelm/templates/db-init-configmap.yaml`

Impact:

- `checkout.session.completed` can fail before granting paid access.
- `invoice.paid` can fail before renewing paid access.
- `customer.subscription.deleted` can fail before removing paid access.
- Stripe and Supabase can drift.
- Users may pay without getting access, or keep access after cancellation.

### 2. Stripe subscription state and Supabase entitlement state do not match cleanly

Stripe live showed `2` active paid subscriptions plus `2` trials. Supabase showed `6` `pro:active` records.

Impact:

- The application cannot currently be trusted as the billing source of truth.
- Stripe must be reconciled against Supabase after webhook delivery is fixed.

### 3. Subscription access logic is too permissive

Relevant file:

- `src/lib/subscription-access.ts`

Current logic grants access when a row has a Stripe subscription id and a future `current_period_end`, regardless of whether the app has verified that the subscription is active/trialing and belongs to the intended paid Stripe price.

Impact:

- Non-Pro or stale Stripe data could grant Pro access.
- This was not observed as actively exploited in the aggregate query, but the logic is risky.

### 4. Authenticated users can potentially toggle their own plan

Relevant files:

- `src/utils/actions/stripe/actions.ts`
- `src/components/settings/toggle-plan-button.tsx`

The code contains a server action that can toggle a subscription plan to `pro` or `free`. Any plan override must be admin-only, audited, and ideally absent from the customer-facing bundle.

Impact:

- If reachable or callable, a signed-in user could grant themselves Pro.

### 5. Server-side AI spend is not consistently gated

Relevant files:

- `src/utils/ai-tools.ts`
- `src/app/api/chat/route.ts`
- `src/utils/actions/resumes/ai.ts`
- `src/utils/actions/profiles/ai.ts`
- `src/utils/actions/cover-letter/actions.ts`
- `src/utils/actions/jobs/ai.ts`
- `src/utils/actions/resumes/actions.ts`

Observed problems:

- `/api/chat` rate-limits only Pro users.
- Free users can hit AI endpoints that may use server API keys.
- Slash-style OpenRouter model ids can be routed through the server OpenRouter key.
- Rate limiting is not applied uniformly across AI server actions.
- There is no per-user AI usage ledger.

Impact:

- Your API keys can be charged without a reliable per-user audit trail.
- Abusive or accidental usage can be hard to attribute.

### 6. PostHog is alive but not useful enough for operations

Relevant files:

- `src/components/analytics/posthog-provider.tsx`
- `src/components/analytics/posthog-page-view.tsx`

Observed state:

- PostHog initializes with automatic pageview/pageleave capture.
- `PostHogPageView` exists but did not appear mounted during code search.
- No `identify`.
- No custom lifecycle events for signup, resume creation, AI usage, checkout, subscription status, or cancellation.

Impact:

- PostHog can show that people visit and use the app.
- It cannot answer the important business questions reliably: who signed up, who made resumes, who hit AI, who started checkout, who converted, who churned.

### 7. Waitlist writes likely fail

Relevant file:

- `src/app/auth/login/actions.ts`

The action writes to `mailing-list`. Production Supabase returned a missing relation error for `public.mailing-list` during the audit.

Impact:

- Waitlist capture can silently fail or show errors depending on call path.

---

## Implementation Map

Planned created files:

- `supabase/migrations/20260503022114_create_stripe_webhook_events.sql` - completed production-safe migration for webhook idempotency storage.
- `supabase/migrations/20260503022343_secure_stripe_webhook_events_rls.sql` - completed production-safe migration for RLS hardening on webhook idempotency storage.
- `supabase/migrations/202605030002_create_ai_usage_events.sql` - usage ledger for all server-side AI calls.
- `supabase/migrations/202605030003_create_app_events.sql` - optional server-side operational event ledger for analytics/debugging.
- `src/lib/stripe/subscription-sync.ts` - pure Stripe-to-Supabase subscription mapping and reconciliation helpers.
- `src/lib/stripe/subscription-sync.test.ts` - completed unit tests for Stripe subscription mapping behavior.
- `src/lib/subscription-access.test.ts` - completed unit tests for subscription entitlement behavior.
- `src/lib/ai/access-control.ts` - central model authorization, provider routing, and rate-limit policy.
- `src/lib/ai/access-control.test.ts` - unit tests for Pro/free/BYOK/server-key behavior.
- `src/lib/ai/usage-ledger.ts` - records AI attempts and outcomes.
- `src/lib/analytics/events.ts` - shared event names/properties for PostHog and optional server logs.
- `scripts/audit/reconcile-stripe-subscriptions.ts` - read-only reconciliation report, then optional explicit apply mode.

Planned modified files:

- `helm/resumelm/templates/db-init-configmap.yaml` - completed for webhook idempotency table and RLS hardening; still update again if later schema tasks add new operational tables.
- `schema.sql` - completed for webhook idempotency table and RLS hardening; keep canonical schema aligned as later tasks land.
- `docker/supabase/volumes/db/init/01-app-schema.sql` - completed for webhook idempotency table and RLS hardening; keep local dev schema aligned as later tasks land.
- `src/app/api/webhooks/stripe/route.ts` - handle all relevant events explicitly and use shared sync helper.
- `src/utils/actions/stripe/actions.ts` - remove unsafe plan toggle path, remove invalid `select('id')`, and stop using boolean `isSubscriptionNew` as status meaning.
- `src/lib/subscription-access.ts` - restrict Pro access to verified Pro plan and active/trialing/canceling paid states.
- `src/utils/ai-tools.ts` - delegate authorization to `src/lib/ai/access-control.ts`.
- `src/app/api/chat/route.ts` - apply rate limits and usage logging for all users.
- AI server action files - apply the same central AI guard and usage ledger.
- `src/components/analytics/posthog-provider.tsx` - add identified user support only after privacy-safe user id is available.
- Dashboard or auth layout files - mount route pageview tracking if automatic capture is insufficient for App Router transitions.

---

## Task 1: Repair Stripe Webhook Persistence

> **Progress note, 2026-05-03:** Production Supabase project `gspglrtjrmjymcmabtpq` now has `public.stripe_webhook_events`. Applied through the Supabase migration API as recorded migration `20260503022114_create_stripe_webhook_events`, and added the matching local migration file at `supabase/migrations/20260503022114_create_stripe_webhook_events.sql`. Verification confirmed the table, all expected columns, and the `update_stripe_webhook_events_updated_at` trigger. Supabase then flagged the new public table for disabled RLS, so a second production migration, `20260503022343_secure_stripe_webhook_events_rls`, enabled RLS, revoked `anon`/`authenticated` table access, and granted access to `service_role`; the matching local migration is `supabase/migrations/20260503022343_secure_stripe_webhook_events_rls.sql`. A service-role probe inserted, updated, and deleted a synthetic webhook event successfully after RLS hardening. The canonical schema files and Helm DB init file were updated with the same table and RLS hardening blocks. The repair was committed as `a4ea80d` and pushed to `origin/main`; GitHub Actions succeeded for both `Helm Chart Publish` and `Build and Push Docker Image`. Remaining work in this task: replay failed Stripe webhook deliveries from a logged-in Stripe dashboard session and verify rows appear in `public.stripe_webhook_events`.

> **Replay blocker, 2026-05-03:** The available Browser Use control path was not exposed in this session, and the desktop Arc fallback was not logged into Stripe. No failed Stripe deliveries were replayed by Codex in this pass.

> **Replay verification, 2026-05-03:** After a logged-in Stripe dashboard session was available, Codex replayed the unique failed live `invoice.paid` and `checkout.session.completed` events for webhook destination `https://resumelm.ca/api/webhooks/stripe`. Stripe showed the older failed delivery attempts as recovered, and production Supabase recorded both events with non-null `processed_at`: `evt_1TRt5bCv6RlaQFiMxCrcER9D` (`invoice.paid`) and `evt_1TRt5aCv6RlaQFiMRMu53Riq` (`checkout.session.completed`). A full paginated subscription check showed `2,617` subscription rows with `pro:active = 7`, up from `6` during the audit snapshot. `customer.subscription.created` failed deliveries were intentionally not replayed yet because `src/app/api/webhooks/stripe/route.ts` currently lists that event as relevant but does not handle it in the switch; replaying now would mark those events processed as no-ops and make the later handler fix harder to validate.

**Files:**

- Create: `supabase/migrations/20260503022114_create_stripe_webhook_events.sql`
- Create: `supabase/migrations/20260503022343_secure_stripe_webhook_events_rls.sql`
- Modify: `helm/resumelm/templates/db-init-configmap.yaml`
- Verify: `schema.sql`
- Verify: `docker/supabase/volumes/db/init/01-app-schema.sql`

- [x] ~~**Step 1: Create the migration file**~~

Created `supabase/migrations/20260503022114_create_stripe_webhook_events.sql` with:

```sql
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text NOT NULL,
  event_type text NOT NULL,
  processed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stripe_webhook_events_pkey PRIMARY KEY (event_id)
);

DROP TRIGGER IF EXISTS update_stripe_webhook_events_updated_at ON public.stripe_webhook_events;

CREATE TRIGGER update_stripe_webhook_events_updated_at
BEFORE UPDATE ON public.stripe_webhook_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

- [x] ~~**Step 2: Confirm the trigger function exists before this migration runs**~~

Run:

```bash
rg -n "CREATE OR REPLACE FUNCTION update_updated_at_column|CREATE FUNCTION update_updated_at_column" schema.sql docker helm supabase
```

Expected:

- At least one canonical schema file defines `update_updated_at_column`.
- If the new `supabase/migrations` folder becomes the source of truth, create a prior migration for the trigger function before applying this migration.

- [x] ~~**Step 3: Add the same table block to Helm DB init**~~

Modify `helm/resumelm/templates/db-init-configmap.yaml` so a newly deployed database includes the same `stripe_webhook_events` table and trigger.

Use the exact SQL block from Step 1, plus the RLS hardening block from the 2026-05-03 progress note, inside the init SQL section after the `subscriptions` table and before jobs/resumes tables.

- [x] ~~**Step 4: Apply the migration to production Supabase**~~

Use the Supabase dashboard SQL editor or Supabase CLI connected to the production project. Before applying, run:

```sql
SELECT to_regclass('public.stripe_webhook_events') AS table_exists;
```

Expected before fix:

```text
table_exists
------------
null
```

Applied the migration SQL from Step 1 to production Supabase using the Supabase migration API. Supabase recorded it as:

```text
20260503022114_create_stripe_webhook_events
```

- [x] ~~**Step 5: Verify production table exists**~~

Run:

```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'stripe_webhook_events'
ORDER BY ordinal_position;
```

Expected:

- `event_id text NO`
- `event_type text NO`
- `processed_at timestamp with time zone YES`
- `created_at timestamp with time zone NO`
- `updated_at timestamp with time zone NO`

- [x] ~~**Step 6a: Replay handled failed Stripe webhook events after the table exists**~~

In the Stripe dashboard, open the webhook destination `https://resumelm.ca/api/webhooks/stripe` and resend failed deliveries for:

- `checkout.session.completed`
- `invoice.paid`

Expected:

- Delivery status becomes recovered / latest delivery is `200`.
- New rows appear in `public.stripe_webhook_events`.
- `processed_at` is non-null for successfully processed relevant events.

Observed:

- `evt_1TRt5aCv6RlaQFiMRMu53Riq` (`checkout.session.completed`) processed at `2026-05-03T03:52:22.628+00:00`.
- `evt_1TRt5bCv6RlaQFiMxCrcER9D` (`invoice.paid`) processed at `2026-05-03T03:51:32.983+00:00`.
- Older red rows in Stripe were repeated delivery attempts for these same event IDs and showed as recovered after replay.

- [ ] **Step 6b: Replay subscription lifecycle events only after Task 2 fixes explicit handling**

Deferred event types:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Expected:

- Delivery status becomes `200`.
- New rows appear in `public.stripe_webhook_events`.
- `processed_at` is non-null for successfully processed relevant events.

Important:

- Do not replay `customer.subscription.created` before `src/app/api/webhooks/stripe/route.ts` handles it explicitly.
- The current route includes `customer.subscription.created` in `relevantEvents`, but the switch has no case for it, so replaying it now would store the event as processed without syncing subscription state.

- [x] ~~**Step 7: Commit**~~

```bash
git add supabase/migrations/20260503022114_create_stripe_webhook_events.sql supabase/migrations/20260503022343_secure_stripe_webhook_events_rls.sql helm/resumelm/templates/db-init-configmap.yaml
git commit -m "fix: add Stripe webhook idempotency table"
```

---

## Task 2: Fix Stripe Event Handling and Subscription Sync

> **Progress note, 2026-05-03:** Local implementation is complete and verified. The immediate blocker, `customer.subscription.created`, now has an explicit handler and uses the same sync path as `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`, and `invoice.paid`. The shared mapper lives in `src/lib/stripe/subscription-sync.ts`; access-state regression coverage lives in `src/lib/subscription-access.test.ts`. Vitest was not installed in this repo, so dependency-free Node tests were used instead. Focused tests passed with `7` tests, and `pnpm lint`, `pnpm exec tsc --noEmit --pretty false`, and `pnpm build` passed.

**Files:**

- Create: `src/lib/stripe/subscription-sync.ts`
- Create: `src/lib/stripe/subscription-sync.test.ts`
- Create: `src/lib/subscription-access.test.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts`
- Modify: `src/utils/actions/stripe/actions.ts`
- Modify: `src/lib/subscription-access.ts`

- [x] **Step 1: Add unit tests for Stripe status mapping**

Create `src/lib/stripe/subscription-sync.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mapStripeSubscriptionToAppSubscription } from "./subscription-sync";

describe("mapStripeSubscriptionToAppSubscription", () => {
  const proPriceId = "price_pro";

  it("maps active Pro subscriptions to active Pro", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    expect(result.subscription_plan).toBe("pro");
    expect(result.subscription_status).toBe("active");
  });

  it("maps trialing Pro subscriptions to active Pro", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "trialing",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: new Date("2026-05-10T00:00:00Z"),
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    expect(result.subscription_plan).toBe("pro");
    expect(result.subscription_status).toBe("active");
  });

  it("maps non-Pro prices to free even when Stripe is active", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: "price_other",
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: false,
      proPriceId,
    });

    expect(result.subscription_plan).toBe("free");
    expect(result.subscription_status).toBe("canceled");
  });

  it("keeps cancel-at-period-end users as canceled with period end preserved", () => {
    const result = mapStripeSubscriptionToAppSubscription({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      priceId: proPriceId,
      stripeStatus: "active",
      currentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      trialEnd: null,
      cancelAtPeriodEnd: true,
      proPriceId,
    });

    expect(result.subscription_plan).toBe("pro");
    expect(result.subscription_status).toBe("canceled");
    expect(result.current_period_end).toBe("2026-06-01T00:00:00.000Z");
  });
});
```

- [x] **Step 2: Add the mapping helper**

Create `src/lib/stripe/subscription-sync.ts`:

```ts
import type { Subscription } from "@/lib/types";

type SupportedStripeStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

interface MapStripeSubscriptionInput {
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  stripeStatus: SupportedStripeStatus;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  proPriceId: string;
}

export function mapStripeSubscriptionToAppSubscription(
  input: MapStripeSubscriptionInput
): Partial<Subscription> {
  const isKnownProPrice = input.priceId === input.proPriceId;
  const isActiveLike =
    input.stripeStatus === "active" || input.stripeStatus === "trialing";
  const shouldHaveProPlan = isKnownProPrice && isActiveLike;

  return {
    user_id: input.userId,
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId,
    subscription_plan: shouldHaveProPlan ? "pro" : "free",
    subscription_status:
      shouldHaveProPlan && !input.cancelAtPeriodEnd ? "active" : "canceled",
    current_period_end: input.currentPeriodEnd?.toISOString() ?? null,
    trial_end: input.trialEnd?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };
}
```

- [x] **Step 3: Run tests and confirm the test runner exists**

Run:

```bash
pnpm exec vitest run src/lib/stripe/subscription-sync.test.ts
```

Expected:

- If Vitest is installed, tests pass after Step 2.
- If Vitest is not installed, install or use the repo's existing test runner before adding more tests. Do not skip subscription mapping tests.

Actual:

- Vitest was not installed.
- Used Node's built-in `node:test` runner with a temporary TypeScript compile config.
- `node --test /tmp/resumelm-node-tests/lib/stripe/subscription-sync.test.js /tmp/resumelm-node-tests/lib/subscription-access.test.js` passed: `7` tests, `0` failures.

- [x] **Step 4: Handle `customer.subscription.created` explicitly**

Modify `src/app/api/webhooks/stripe/route.ts` so `customer.subscription.created` is not merely in `relevantEvents`; it must have its own switch case.

Expected behavior:

- For `customer.subscription.created`, retrieve or use the subscription object.
- Map and upsert using the same helper path as `customer.subscription.updated`.
- Mark the webhook event processed only after the database update succeeds.

- [x] **Step 5: Stop selecting a non-existent `subscriptions.id` column**

Modify `src/utils/actions/stripe/actions.ts`.

Replace the `select('id')` existence check in `manageSubscriptionStatusChange` with one of these patterns:

```ts
const { error } = await supabase
  .from("subscriptions")
  .upsert(
    {
      ...subscriptionData,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: false,
    }
  );

if (error) {
  throw error;
}
```

Expected:

- The function no longer depends on a column absent from the visible schema.
- Upsert handles both existing and new subscription rows.

- [x] **Step 6: Tighten `getSubscriptionAccessState`**

Modify `src/lib/subscription-access.ts` so Pro access requires a Pro plan plus a valid active/trialing/canceling access window.

Minimum intended logic:

```ts
const isActivePro = plan === "pro" && status === "active";
const isCancelingPro = plan === "pro" && status === "canceled" && isWithinAccessWindow;
const isTrialingPro = plan === "pro" && isTrialing;

const hasProAccess = isActivePro || isCancelingPro || isTrialingPro;
```

Expected:

- A random `stripe_subscription_id` with a future period end does not grant Pro by itself.
- Free plans never become Pro solely because Stripe fields exist.

- [x] **Step 7: Run verification**

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Expected:

- All commands pass.

Actual:

- `pnpm lint` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed.

- [x] **Step 8: Commit**

```bash
git add src/lib/stripe/subscription-sync.ts src/lib/stripe/subscription-sync.test.ts src/app/api/webhooks/stripe/route.ts src/utils/actions/stripe/actions.ts src/lib/subscription-access.ts
git commit -m "fix: make Stripe subscription sync deterministic"
```

Actual:

- Committed with the intended Task 2 source files plus this plan update.

---

## Task 3: Reconcile Stripe and Supabase

> **Progress note, 2026-05-03:** Created `scripts/audit/reconcile-stripe-subscriptions.ts` and verified it with `pnpm exec tsc --noEmit --pretty false`. Because local `.env.local` has a test Stripe secret and the Stripe CLI stores a non-SDK-usable restricted live credential, the script now supports `--stripe-snapshot` so a live Stripe CLI JSON export can be used as the exact audit input. Read-only reports were saved under `tmp/audits/` and are intentionally not committed.
>
> **Production repair, 2026-05-03:** Live Stripe showed `4` active/trialing subscriptions on `price_1QckQwCv6RlaQFiMVN24pn3M`: two active subscriptions for user `3211e896...544f`, one trialing subscription for user `63304db8...03a8`, and one trialing subscription for user `ab9b4e12...6848`. Supabase had `7` `pro:active` rows before repair: one valid live trial, two under-entitled live Stripe users still marked free, and six stale/manual Pro grants. Codex explicitly repaired Supabase by granting Pro to users `3211e896...544f` and `ab9b4e12...6848`, and downgrading six stale/manual `pro:active` rows to free.
>
> **Verification, 2026-05-03:** Re-running the read-only reconciliation after repair showed `stripe active/trialing = 4`, `supabase pro:active = 3`, `active/trialing Stripe subscriptions missing or wrong in Supabase = 0`, `stale Supabase pro:active rows = 0`, and `active/trialing Stripe customers missing metadata.supabaseUUID = 0`. The report still flags `1` duplicate active/trialing Stripe user because one customer has two active paid subscriptions; that is a Stripe billing cleanup item, not an app entitlement-cache mismatch.

**Files:**

- Create: `scripts/audit/reconcile-stripe-subscriptions.ts`

- [x] **Step 1: Create a read-only reconciliation script**

Create `scripts/audit/reconcile-stripe-subscriptions.ts` with behavior:

- Read Stripe live subscriptions using `STRIPE_SECRET_KEY`, or read a reviewed Stripe CLI export with `--stripe-snapshot`.
- Read Supabase `subscriptions` using `SUPABASE_SERVICE_ROLE_KEY`.
- Match rows by `stripe_subscription_id` and `stripe_customer_id`.
- Print aggregate counts.
- Print masked mismatches only. Mask emails and customer names.
- Default to read-only.
- Require `--apply` for any write mode.

The script should report:

- Stripe active/trialing subscriptions missing in Supabase.
- Supabase `pro:active` rows missing in Stripe.
- Supabase active rows whose Stripe status is canceled/unpaid/incomplete.
- Stripe active/trialing rows whose Supabase row is `free` or `canceled`.
- Stripe customers without `metadata.supabaseUUID`.

- [x] **Step 2: Run in read-only mode**

Run:

```bash
pnpm tsx scripts/audit/reconcile-stripe-subscriptions.ts
```

Expected:

- No database writes.
- No full emails printed.
- Summary shows the exact mismatch count.

Actual:

- This repo does not currently include `tsx`; verified the script through `pnpm exec tsc --noEmit --pretty false`, compiled it to `/tmp/resumelm-audit-js`, and ran it with a live Stripe CLI snapshot.
- Before repair, the report showed `3` active/trialing Stripe subscriptions missing or wrong in Supabase and `6` stale Supabase `pro:active` rows.

- [x] **Step 3: Save the report outside source control**

Run:

```bash
mkdir -p tmp/audits
pnpm tsx scripts/audit/reconcile-stripe-subscriptions.ts > tmp/audits/stripe-reconciliation-2026-05-03.txt
```

Expected:

- Report exists locally.
- Do not commit `tmp/audits`.

Actual:

- Saved `tmp/audits/stripe-reconciliation-2026-05-03.txt`.
- Saved post-repair verification as `tmp/audits/stripe-reconciliation-2026-05-03-after-repair.txt`.

- [x] **Step 4: Manually inspect high-risk mismatches**

For each mismatch:

- Check the Stripe subscription status.
- Check `current_period_end`.
- Check whether `metadata.supabaseUUID` exists.
- Check the Supabase `user_id` row.
- Decide whether the DB should be corrected by replaying Stripe events or by explicit admin repair.

Actual:

- Confirmed all four active/trialing Stripe subscriptions had `metadata.supabaseUUID`.
- Confirmed two live Stripe users were under-entitled in Supabase.
- Confirmed six Supabase `pro:active` rows were stale/manual and not backed by a live active/trialing Stripe subscription.
- Confirmed one customer has two active paid subscriptions, so the Stripe subscription count is not the same thing as distinct entitled user count.

- [x] **Step 5: Apply corrections only after webhook replay works**

Use replayed Stripe events as the preferred correction path. Use manual repair only for records that cannot be recovered from Stripe events.

Expected:

- Stripe live active/trialing count matches app Pro access count after correction.

Actual:

- Applied explicit Supabase admin repair because the stale rows were historical cache drift and one live user had duplicate Stripe subscriptions that cannot be represented one-to-one in the current `subscriptions` table.
- After correction, app Pro access count is `3` distinct users, which matches the distinct live Stripe active/trialing users.
- Stripe still has `4` active/trialing subscriptions because one user has two active subscriptions. Decide whether to cancel and/or refund the duplicate older subscription in Stripe.

- [ ] **Step 6: Commit script only**

```bash
git add scripts/audit/reconcile-stripe-subscriptions.ts
git commit -m "chore: add Stripe subscription reconciliation script"
```

---

## Task 4: Remove Unsafe Manual Plan Toggle

**Files:**

- Modify: `src/utils/actions/stripe/actions.ts`
- Modify or delete: `src/components/settings/toggle-plan-button.tsx`
- Search: all imports/usages of `toggleSubscriptionPlan`

- [ ] **Step 1: Find all call sites**

Run:

```bash
rg -n "toggleSubscriptionPlan|TogglePlanButton|toggle-plan" src
```

Expected:

- A complete list of server action and UI usage.

- [ ] **Step 2: Remove public/manual plan toggle behavior**

Preferred change:

- Delete the exported `toggleSubscriptionPlan` server action.
- Remove the customer-facing component if it is mounted anywhere.

If a manual override is still needed for support, replace it with an admin-only action that verifies a hard-coded admin allowlist or role loaded from the server environment.

Admin-only check shape:

```ts
function requireAdminUser(userId: string): void {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!adminIds.includes(userId)) {
    throw new Error("Admin access required");
  }
}
```

Expected:

- Regular authenticated users cannot call any action that changes their own plan without Stripe.

- [ ] **Step 3: Run verification**

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Expected:

- All commands pass.

- [ ] **Step 4: Commit**

```bash
git add src/utils/actions/stripe/actions.ts src/components/settings/toggle-plan-button.tsx
git commit -m "fix: remove unsafe subscription plan toggle"
```

---

## Task 5: Centralize AI Access Control and Spend Logging

**Files:**

- Create: `supabase/migrations/202605030002_create_ai_usage_events.sql`
- Create: `src/lib/ai/access-control.ts`
- Create: `src/lib/ai/access-control.test.ts`
- Create: `src/lib/ai/usage-ledger.ts`
- Modify: `src/utils/ai-tools.ts`
- Modify: `src/app/api/chat/route.ts`
- Modify: AI server action files

- [ ] **Step 1: Create AI usage table migration**

Create `supabase/migrations/202605030002_create_ai_usage_events.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  route text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  is_pro boolean NOT NULL DEFAULT false,
  used_server_key boolean NOT NULL DEFAULT false,
  status text NOT NULL CHECK (status IN ('started', 'succeeded', 'failed', 'rate_limited', 'blocked')),
  error_code text NULL,
  input_tokens integer NULL,
  output_tokens integer NULL,
  total_tokens integer NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ai_usage_events_pkey PRIMARY KEY (id),
  CONSTRAINT ai_usage_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ai_usage_events_user_created_idx
ON public.ai_usage_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_usage_events_route_created_idx
ON public.ai_usage_events (route, created_at DESC);
```

- [ ] **Step 2: Write AI access-control tests**

Create tests that prove:

- Free users can use only explicitly free server-key models.
- Free users cannot force arbitrary slash-style OpenRouter models onto the server key.
- Pro users can use configured server-key Pro models.
- BYOK users can use their own key only for the matching provider.
- Unknown models are rejected.
- Every allowed server-key call reports `usedServerKey = true`.

- [ ] **Step 3: Implement `src/lib/ai/access-control.ts`**

The exported function should accept:

```ts
interface ResolveAIRequestInput {
  requestedModel: string;
  apiKeys: Array<{ service: string; key: string }>;
  isPro: boolean;
}
```

It should return:

```ts
interface ResolvedAIRequest {
  providerId: string;
  modelId: string;
  apiKey: string;
  usedServerKey: boolean;
  requiresRateLimit: boolean;
}
```

Rules:

- Reject unknown models.
- Server keys are allowed for Pro users when the configured provider env key exists.
- Server keys are allowed for free users only when the model metadata explicitly says `features.isFree === true` and `availability.requiresPro === false`.
- `resolvedModelId.includes("/")` must not be enough to use the server OpenRouter key.
- User-provided keys are allowed only when the provider matches the requested model.

- [ ] **Step 4: Refactor `initializeAIClient` to consume resolved policy**

Modify `src/utils/ai-tools.ts` so `initializeAIClient` does not make authorization decisions. It should receive an already-resolved provider/model/key decision or delegate to the access-control helper.

Expected:

- One place decides whether a server key can be used.
- One place decides whether a user key is required.

- [ ] **Step 5: Apply rate limiting to every AI route/action**

Every server path that can call a model must call the same guard before model invocation.

Update:

- `src/app/api/chat/route.ts`
- `src/utils/actions/resumes/ai.ts`
- `src/utils/actions/profiles/ai.ts`
- `src/utils/actions/cover-letter/actions.ts`
- `src/utils/actions/jobs/ai.ts`
- `src/utils/actions/resumes/actions.ts`

Expected:

- Free users are rate-limited when using any server-key model.
- Pro users are rate-limited according to the existing policy or a stricter Pro policy.
- BYOK calls are still logged; decide whether to rate-limit BYOK separately.

- [ ] **Step 6: Record AI usage attempts**

Create `src/lib/ai/usage-ledger.ts` with functions:

```ts
export async function recordAIUsageStarted(input: {
  userId: string;
  route: string;
  provider: string;
  model: string;
  isPro: boolean;
  usedServerKey: boolean;
}): Promise<string> {
  // Insert status = "started" and return id.
}

export async function recordAIUsageFinished(input: {
  id: string;
  status: "succeeded" | "failed" | "rate_limited" | "blocked";
  errorCode?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): Promise<void> {
  // Update the existing row.
}
```

Expected:

- Each AI attempt has one row.
- Failed and blocked attempts are visible.
- No prompts or resume content are stored in this table.

- [ ] **Step 7: Run verification**

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Expected:

- All commands pass.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/202605030002_create_ai_usage_events.sql src/lib/ai/access-control.ts src/lib/ai/access-control.test.ts src/lib/ai/usage-ledger.ts src/utils/ai-tools.ts src/app/api/chat/route.ts src/utils/actions/resumes/ai.ts src/utils/actions/profiles/ai.ts src/utils/actions/cover-letter/actions.ts src/utils/actions/jobs/ai.ts src/utils/actions/resumes/actions.ts
git commit -m "fix: centralize AI access control and usage logging"
```

---

## Task 6: Add Product and Billing Analytics

**Files:**

- Create: `src/lib/analytics/events.ts`
- Modify: `src/components/analytics/posthog-provider.tsx`
- Modify: dashboard/auth/subscription flows where events occur

- [ ] **Step 1: Define event names**

Create `src/lib/analytics/events.ts`:

```ts
export const AnalyticsEvents = {
  SignupCompleted: "signup_completed",
  ProfileCreated: "profile_created",
  ResumeCreated: "resume_created",
  ResumeTailored: "resume_tailored",
  AIRequestStarted: "ai_request_started",
  AIRequestSucceeded: "ai_request_succeeded",
  AIRequestFailed: "ai_request_failed",
  CheckoutStarted: "checkout_started",
  CheckoutCompleted: "checkout_completed",
  SubscriptionActivated: "subscription_activated",
  SubscriptionCanceled: "subscription_canceled",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
```

- [ ] **Step 2: Identify users in PostHog after auth**

Use a stable non-email user id:

```ts
posthog.identify(user.id, {
  subscription_plan: subscriptionPlan,
});
```

Do not send full resume text, job descriptions, API keys, or raw customer emails to PostHog.

- [ ] **Step 3: Capture client-side events**

Capture:

- `checkout_started` when embedded checkout starts.
- `resume_created` when a resume creation action succeeds.
- `resume_tailored` when a tailored resume succeeds.
- `profile_created` when the profile is first completed.

Expected event properties:

- `plan`
- `resume_type`
- `has_job`
- `is_pro`

Do not include resume content or job description content.

- [ ] **Step 4: Capture server-side billing events after webhook success**

After webhook DB update succeeds, capture:

- `checkout_completed`
- `subscription_activated`
- `subscription_canceled`

Expected event properties:

- `stripe_subscription_id`
- `subscription_status`
- `subscription_plan`
- `current_period_end`

Do not include card details, full email, or billing address.

- [ ] **Step 5: Build a PostHog dashboard**

Create cards for:

- Signups per day
- Profile completion rate
- Resume created per signup
- Tailored resume created per signup
- Checkout started
- Checkout completed
- Subscription activated
- AI requests by provider/model
- AI failures by route
- Week 1 retention for users who created a resume

- [ ] **Step 6: Validate analytics manually**

Use a test account and confirm the event sequence:

```text
signup_completed
profile_created
resume_created
ai_request_started
ai_request_succeeded
checkout_started
checkout_completed
subscription_activated
```

Expected:

- Events appear under one PostHog distinct id.
- No sensitive content appears in event properties.

- [ ] **Step 7: Commit**

```bash
git add src/lib/analytics/events.ts src/components/analytics/posthog-provider.tsx
git commit -m "feat: add product and billing analytics events"
```

---

## Task 7: Fix Waitlist Schema or Remove Waitlist Path

**Files:**

- Modify: `src/app/auth/login/actions.ts`
- Optional create: `supabase/migrations/202605030004_create_mailing_list.sql`

- [ ] **Step 1: Decide whether waitlist is still a real feature**

Search for all uses:

```bash
rg -n "mailing-list|waitlist|joinWaitlist" src
```

Expected:

- Either the waitlist is still visible to users, or the dead path can be removed.

- [ ] **Step 2A: If waitlist is real, create the missing table**

Create `supabase/migrations/202605030004_create_mailing_list.sql`:

```sql
CREATE TABLE IF NOT EXISTS public."mailing-list" (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  source text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT mailing_list_pkey PRIMARY KEY (id),
  CONSTRAINT mailing_list_email_unique UNIQUE (email)
);
```

Then apply it in production and verify:

```sql
SELECT to_regclass('public."mailing-list"') AS table_exists;
```

Expected:

```text
table_exists
----------------------
"mailing-list"
```

- [ ] **Step 2B: If waitlist is not real, remove the action and UI**

Remove `joinWaitlist` and any UI that calls it.

Expected:

- No code writes to a missing table.

- [ ] **Step 3: Run verification**

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Expected:

- All commands pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/login/actions.ts supabase/migrations/202605030004_create_mailing_list.sql
git commit -m "fix: align waitlist storage with production schema"
```

---

## Task 8: Separate Local, Test, and Production Environments

**Files:**

- Modify: `.env.example` if present
- Modify: `README.md`
- Optional create: `docs/operations/environments.md`

- [ ] **Step 1: Document environment modes**

Create or update docs with three explicit modes:

- Local development with Supabase local and Stripe test.
- Staging with Supabase staging and Stripe test.
- Production with Supabase production and Stripe live.

Required warning:

```text
Do not point local development at production Supabase while using Stripe test keys unless the task is a deliberate read-only audit. Mixed modes can create subscription records that cannot be reconciled from one Stripe dashboard.
```

- [ ] **Step 2: Document required production secrets**

List:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

- [ ] **Step 3: Add a startup safety check**

Add a server-only helper that warns or throws if production Supabase URL is paired with a test Stripe key outside audit scripts.

Expected:

- Production deploy still boots.
- Local mixed-mode mistakes become visible.

- [ ] **Step 4: Run verification**

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Expected:

- All commands pass.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/operations/environments.md
git commit -m "docs: document environment safety boundaries"
```

---

## Recovery Order

Do these in order:

1. Task 1: Repair Stripe webhook persistence.
2. Replay failed Stripe events.
3. Task 2: Fix event handling and access logic.
4. Task 3: Reconcile Stripe and Supabase.
5. Task 4: Remove unsafe manual plan toggle.
6. Task 5: Centralize AI access control and usage logging.
7. Task 6: Add analytics events and dashboards.
8. Task 7: Fix or remove waitlist.
9. Task 8: Separate environments.

Reasoning:

- Billing repair comes first because it affects real customers and revenue.
- Entitlement logic comes second because users may currently have incorrect access.
- Reconciliation comes after the webhook fix because replaying Stripe events is cleaner than manual database edits.
- AI spend controls come before growth/analytics polish because unmanaged server-key use can cost money.
- PostHog event work comes after the core state machines are correct, so analytics describe reality.

---

## Production Runbook After Fixes

After Tasks 1-5 are complete:

- [ ] Open Stripe webhook destination and confirm no recent failed deliveries for subscription events.
- [ ] Query `public.stripe_webhook_events` and confirm new relevant events have non-null `processed_at`.
- [ ] Run the reconciliation script in read-only mode.
- [ ] Confirm Stripe active/trialing subscriptions match app Pro access count.
- [ ] Confirm a newly paid test checkout grants Pro access.
- [ ] Confirm a canceled subscription loses access after the access window ends.
- [ ] Confirm a free user cannot select a paid OpenRouter model that uses the server key.
- [ ] Confirm all AI server-key attempts create rows in `ai_usage_events`.
- [ ] Confirm PostHog shows the checkout and subscription lifecycle events without sensitive content.

---

## Open Questions To Resolve Before Shipping Changes

- Which environment is the canonical production deploy using: Helm, Vercel, another host, or multiple deploy paths?
- Should cancel-at-period-end users keep Pro access until `current_period_end`? The current UX appears to intend yes.
- Should free users receive any server-paid AI usage, or should all free usage be BYOK-only?
- What is the intended monthly AI budget per free user and per Pro user?
- Should admin/support overrides exist at all, or should every paid entitlement come only from Stripe?
- Is the waitlist still product-facing?

---

## Verification Baseline

Before beginning implementation, run:

```bash
git status --short
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Known baseline from audit:

- `package.json` and `pnpm-lock.yaml` were already modified before this plan.
- `AGENTS.md` and `pnpm-workspace.yaml` were untracked before this plan.
- Lint, TypeScript, and production build passed before this plan.

Do not revert unrelated user changes while implementing this plan.
