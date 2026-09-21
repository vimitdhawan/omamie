-- Replaces property_find_requests (dropped in the following migration) with a single
-- one-row-per-tenant requirements record, so an owner reviewing a match request can see
-- exactly one "what this tenant is looking for" record rather than a list of saved searches.
-- Column set and CHECK constraints are carried over from property_find_requests as-is.

create table public.tenant_requirements (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  property_type text not null check (property_type in ('apartment', 'condo', 'house', 'townhouse')),
  preferred_location text not null,
  monthly_budget numeric not null check (monthly_budget > 0),
  move_in_date date not null,
  bedrooms text not null check (bedrooms in ('studio', '1', '2', '3', '4+')),
  bathrooms text not null check (bathrooms in ('1', '2', '3+')),
  min_size_sqm integer check (min_size_sqm > 0),
  furnishing text not null check (furnishing in ('furnished', 'partially', 'unfurnished')),
  preferred_neighborhoods text[] not null default '{}'::text[],
  pet_friendly boolean not null default false,
  parking_needed boolean not null default false,
  amenities_wishlist text[] not null default '{}'::text[],
  additional_notes text check (additional_notes is null or length(additional_notes) <= 1000),
  preferred_lease_length text
    check (
      preferred_lease_length is null
      or preferred_lease_length in ('6_months', '1_year', '2_years', 'flexible')
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_tenant_requirements_updated_at
  before update on public.tenant_requirements
  for each row
  execute function public.update_updated_at_column();

alter table public.tenant_requirements enable row level security;

grant select, insert, update, delete on public.tenant_requirements to authenticated;
grant select, insert, update, delete on public.tenant_requirements to service_role;

create policy "tenants_manage_own_requirements"
  on public.tenant_requirements for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "owners_select_tenant_requirements_for_own_matches"
  on public.tenant_requirements for select
  to authenticated
  using (
    exists (
      select 1 from public.property_matches pm
      where pm.tenant_id = tenant_requirements.profile_id
        and pm.property_owner_id = auth.uid()
    )
  );
