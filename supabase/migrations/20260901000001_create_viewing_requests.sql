-- Create viewing_requests table for tenant property interest/viewing requests
create table public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_profile_id uuid not null references public.profiles(id) on delete cascade,
  
  -- Status: pending → accepted/rejected → confirmed → completed
  status text not null default 'pending' 
    check (status in ('pending', 'accepted', 'confirmed', 'rejected', 'cancelled', 'completed')),
  
  -- Tenant's initial message when expressing interest
  message text,
  
  -- Agent's proposed viewing time (filled when status = accepted)
  proposed_date date,
  proposed_time_start time,
  proposed_time_end time,
  agent_notes text,
  
  -- Timestamps
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  confirmed_at timestamptz,
  
  -- Prevent duplicate active requests for same property
  unique(property_id, tenant_profile_id)
);

-- Enable RLS
alter table public.viewing_requests enable row level security;

-- Grant permissions
grant select, insert, update, delete on public.viewing_requests to authenticated;
grant select, insert, update, delete on public.viewing_requests to service_role;

-- Tenants can view/create/update their own requests
create policy "tenants_manage_own_viewing_requests"
  on public.viewing_requests
  for all
  using (auth.uid() = tenant_profile_id)
  with check (auth.uid() = tenant_profile_id);

-- Agents/Owners can view/update requests for their properties
create policy "owners_manage_property_viewing_requests"
  on public.viewing_requests
  for all
  using (
    exists (
      select 1 from public.properties 
      where properties.id = viewing_requests.property_id 
      and properties.profile_id = auth.uid()
    )
  );

-- Indexes
create index idx_viewing_requests_property_id on public.viewing_requests(property_id);
create index idx_viewing_requests_tenant_id on public.viewing_requests(tenant_profile_id);
create index idx_viewing_requests_status on public.viewing_requests(status);
create index idx_viewing_requests_requested_at on public.viewing_requests(requested_at desc);
