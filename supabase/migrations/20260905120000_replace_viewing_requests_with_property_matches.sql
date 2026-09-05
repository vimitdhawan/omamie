-- Drop the old viewing_requests table (not yet deployed)
drop table if exists public.viewing_requests;

-- Seed a hardcoded demo tenant profile
insert into public.profiles (id, email, full_name, role, created_at)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo-tenant@example.com',
  'Demo Tenant',
  'tenant',
  now()
)
on conflict (id) do nothing;

-- Create the new property_matches table
create table public.property_matches (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  initiated_by text not null default 'tenant' check (initiated_by in ('tenant', 'agent')),
  status text not null default 'interested' check (status in ('interested', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_property_matches_property_id on public.property_matches(property_id);
create index idx_property_matches_tenant_id on public.property_matches(tenant_id);
create index idx_property_matches_status on public.property_matches(status);

-- Enable RLS
alter table public.property_matches enable row level security;

-- RLS: Owners/agents can select, update matches on their properties
create policy "Owners can view and manage matches for their properties"
  on public.property_matches
  for all
  using (
    property_id in (
      select id from public.properties
      where profile_id = auth.uid()
    )
  )
  with check (
    property_id in (
      select id from public.properties
      where profile_id = auth.uid()
    )
  );

-- RLS: Tenant-initiated insert via service_role (no real tenant auth yet)
-- Once tenant auth exists, add:
-- create policy "Tenants can create matches for themselves"
--   on public.property_matches
--   for insert
--   with check (auth.uid() = tenant_id);

-- RLS: Agent-initiated insert (future, added now to avoid re-migration)
create policy "Agents can create matches for their properties"
  on public.property_matches
  for insert
  with check (
    initiated_by = 'agent'
    and property_id in (
      select id from public.properties
      where profile_id = auth.uid()
    )
  );

-- Trigger for updated_at
create trigger update_property_matches_updated_at
  before update on public.property_matches
  for each row
  execute function public.update_updated_at_column();
