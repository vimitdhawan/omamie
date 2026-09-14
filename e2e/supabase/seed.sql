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
  raw_app_meta_data,
  -- GoTrue scans these into non-nullable Go strings, so NULL makes every login
  -- fail with "Database error querying schema". They must be empty strings.
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'e2e-tenant@omamie.test',
  -- Hashed in-database so the value cannot drift from the password above.
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  jsonb_build_object('full_name', 'E2E Tenant', 'role', 'tenant'),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  '', '', '', '', '', '', '', ''
)
-- Keyed on id, not email: auth.users has no unique constraint on email, so
-- `on conflict (email)` raises 42P10 and aborts the seed.
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  created_at, updated_at, last_sign_in_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.email = 'e2e-tenant@omamie.test'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

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

-- ---------------------------------------------------------------------------
-- Owner user, for the property listing flow.
--
-- Same deterministic credentials as the tenant above (`Test1234!`). An
-- `auth.identities` row is required as well: GoTrue resolves a password
-- sign-in through the email identity, and without it the login fails with
-- "Database error querying schema" rather than an invalid-credentials error.
-- ---------------------------------------------------------------------------
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
  raw_app_meta_data,
  -- GoTrue scans these into non-nullable Go strings, so NULL makes every login
  -- fail with "Database error querying schema". They must be empty strings.
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'e2e-owner@omamie.test',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  jsonb_build_object('full_name', 'E2E Owner', 'role', 'owner'),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  '', '', '', '', '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  created_at, updated_at, last_sign_in_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.email = 'e2e-owner@omamie.test'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

insert into public.profiles (id, email, full_name, role)
values (
  '22222222-2222-2222-2222-222222222222',
  'e2e-owner@omamie.test',
  'E2E Owner',
  'owner'
)
on conflict (id) do nothing;
