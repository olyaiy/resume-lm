-- Preserve a Pro entitlement while Stripe is retrying a failed invoice.
-- The application maps Stripe's past_due state directly into this column.

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_subscription_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_subscription_status_check CHECK (
    subscription_status IS NULL
    OR subscription_status = ANY (
      ARRAY['active'::text, 'past_due'::text, 'canceled'::text]
    )
  );
