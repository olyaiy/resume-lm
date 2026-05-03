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

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.ai_usage_events FROM anon, authenticated;
GRANT ALL ON TABLE public.ai_usage_events TO service_role;
