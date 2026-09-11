-- Drop the old viewing_requests table (not yet deployed)
drop table if exists public.viewing_requests;

-- Create generic updated_at trigger function if it doesn't exist
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create the new property_matches table
create table public.property_matches (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  property_owner_id uuid not null references public.profiles(id) on delete cascade,
  initiated_by text not null default 'tenant' check (initiated_by in ('tenant', 'agent', 'owner')),
  status text not null default 'interested' check (status in ('interested', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_property_matches_tenant_id on public.property_matches(tenant_id);
create index idx_property_matches_property_owner_id on public.property_matches(property_owner_id);

-- Trigger for updated_at
create trigger update_property_matches_updated_at
  before update on public.property_matches
  for each row
  execute function public.update_updated_at_column();
