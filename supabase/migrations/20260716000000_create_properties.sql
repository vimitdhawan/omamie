create type property_type as enum ('apartment', 'condo', 'house', 'townhouse');
create type furnishing_type as enum ('fully', 'partial', 'none');
create type listing_role as enum ('owner', 'agent');
create type property_status as enum ('draft', 'active', 'rented', 'archived');

create table public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  listing_role listing_role not null default 'owner',
  title text not null,
  description text,
  property_type property_type not null,
  rent_amount integer not null,
  currency text not null default 'THB',
  address text not null,
  city text,
  state text,
  postal_code text,
  country text not null default 'Thailand',
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  furnishing furnishing_type not null default 'none',
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  status property_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Users can view their own properties"
  on public.properties for select
  using (auth.uid() = owner_id);

create policy "Users can insert their own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own properties"
  on public.properties for update
  using (auth.uid() = owner_id);

create trigger update_properties_updated_at
  before update on public.properties
  for each row execute function update_updated_at_column();