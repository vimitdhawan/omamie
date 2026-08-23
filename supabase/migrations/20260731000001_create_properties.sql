-- Create properties table for property listings
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles on delete cascade,

  -- Property details
  title text not null,
  property_type text not null check (property_type in ('apartment', 'condo', 'house', 'townhouse')),
  location text not null,
  monthly_rent numeric(10, 2) not null check (monthly_rent > 0),
  description text,

  -- Features
  bedrooms integer not null default 1 check (bedrooms >= 0 and bedrooms <= 20),
  bathrooms integer not null default 1 check (bathrooms >= 1 and bathrooms <= 20),
  furnished_status text not null check (furnished_status in ('furnished', 'partial', 'unfurnished')),
  amenities text[] default '{}',
  images text[] default '{}',

  -- Status and timestamps
  status text not null default 'active' check (status in ('active', 'inactive', 'rented')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.properties enable row level security;

-- Grant permissions to authenticated and service role
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.properties to service_role;

-- RLS Policies: Users can only see their own properties
create policy "users_select_own_properties"
  on public.properties for select
  using (auth.uid() = profile_id);

-- RLS Policies: Users can only insert properties for themselves
create policy "users_insert_own_properties"
  on public.properties for insert
  with check (auth.uid() = profile_id);

-- RLS Policies: Users can only update their own properties
create policy "users_update_own_properties"
  on public.properties for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- RLS Policies: Users can only delete their own properties
create policy "users_delete_own_properties"
  on public.properties for delete
  using (auth.uid() = profile_id);

-- Indexes for common queries
create index idx_properties_profile_id on public.properties(profile_id);
create index idx_properties_status on public.properties(status);
create index idx_properties_property_type on public.properties(property_type);
create index idx_properties_created_at on public.properties(created_at desc);

-- Trigger to auto-update updated_at timestamp
create or replace function update_properties_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at
  before update on public.properties
  for each row
  execute function update_properties_updated_at();
