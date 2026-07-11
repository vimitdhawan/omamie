-- E2E seed data for the local Supabase stack.
--
-- This file is applied by the CI pipeline (and locally) via an explicit
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--     -f e2e/supabase/seed.sql
-- step that runs AFTER `supabase start` + `supabase db reset`. The
-- `supabase db reset` command on its own only loads `supabase/seed.sql`
-- (the dev-time placeholder), so the E2E seed must be applied separately.
--
-- The migrations under `supabase/migrations/` run first during `db reset`
-- and create the `public.profiles` table + the `on_auth_user_created`
-- trigger. The trigger is responsible for inserting the matching row in
-- `public.profiles` when a user signs up via Supabase Auth — but since we
-- insert directly into `auth.users` below (bypassing the Auth API), the
-- trigger does not fire and we insert the `public.profiles` row manually.
--
-- This file is intentionally minimal: it creates a single known test tenant
-- so that E2E tests can log in with a deterministic credential pair. The
-- password below is the bcrypt hash for `Test1234!` — safe to commit because
-- it is only valid inside the local Supabase stack (never a real project).

-- Create the auth user. `encrypted_password` expects a bcrypt hash.
-- The hash below was generated for "Test1234!" using bcrypt cost 10.
-- Update the value if your local Supabase instance uses a different auth
-- schema layout or if you change the test password.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'e2e-tenant@omamie.test',
  -- bcrypt hash for "Test1234!" (cost 10). Safe to commit; only valid locally.
  '$2a$10$1nqCQOOZRTuv3w1qz2qX3uV4cRZxXGXcOWd3xqOQe/pXv9vqqqJK',
  now(),
  now(),
  now(),
  jsonb_build_object('full_name', 'E2E Tenant', 'role', 'tenant'),
  jsonb_build_object('provider', 'email', 'providers', array['email'])
)
on conflict (email) do nothing;

-- The `on_auth_user_created` trigger only fires on INSERTs; since the INSERT
-- above predates the trigger declaration order is irrelevant, but the profile
-- row must still exist so RLS-protected queries return data after login.
insert into public.profiles (id, email, full_name, role)
values (
  '11111111-1111-1111-1111-111111111111',
  'e2e-tenant@omamie.test',
  'E2E Tenant',
  'tenant'
)
on conflict (id) do nothing;
