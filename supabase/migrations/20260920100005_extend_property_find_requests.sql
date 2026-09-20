alter table public.property_find_requests
  add column if not exists preferred_neighborhoods text[] not null default '{}'::text[],
  add column if not exists pet_friendly boolean not null default false,
  add column if not exists parking_needed boolean not null default false,
  add column if not exists amenities_wishlist text[] not null default '{}'::text[],
  add column if not exists additional_notes text,
  add column if not exists preferred_lease_length text
    check (
      preferred_lease_length is null
      or preferred_lease_length in ('6_months', '1_year', '2_years', 'flexible')
    );
