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
