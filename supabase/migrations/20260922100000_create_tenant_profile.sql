-- General "who is this tenant" details, separate from auth/profiles so an owner reviewing a
-- match request never needs to read the profiles table (no email, no auth-linked PII). One row
-- per tenant: profile_id is the primary key rather than a surrogate id + unique constraint.
-- first_name is what an owner sees as the tenant's identity on a match request.

create table public.tenant_profile (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  first_name text not null,
  occupation text not null,
  employer text,
  reason_for_moving text not null,
  intended_duration text not null
    check (intended_duration in ('6_months', '1_year', '2_years', 'longer', 'flexible')),
  number_of_occupants integer not null default 1 check (number_of_occupants > 0),
  has_pets boolean not null default false,
  is_smoker boolean not null default false,
  bio text check (bio is null or length(bio) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_tenant_profile_updated_at
  before update on public.tenant_profile
  for each row
  execute function public.update_updated_at_column();

alter table public.tenant_profile enable row level security;

-- RLS policies do not imply table privileges; both are required. Admin access goes through
-- the service-role client, same pattern as leases and property matches, so no admin policy here.
grant select, insert, update, delete on public.tenant_profile to authenticated;
grant select, insert, update, delete on public.tenant_profile to service_role;

create policy "tenants_manage_own_profile"
  on public.tenant_profile for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- An owner may read a tenant's profile only while that tenant has an active match on one of
-- the owner's properties — visibility is earned by the match, not open to any owner.
create policy "owners_select_tenant_profile_for_own_matches"
  on public.tenant_profile for select
  to authenticated
  using (
    exists (
      select 1 from public.property_matches pm
      where pm.tenant_id = tenant_profile.profile_id
        and pm.property_owner_id = auth.uid()
    )
  );
