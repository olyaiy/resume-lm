-- Track webhook attempts and operational failures without changing entitlement data.
ALTER TABLE public.stripe_webhook_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS event_created_at timestamp with time zone;

UPDATE public.stripe_webhook_events
SET
  status = CASE WHEN processed_at IS NULL THEN 'failed' ELSE 'processed' END,
  last_attempt_at = COALESCE(last_attempt_at, updated_at),
  event_created_at = COALESCE(event_created_at, created_at)
WHERE status = 'processing';

ALTER TABLE public.stripe_webhook_events
  DROP CONSTRAINT IF EXISTS stripe_webhook_events_status_check;

ALTER TABLE public.stripe_webhook_events
  ADD CONSTRAINT stripe_webhook_events_status_check
  CHECK (status = ANY (ARRAY['processing'::text, 'processed'::text, 'failed'::text]));

ALTER TABLE public.stripe_webhook_events
  DROP CONSTRAINT IF EXISTS stripe_webhook_events_attempt_count_nonnegative;

ALTER TABLE public.stripe_webhook_events
  ADD CONSTRAINT stripe_webhook_events_attempt_count_nonnegative
  CHECK (attempt_count > 0);

CREATE INDEX IF NOT EXISTS stripe_webhook_events_retry_idx
  ON public.stripe_webhook_events (status, last_attempt_at);

CREATE TABLE IF NOT EXISTS public.billing_alerts (
  alert_key text NOT NULL,
  alert_type text NOT NULL,
  severity text NOT NULL,
  stripe_subscription_id text NULL,
  stripe_customer_id text NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurrence_count integer NOT NULL DEFAULT 1,
  first_seen_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_seen_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_notified_at timestamp with time zone NULL,
  resolved_at timestamp with time zone NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT billing_alerts_pkey PRIMARY KEY (alert_key),
  CONSTRAINT billing_alerts_type_check CHECK (
    alert_type = ANY (ARRAY[
      'payment_failed'::text,
      'billing_state_mismatch'::text,
      'mapping_missing'::text,
      'webhook_processing_failed'::text
    ])
  ),
  CONSTRAINT billing_alerts_severity_check CHECK (
    severity = ANY (ARRAY['warning'::text, 'critical'::text])
  ),
  CONSTRAINT billing_alerts_occurrence_count_positive CHECK (occurrence_count > 0)
);

DROP TRIGGER IF EXISTS update_billing_alerts_updated_at ON public.billing_alerts;

CREATE TRIGGER update_billing_alerts_updated_at
BEFORE UPDATE ON public.billing_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS billing_alerts_open_idx
  ON public.billing_alerts (resolved_at, severity, last_seen_at);

ALTER TABLE public.billing_alerts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.billing_alerts FROM anon, authenticated;
GRANT ALL ON TABLE public.billing_alerts TO service_role;

COMMENT ON TABLE public.billing_alerts IS
  'Deduplicated Stripe/Supabase billing alerts for operational monitoring.';
