create table if not exists public.property_find_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_type text not null check (property_type in ('apartment','condo','house','townhouse')),
  preferred_location text not null,
  monthly_budget numeric not null check (monthly_budget > 0),
  move_in_date date not null,
  bedrooms text not null check (bedrooms in ('studio','1','2','3','4+')),
  bathrooms text not null check (bathrooms in ('1','2','3+')),
  min_size_sqm integer check (min_size_sqm > 0),
  furnishing text not null check (furnishing in ('furnished','partially','unfurnished','none')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.property_find_requests enable row level security;

create policy "users can manage own find requests"
  on public.property_find_requests
  for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create index if not exists idx_property_find_requests_profile_id
  on public.property_find_requests(profile_id);
