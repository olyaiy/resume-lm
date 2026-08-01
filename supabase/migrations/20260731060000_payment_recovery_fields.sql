ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_failure_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_failed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS next_payment_attempt_at timestamp with time zone;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_payment_failure_count_nonnegative;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_payment_failure_count_nonnegative
  CHECK (payment_failure_count >= 0);

COMMENT ON COLUMN public.subscriptions.payment_failure_count IS
  'Number of attempts recorded for the current failed-invoice recovery cycle.';

COMMENT ON COLUMN public.subscriptions.last_payment_failed_at IS
  'Timestamp of the most recent failed subscription invoice payment.';

COMMENT ON COLUMN public.subscriptions.next_payment_attempt_at IS
  'Stripe scheduled retry time, when Stripe provides one.';
