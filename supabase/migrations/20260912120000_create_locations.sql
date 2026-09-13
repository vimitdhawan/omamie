-- Enable PostGIS extension
create extension if not exists postgis;

-- Create locations table
create table public.locations (
  id uuid primary key default gen_random_uuid(),

  address_line_1 text,
  address_line_2 text,
  city text,
  district text,
  state text,
  postal_code text,
  country text,
  country_code text,

  location geography(point, 4326) not null,

  provider text,
  provider_place_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for geographic queries
create index locations_location_idx on public.locations using gist (location);

-- Add location_id column to properties table
alter table public.properties
  add column location_id uuid references public.locations(id);

-- Enable RLS
alter table public.locations enable row level security;

-- Grant permissions
grant select, insert, update, delete on public.locations to authenticated;
grant select, insert, update, delete on public.locations to service_role;

-- RLS Policies: Allow authenticated users to read and write (gated at application layer via properties ownership)
create policy "locations_select"
  on public.locations for select
  to authenticated
  using (true);

create policy "locations_insert"
  on public.locations for insert
  to authenticated
  with check (true);

create policy "locations_update"
  on public.locations for update
  to authenticated
  using (true)
  with check (true);

-- Trigger to auto-update updated_at timestamp
create or replace function update_locations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger locations_updated_at
  before update on public.locations
  for each row
  execute function update_locations_updated_at();
