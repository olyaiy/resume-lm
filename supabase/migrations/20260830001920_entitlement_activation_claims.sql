CREATE TABLE IF NOT EXISTS public.stripe_entitlement_activations (
  stripe_subscription_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_activated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.stripe_entitlement_activations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stripe_entitlement_activations FROM anon, authenticated;
GRANT ALL ON TABLE public.stripe_entitlement_activations TO service_role;

COMMENT ON TABLE public.stripe_entitlement_activations IS
  'One service-owned entitlement activation claim per Stripe subscription lifecycle.';
