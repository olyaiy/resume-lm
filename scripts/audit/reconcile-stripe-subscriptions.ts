import Stripe from "stripe";

interface Env {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID?: string;
}

interface SupabaseSubscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_plan: "free" | "pro";
  subscription_status: "active" | "canceled" | null;
  current_period_end: string | null;
  trial_end: string | null;
  updated_at: string | null;
}

interface StripeSnapshot {
  id: string;
  customerId: string;
  supabaseUUID: string | null;
  status: Stripe.Subscription.Status;
  priceId: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const ACTIVE_LIKE = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

function loadDotenv(path = ".env.local"): Env {
  const fs = require("node:fs") as typeof import("node:fs");
  if (!fs.existsSync(path)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => {
        const [, key, value] = match as RegExpMatchArray;
        return [
          key.trim(),
          value.trim().replace(/^['"]|['"]$/g, ""),
        ];
      })
  ) as Env;
}

function getEnv(): Required<Pick<Env, "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "STRIPE_SECRET_KEY">> & Env {
  const fileEnv = loadDotenv();
  const env = { ...fileEnv, ...process.env } as Env;
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
  ] as const;

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`${key} is required`);
    }
  }

  return env as Required<Pick<Env, "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "STRIPE_SECRET_KEY">> & Env;
}

function getArgValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function mask(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 12) return `${value.slice(0, 2)}...`;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function isoFromUnix(value: number | null | undefined): string | null {
  return value ? new Date(value * 1000).toISOString() : null;
}

