-- Leases are created once a tenant signs a contract on a property. Deliberately NOT linked
-- to property_matches by FK (per product decision) — a lease is identified directly by
-- property_id + tenant_id, independent of however the match/interest flow got there.

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ended')),
  lease_start date not null,
  lease_end date not null,
  monthly_rent numeric not null,
  security_deposit numeric,
  payment_method text,
  next_payment_due date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leases_property_id on public.leases(property_id);
create index idx_leases_tenant_id on public.leases(tenant_id);

create trigger update_leases_updated_at
  before update on public.leases
  for each row
  execute function public.update_updated_at_column();

alter table public.leases enable row level security;

-- RLS policies do not imply table privileges; both are required. Admin access goes through
-- the service-role client (see src/features/admin), same pattern as contact_messages and
-- property matches admin review, so no admin-specific policy is added here.
grant select, insert, update, delete on public.leases to authenticated;
grant select, insert, update, delete on public.leases to service_role;

create policy "tenants_select_own_leases"
  on public.leases for select
  to authenticated
  using (auth.uid() = tenant_id);

create policy "owners_select_leases_for_own_properties"
  on public.leases for select
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  );
