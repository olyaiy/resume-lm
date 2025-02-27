# This document contains database table defenitions for our application

// Subscriptions table 

create table public.subscriptions (
  user_id uuid not null,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  subscription_plan text null default 'free'::text,
  subscription_status text null,
  current_period_end timestamp with time zone null,
  trial_end timestamp with time zone null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint subscriptions_pkey primary key (user_id),
  constraint subscriptions_user_id_key unique (user_id),
  constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id),
  constraint subscriptions_stripe_customer_id_key unique (stripe_customer_id),
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE,
  constraint subscriptions_subscription_plan_check check (
    (
      subscription_plan = any (array['free'::text, 'pro'::text])
    )
  ),
  constraint subscriptions_subscription_status_check check (
    (
      (subscription_status is null)
      or (
        subscription_status = any (array['active'::text, 'canceled'::text])
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION update_updated_at_column ();




// resumes table

create table public.resumes (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  job_id uuid null,
  is_base_resume boolean null default false,
  name text not null,
  first_name text null,
  last_name text null,
  email text null,
  phone_number text null,
  location text null,
  website text null,
  linkedin_url text null,
  github_url text null,
  professional_summary text null,
  work_experience jsonb null default '[]'::jsonb,
  education jsonb null default '[]'::jsonb,
  skills jsonb null default '[]'::jsonb,
  projects jsonb null default '[]'::jsonb,
  certifications jsonb null default '[]'::jsonb,
  section_order jsonb null default '["professional_summary", "work_experience", "skills", "projects", "education", "certifications"]'::jsonb,
  section_configs jsonb null default '{"skills": {"style": "grouped", "visible": true}, "projects": {"visible": true, "max_items": 3}, "education": {"visible": true, "max_items": null}, "certifications": {"visible": true}, "work_experience": {"visible": true, "max_items": null}}'::jsonb,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  resume_title text null,
  target_role text null,
  document_settings jsonb null default '{"header_name_size": 24, "skills_margin_top": 2, "document_font_size": 10, "projects_margin_top": 2, "skills_item_spacing": 2, "document_line_height": 1.5, "education_margin_top": 2, "skills_margin_bottom": 2, "experience_margin_top": 2, "projects_item_spacing": 4, "education_item_spacing": 4, "projects_margin_bottom": 2, "education_margin_bottom": 2, "experience_item_spacing": 4, "document_margin_vertical": 36, "experience_margin_bottom": 2, "skills_margin_horizontal": 0, "document_margin_horizontal": 36, "header_name_bottom_spacing": 24, "projects_margin_horizontal": 0, "education_margin_horizontal": 0, "experience_margin_horizontal": 0}'::jsonb,
  has_cover_letter boolean not null default false,
  cover_letter jsonb null,
  constraint resumes_pkey primary key (id),
  constraint resumes_job_id_fkey foreign KEY (job_id) references jobs (id) on update CASCADE on delete CASCADE,
  constraint resumes_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger update_resumes_updated_at BEFORE
update on resumes for EACH row
execute FUNCTION update_updated_at_column ();




// Jobs table defnition 
create table public.profiles (
  user_id uuid not null,
  first_name text null,
  last_name text null,
  email text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  phone_number text null,
  location text null,
  website text null,
  linkedin_url text null,
  github_url text null,
  work_experience jsonb null default '[]'::jsonb,
  education jsonb null default '[]'::jsonb,
  skills jsonb null default '[]'::jsonb,
  projects jsonb null default '[]'::jsonb,
  certifications jsonb null default '[]'::jsonb,
  constraint profiles_pkey primary key (user_id),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();fire


// profiles 
create table public.profiles (
  user_id uuid not null,
  first_name text null,
  last_name text null,
  email text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  phone_number text null,
  location text null,
  website text null,
  linkedin_url text null,
  github_url text null,
  work_experience jsonb null default '[]'::jsonb,
  education jsonb null default '[]'::jsonb,
  skills jsonb null default '[]'::jsonb,
  projects jsonb null default '[]'::jsonb,
  certifications jsonb null default '[]'::jsonb,
  constraint profiles_pkey primary key (user_id),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();