async function fetchSupabaseSubscriptions(env: ReturnType<typeof getEnv>): Promise<SupabaseSubscription[]> {
  const rows: SupabaseSubscription[] = [];
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams({
      select:
        "user_id,stripe_customer_id,stripe_subscription_id,subscription_plan,subscription_status,current_period_end,trial_end,updated_at",
      order: "updated_at.desc.nullslast",
      offset: String(offset),
      limit: String(pageSize),
    });

    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subscriptions?${params}`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase subscriptions fetch failed: ${response.status} ${await response.text()}`);
    }

    const page = (await response.json()) as SupabaseSubscription[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

async function fetchStripeSubscriptions(stripe: Stripe): Promise<StripeSnapshot[]> {
  const rows: StripeSnapshot[] = [];

  for await (const subscription of stripe.subscriptions.list({
    status: "all",
    limit: 100,
    expand: ["data.customer"],
  })) {
    const customer =
      typeof subscription.customer === "string" ? null : subscription.customer;
    const item = subscription.items.data[0];

    rows.push({
      id: subscription.id,
      customerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      supabaseUUID:
        customer && !("deleted" in customer)
          ? customer.metadata.supabaseUUID ?? null
          : null,
      status: subscription.status,
      priceId: item?.price.id ?? null,
      currentPeriodEnd: isoFromUnix(item?.current_period_end),
      trialEnd: isoFromUnix(subscription.trial_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  return rows;
}

function mapStripeSubscription(subscription: Stripe.Subscription): StripeSnapshot {
  const customer =
    typeof subscription.customer === "string" ? null : subscription.customer;
  const item = subscription.items.data[0];

  return {
    id: subscription.id,
    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    supabaseUUID:
      customer && !("deleted" in customer)
        ? customer.metadata.supabaseUUID ?? null
        : null,
    status: subscription.status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: isoFromUnix(item?.current_period_end),
    trialEnd: isoFromUnix(subscription.trial_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

function readStripeSnapshot(path: string): StripeSnapshot[] {
  const fs = require("node:fs") as typeof import("node:fs");
  const json = JSON.parse(fs.readFileSync(path, "utf8")) as {
    data?: Stripe.Subscription[];
  } | Stripe.Subscription[];
  const subscriptions = Array.isArray(json) ? json : json.data ?? [];
  return subscriptions.map(mapStripeSubscription);
}

function hasFutureDate(value: string | null, now = new Date()): boolean {
  if (!value) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed > now;
}

function printJson(label: string, rows: unknown[]): void {
  console.log(`${label}: ${rows.length}`);
  for (const row of rows) {
    console.log(JSON.stringify(row));
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const stripeSnapshotPath = getArgValue("--stripe-snapshot");
  const env = stripeSnapshotPath
    ? ({ ...loadDotenv(), ...process.env } as Env)
    : getEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const [stripeRows, supabaseRows] = await Promise.all([
    stripeSnapshotPath
      ? Promise.resolve(readStripeSnapshot(stripeSnapshotPath))
      : fetchStripeSubscriptions(
          new Stripe(env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-04-30.basil",
          })
        ),
    fetchSupabaseSubscriptions(env as ReturnType<typeof getEnv>),
  ]);

  const activeStripe = stripeRows.filter((row) => ACTIVE_LIKE.has(row.status));
  const supabaseBySubscriptionId = new Map(
    supabaseRows
      .filter((row) => row.stripe_subscription_id)
      .map((row) => [row.stripe_subscription_id, row])
  );
  const supabaseByUserId = new Map(supabaseRows.map((row) => [row.user_id, row]));
  const stripeActiveIds = new Set(activeStripe.map((row) => row.id));

  const missingOrWrongInSupabase = activeStripe
    .map((stripeRow) => ({
      stripe: stripeRow,
      supabase:
        supabaseBySubscriptionId.get(stripeRow.id) ??
        (stripeRow.supabaseUUID ? supabaseByUserId.get(stripeRow.supabaseUUID) : undefined),
    }))
    .filter(({ stripe: stripeRow, supabase }) => {
      return (
        !stripeRow.supabaseUUID ||
        !supabase ||
        supabase.subscription_plan !== "pro" ||
        supabase.subscription_status !== "active"
      );
    });

  const activeStripeByUserId = new Map<string, StripeSnapshot[]>();
  for (const row of activeStripe) {
    if (!row.supabaseUUID) continue;
    activeStripeByUserId.set(row.supabaseUUID, [
      ...(activeStripeByUserId.get(row.supabaseUUID) ?? []),
      row,
    ]);
  }
  const duplicateActiveStripeUsers = [...activeStripeByUserId.entries()].filter(
    ([, rows]) => rows.length > 1
  );

  const staleActivePro = supabaseRows.filter((row) => {
    return (
      row.subscription_plan === "pro" &&
      row.subscription_status === "active" &&
      (!row.stripe_subscription_id ||
        !stripeActiveIds.has(row.stripe_subscription_id) ||
        !hasFutureDate(row.current_period_end))
    );
  });

  const missingMetadata = activeStripe.filter((row) => !row.supabaseUUID);
  const livePriceIds = [...new Set(activeStripe.map((row) => row.priceId).filter(Boolean))];

  console.log("Stripe/Supabase subscription reconciliation");
  console.log(`mode: ${apply ? "apply" : "read-only"}`);
  console.log(`stripe active/trialing: ${activeStripe.length}`);
  console.log(`stripe active/trialing price ids: ${livePriceIds.join(", ") || "none"}`);
  console.log(`supabase rows: ${supabaseRows.length}`);
  console.log(
    `supabase pro:active: ${
      supabaseRows.filter(
        (row) => row.subscription_plan === "pro" && row.subscription_status === "active"
      ).length
    }`
  );
  console.log("");

  printJson(
    "active/trialing Stripe subscriptions missing or wrong in Supabase",
    missingOrWrongInSupabase.map(({ stripe: stripeRow, supabase }) => ({
      subscription: stripeRow.id,
      customer: mask(stripeRow.customerId),
      user: mask(stripeRow.supabaseUUID),
      stripeStatus: stripeRow.status,
      stripePrice: stripeRow.priceId,
      currentPeriodEnd: stripeRow.currentPeriodEnd,
      supabasePlan: supabase?.subscription_plan ?? null,
      supabaseStatus: supabase?.subscription_status ?? null,
      supabaseSubscription: supabase?.stripe_subscription_id ?? null,
    }))
  );

  printJson(
    "stale Supabase pro:active rows",
    staleActivePro.map((row) => ({
      user: mask(row.user_id),
      customer: mask(row.stripe_customer_id),
      subscription: row.stripe_subscription_id,
      periodEnd: row.current_period_end,
      updatedAt: row.updated_at,
    }))
  );

  printJson(
    "duplicate active/trialing Stripe subscriptions for one Supabase user",
    duplicateActiveStripeUsers.map(([userId, rows]) => ({
      user: mask(userId),
      subscriptions: rows.map((row) => ({
        id: row.id,
        status: row.status,
        customer: mask(row.customerId),
        currentPeriodEnd: row.currentPeriodEnd,
      })),
    }))
  );

  printJson(
    "active/trialing Stripe customers missing metadata.supabaseUUID",
    missingMetadata.map((row) => ({
      subscription: row.id,
      customer: mask(row.customerId),
      status: row.status,
    }))
  );

  if (apply) {
    throw new Error("Apply mode is intentionally not implemented yet; use this report for explicit reviewed repairs.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
