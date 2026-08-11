-- Speed up the authenticated list and ownership queries used by the
-- dashboard, jobs page, and resume editor.
CREATE INDEX IF NOT EXISTS jobs_user_id_active_created_at_idx
  ON public.jobs (user_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS resumes_user_id_created_at_idx
  ON public.resumes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS resumes_job_id_idx
  ON public.resumes (job_id);

-- These tables contain user-owned data. The old policies were scoped to the
-- public role, duplicated in places, and evaluated auth.uid() per row.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_policy ON public.profiles;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS jobs_policy ON public.jobs;

CREATE POLICY jobs_select_own
  ON public.jobs FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY jobs_insert_own
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY jobs_update_own
  ON public.jobs FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY jobs_delete_own
  ON public.jobs FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can read own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS resumes_policy ON public.resumes;

CREATE POLICY resumes_select_own
  ON public.resumes FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY resumes_insert_own
  ON public.resumes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY resumes_update_own
  ON public.resumes FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY resumes_delete_own
  ON public.resumes FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_policy ON public.subscriptions;

CREATE POLICY subscriptions_service_role_manage
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY subscriptions_select_own
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- No anonymous client needs access to these private tables. RLS is the row
-- boundary; revoking the table grant makes the boundary explicit as well.
REVOKE ALL ON TABLE public.profiles, public.jobs, public.resumes, public.subscriptions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles, public.jobs, public.resumes TO authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;
