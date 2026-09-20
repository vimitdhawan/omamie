-- Admin role: provisioned directly in Supabase (no self-signup), used by the
-- platform-staff portal to review/approve properties and browse users, listings,
-- and matching requests. Admin data access goes through the service-role client
-- (see src/features/admin/repository.ts), the same pattern already used for
-- contact_messages, so no new RLS bypass policies are required here.

alter table public.profiles
  drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('agent', 'owner', 'tenant', 'admin'));
