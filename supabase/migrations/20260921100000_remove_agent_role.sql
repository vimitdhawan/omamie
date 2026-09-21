-- Agents and owners have always been functionally identical (every permission
-- check in the app already treats them the same). The platform now ships an
-- owner-only lister persona; agent support may return later but is dropped
-- for now to simplify auth and the signup flow.

update public.profiles set role = 'owner' where role = 'agent';

alter table public.profiles
  drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'tenant', 'admin'));

update public.property_matches set initiated_by = 'owner' where initiated_by = 'agent';

alter table public.property_matches
  drop constraint property_matches_initiated_by_check;

alter table public.property_matches
  add constraint property_matches_initiated_by_check
  check (initiated_by in ('tenant', 'owner'));
