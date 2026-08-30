CREATE INDEX IF NOT EXISTS stripe_entitlement_activations_user_id_idx
  ON public.stripe_entitlement_activations (user_id);
