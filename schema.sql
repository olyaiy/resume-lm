-- ResumeLM Database Schema
-- This file contains all the SQL statements needed to set up the ResumeLM database schema
-- Run this against your PostgreSQL database to create all required tables

-- First, ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid NOT NULL,
  stripe_customer_id text NULL,
  stripe_subscription_id text NULL,
  subscription_plan text NULL DEFAULT 'free'::text,
  subscription_status text NULL,
  current_period_end timestamp with time zone NULL,
  trial_end timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (user_id),
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id),
  CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id),
  CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT subscriptions_subscription_plan_check CHECK (
    (
      subscription_plan = ANY (ARRAY['free'::text, 'pro'::text])
    )
  ),
  CONSTRAINT subscriptions_subscription_status_check CHECK (
    (
      (subscription_status IS NULL)
      OR (
        subscription_status = ANY (ARRAY['active'::text, 'canceled'::text])
      )
    )
  )
) TABLESPACE pg_default;

-- Create updated_at trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE
UPDATE ON subscriptions FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  company text NULL,
  description text NULL,
  job_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create updated_at trigger for jobs
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE
UPDATE ON jobs FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  job_id uuid NULL,
  is_base_resume boolean NULL DEFAULT false,
  name text NOT NULL,
  first_name text NULL,
  last_name text NULL,
  email text NULL,
  phone_number text NULL,
  location text NULL,
  website text NULL,
  linkedin_url text NULL,
  github_url text NULL,
  professional_summary text NULL,
  work_experience jsonb NULL DEFAULT '[]'::jsonb,
  education jsonb NULL DEFAULT '[]'::jsonb,
  skills jsonb NULL DEFAULT '[]'::jsonb,
  projects jsonb NULL DEFAULT '[]'::jsonb,
  certifications jsonb NULL DEFAULT '[]'::jsonb,
  section_order jsonb NULL DEFAULT '["professional_summary", "work_experience", "skills", "projects", "education", "certifications"]'::jsonb,
  section_configs jsonb NULL DEFAULT '{"skills": {"style": "grouped", "visible": true}, "projects": {"visible": true, "max_items": 3}, "education": {"visible": true, "max_items": null}, "certifications": {"visible": true}, "work_experience": {"visible": true, "max_items": null}}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  resume_title text NULL,
  target_role text NULL,
  document_settings jsonb NULL DEFAULT '{"header_name_size": 24, "skills_margin_top": 2, "document_font_size": 10, "projects_margin_top": 2, "skills_item_spacing": 2, "document_line_height": 1.5, "education_margin_top": 2, "skills_margin_bottom": 2, "experience_margin_top": 2, "projects_item_spacing": 4, "education_item_spacing": 4, "projects_margin_bottom": 2, "education_margin_bottom": 2, "experience_item_spacing": 4, "document_margin_vertical": 36, "experience_margin_bottom": 2, "skills_margin_horizontal": 0, "document_margin_horizontal": 36, "header_name_bottom_spacing": 24, "projects_margin_horizontal": 0, "education_margin_horizontal": 0, "experience_margin_horizontal": 0}'::jsonb,
  has_cover_letter boolean NOT NULL DEFAULT false,
  cover_letter jsonb NULL,
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create updated_at trigger for resumes
DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;
CREATE TRIGGER update_resumes_updated_at BEFORE
UPDATE ON resumes FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL,
  first_name text NULL,
  last_name text NULL,
  email text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  phone_number text NULL,
  location text NULL,
  website text NULL,
  linkedin_url text NULL,
  github_url text NULL,
  work_experience jsonb NULL DEFAULT '[]'::jsonb,
  education jsonb NULL DEFAULT '[]'::jsonb,
  skills jsonb NULL DEFAULT '[]'::jsonb,
  projects jsonb NULL DEFAULT '[]'::jsonb,
  certifications jsonb NULL DEFAULT '[]'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create updated_at trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Setup Row Level Security (RLS) Policies
-- These policies ensure users can only access their own data

-- Subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_policy ON public.subscriptions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Resumes RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY resumes_policy ON public.resumes
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Jobs RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_policy ON public.jobs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_policy ON public.profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());