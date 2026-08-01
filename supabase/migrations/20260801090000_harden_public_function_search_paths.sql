-- Keep SECURITY DEFINER and shared helper functions on an explicit search path.
-- This prevents caller-controlled schemas from changing object resolution.
ALTER FUNCTION public.get_profiles_for_users(uuid[])
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_subscriptions_for_users(uuid[])
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_resume_counts_for_users(uuid[])
  SET search_path = public, pg_temp;

ALTER FUNCTION public.count_resumes_by_user(uuid[])
  SET search_path = public, pg_temp;

ALTER FUNCTION public.count_total_resumes()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.count_total_users()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_set_timestamp()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.handle_new_user()
  SET search_path = public, pg_temp;

-- This function is SECURITY DEFINER and should only be callable by the auth
-- service if a deployment uses it as an auth hook. It must not be public.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END
$$;
