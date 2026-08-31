-- Create saved_properties table for tenant favorites/saved listings
create table public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  
  -- Ensure a user can only save a property once
  unique(profile_id, property_id)
);

-- Enable RLS
alter table public.saved_properties enable row level security;

-- Grant permissions
grant select, insert, update, delete on public.saved_properties to authenticated;
grant select, insert, update, delete on public.saved_properties to service_role;

-- Users can manage their own saved properties
create policy "users_manage_own_saved_properties"
  on public.saved_properties
  for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Indexes
create index idx_saved_properties_profile_id on public.saved_properties(profile_id);
create index idx_saved_properties_property_id on public.saved_properties(property_id);
create index idx_saved_properties_created_at on public.saved_properties(created_at desc);
