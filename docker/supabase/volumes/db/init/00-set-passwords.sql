-- Supabase Database Initialization
-- Creates roles, schemas, and types needed for Supabase services

-- ============================================
-- Enable required extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Create roles with passwords
-- ============================================
DO $$
BEGIN
    -- postgres role (required by GoTrue migrations)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres SUPERUSER LOGIN PASSWORD 'postgres-dev-password';
    END IF;

    -- Authenticator (PostgREST)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres-dev-password';
    END IF;

    -- Anonymous role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;

    -- Authenticated role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;

    -- Service role (bypasses RLS)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;

    -- Supabase admin
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin SUPERUSER LOGIN PASSWORD 'postgres-dev-password';
    END IF;

    -- Auth admin (superuser for migrations)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin SUPERUSER NOINHERIT CREATEROLE LOGIN PASSWORD 'postgres-dev-password';
    END IF;

    -- Storage admin (superuser for migrations)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin SUPERUSER NOINHERIT CREATEROLE LOGIN PASSWORD 'postgres-dev-password';
    END IF;
END $$;

-- Grant role memberships
GRANT anon, authenticated, service_role TO authenticator;

-- ============================================
-- Create schemas
-- ============================================
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
CREATE SCHEMA IF NOT EXISTS _realtime AUTHORIZATION supabase_admin;
CREATE SCHEMA IF NOT EXISTS realtime AUTHORIZATION supabase_admin;
CREATE SCHEMA IF NOT EXISTS graphql_public;
CREATE SCHEMA IF NOT EXISTS _analytics AUTHORIZATION supabase_admin;

-- ============================================
-- Set search paths for admin roles
-- ============================================
ALTER ROLE supabase_auth_admin SET search_path TO auth, public;
ALTER ROLE supabase_storage_admin SET search_path TO storage, public;

-- ============================================
-- Schema permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;

-- Default privileges for public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ============================================
-- Auth helper functions (stubs for RLS policies)
-- GoTrue will override these with proper implementations
-- ============================================
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(
      current_setting('request.jwt.claim.sub', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )::uuid
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(
      current_setting('request.jwt.claim.role', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    )::text
$$;

-- ============================================
-- Auth types (required by GoTrue migrations)
-- ============================================
SET ROLE supabase_auth_admin;

DO $$ BEGIN CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE auth.one_time_token_type AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'); EXCEPTION WHEN duplicate_object THEN null; END $$;

RESET ROLE;
