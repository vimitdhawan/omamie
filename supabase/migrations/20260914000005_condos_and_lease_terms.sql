-- Condo registry + lease terms.
--
-- `condos` is a shared, cross-owner reference table. Today every listing simply creates its
-- own row, which admins de-duplicate and enrich during the property approval process. Once
-- the data settles it becomes the place to look up a building's facilities (and eventually
-- its location) instead of asking every landlord to retype them.

create extension if not exists pg_trgm;

create table public.condos (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) between 2 and 200),
  -- Building-level amenities (pool, gym, parking, ...), as opposed to what is inside the
  -- unit. Seeded from the listing form so the registry fills up as listings are created.
  facilities   text[] not null default '{}',
  location_id  uuid references public.locations(id),
  district     text,
  city         text,
  total_floors smallint check (total_floors between 1 and 200),
  year_built   smallint check (year_built between 1800 and 2200),
  -- Set by an admin once the record has been reviewed; a verified row is never rewritten
  -- by a landlord's save.
  verified     boolean not null default false,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fuzzy name search, for the "find your building" lookup this table is meant to enable.
create index condos_name_trgm_idx on public.condos using gin (name gin_trgm_ops);
create index condos_created_by_idx on public.condos (created_by);

create trigger condos_updated_at
  before update on public.condos
  for each row
  execute function update_properties_updated_at();

alter table public.condos enable row level security;
grant select, insert, update on public.condos to authenticated;
grant select, insert, update, delete on public.condos to service_role;

-- Readable by every signed-in user: the whole point is that one landlord's building data
-- helps the next one.
create policy "condos_select_all"
  on public.condos for select
  to authenticated
  using (true);

create policy "condos_insert_own"
  on public.condos for insert
  to authenticated
  with check (created_by = auth.uid());

-- Deliberately narrow: you may correct a row you created, and only until an admin has
-- verified it. No delete policy at all -- cleaning up duplicates is an admin job.
create policy "condos_update_own_unverified"
  on public.condos for update
  to authenticated
  using (created_by = auth.uid() and not verified)
  with check (created_by = auth.uid() and not verified);

alter table public.properties
  add column condo_id uuid references public.condos(id) on delete set null,
  add column minimum_lease_months smallint;

alter table public.properties
  add constraint properties_minimum_lease_months_check
    check (minimum_lease_months between 1 and 60);

create index properties_condo_id_idx on public.properties (condo_id);

comment on column public.properties.minimum_lease_months is
  'Shortest lease the landlord will accept, in months. NULL = unspecified.';
comment on table public.condos is
  'Shared building registry. Landlord saves only ever insert; admins curate and de-duplicate during property approval.';


-- Re-issue save_property so it can resolve/create the condo and persist the lease term.
-- The signature is unchanged: both ride inside the existing p_property jsonb.

create or replace function public.save_property(
  p_property_id uuid,                  -- caller-generated uuid on create, existing id on edit
  p_is_new      boolean,
  p_property    jsonb,                 -- scalar fields; only keys present are written
  p_location    jsonb,                 -- {latitude, longitude, address_line_1, ...} or null
  p_images      jsonb,                 -- ordered [{id|null, storage_path|null, sort_order}]
  p_publish     boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_uid         uuid := auth.uid();
  v_images      jsonb := coalesce(p_images, '[]'::jsonb);
  v_location_id uuid;
  v_cur_status  text;
  v_status      text;
  v_new_count   int;
  v_kept        uuid[];
  v_deleted     text[];
  v_pending     jsonb;
  v_amenities   text[];
  v_condo_id    uuid;
  v_condo_name  text := nullif(trim(coalesce(p_property->>'condo_name', '')), '');
  v_facilities  text[];
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_is_new then
    if exists (select 1 from public.properties where id = p_property_id) then
      raise exception 'Property already exists' using errcode = '23505';
    end if;
  else
    -- Ownership guard. FOR UPDATE also serialises concurrent saves of the same listing.
    select location_id, status, condo_id
      into v_location_id, v_cur_status, v_condo_id
      from public.properties
     where id = p_property_id and profile_id = v_uid
     for update;

    if not found then
      raise exception 'Property not found or not owned' using errcode = '42501';
    end if;
  end if;

  select count(*) filter (where e.elem->>'id' is null)
    into v_new_count
    from jsonb_array_elements(v_images) e(elem);

  -- Publishing only lands here when there is nothing left to upload. Otherwise the listing
  -- stays a draft and finalize_property_images promotes it once the files are in storage --
  -- publishing first would expose a live listing whose photos do not exist yet.
  v_status := case
    when p_publish and v_new_count = 0        then 'review'
    when p_is_new                             then 'draft'
    when v_cur_status in ('draft', 'pending') then 'draft'
    else v_cur_status                         -- editing a live listing preserves its status
  end;

  ----------------------------------------------------------------------------- location
  -- v_location_id is read from the owned property, never from the client: `locations` RLS
  -- is permissive (using (true)), so a client-supplied id would let anyone rewrite anyone's
  -- address.
  if p_location is not null and p_location ? 'latitude' and p_location ? 'longitude' then
    if v_location_id is null then
      insert into public.locations (
        address_line_1, address_line_2, city, district, state,
        postal_code, country, country_code, provider, provider_place_id, location
      ) values (
        p_location->>'address_line_1', p_location->>'address_line_2',
        p_location->>'city', p_location->>'district', p_location->>'state',
        p_location->>'postal_code', p_location->>'country', p_location->>'country_code',
        p_location->>'provider', p_location->>'provider_place_id',
        st_setsrid(
          st_makepoint(
            (p_location->>'longitude')::double precision,
            (p_location->>'latitude')::double precision
          ), 4326
        )::geography
      )
      returning id into v_location_id;
    else
      update public.locations set
        address_line_1    = p_location->>'address_line_1',
        address_line_2    = p_location->>'address_line_2',
        city              = p_location->>'city',
        district          = p_location->>'district',
        state             = p_location->>'state',
        postal_code       = p_location->>'postal_code',
        country           = p_location->>'country',
        country_code      = p_location->>'country_code',
        provider          = p_location->>'provider',
        provider_place_id = p_location->>'provider_place_id',
        location          = st_setsrid(
          st_makepoint(
            (p_location->>'longitude')::double precision,
            (p_location->>'latitude')::double precision
          ), 4326
        )::geography
      where id = v_location_id;
    end if;
  end if;

  ----------------------------------------------------------------------------- condo
  -- The condo registry is shared across owners, so records are effectively immutable:
  -- a renamed building gets a NEW row rather than rewriting one other listings point at.
  -- The creator may still correct the facilities on their own not-yet-verified row, which
  -- avoids a trail of near-duplicates every time a checkbox is toggled. Admins curate the
  -- table during the property approval process.
  if p_property ? 'condo_facilities' then
    select coalesce(array_agg(value), '{}'::text[])
      into v_facilities
      from jsonb_array_elements_text(p_property->'condo_facilities');
  end if;

  if v_condo_name is not null then
    -- Reuse the linked row only while the name still matches.
    if v_condo_id is not null
       and not exists (
         select 1 from public.condos
          where id = v_condo_id and name = v_condo_name
       )
    then
      v_condo_id := null;
    end if;

    if v_condo_id is null then
      insert into public.condos (name, facilities, created_by)
      values (v_condo_name, coalesce(v_facilities, '{}'::text[]), v_uid)
      returning id into v_condo_id;
    elsif v_facilities is not null then
      update public.condos
         set facilities = v_facilities
       where id = v_condo_id
         and created_by = v_uid
         and not verified;
    end if;
  elsif p_property ? 'condo_name' then
    -- An explicit null or empty name unlinks the property; the row itself is left for admins.
    v_condo_id := null;
  end if;

  ----------------------------------------------------------------------------- property
  if p_property ? 'amenities' then
    select coalesce(array_agg(value), '{}'::text[])
      into v_amenities
      from jsonb_array_elements_text(p_property->'amenities');
  end if;

  if p_is_new then
    insert into public.properties (
      id, profile_id, title, property_type, location, location_id, monthly_rent,
      description, bedrooms, bathrooms, furnished_status, amenities,
      security_deposit_months, available_from, area_sqm, floor_number, total_floors,
      minimum_lease_months, condo_id,
      status
    ) values (
      p_property_id,
      v_uid,
      coalesce(p_property->>'title', ''),
      p_property->>'property_type',
      p_property->>'location',
      v_location_id,
      (p_property->>'monthly_rent')::numeric,
      p_property->>'description',
      coalesce((p_property->>'bedrooms')::int, 1),
      coalesce((p_property->>'bathrooms')::int, 1),
      p_property->>'furnished_status',
      coalesce(v_amenities, '{}'::text[]),
      (p_property->>'security_deposit_months')::smallint,
      (p_property->>'available_from')::date,
      (p_property->>'area_sqm')::numeric,
      (p_property->>'floor_number')::smallint,
      (p_property->>'total_floors')::smallint,
      (p_property->>'minimum_lease_months')::smallint,
      v_condo_id,
      v_status
    );
  else
    -- Only keys present in the payload are written, so a partial draft save never clears
    -- fields the form did not carry.
    update public.properties set
      title            = case when p_property ? 'title'            then coalesce(p_property->>'title', '') else title end,
      property_type    = case when p_property ? 'property_type'    then p_property->>'property_type'       else property_type end,
      location         = case when p_property ? 'location'         then p_property->>'location'            else location end,
      monthly_rent     = case when p_property ? 'monthly_rent'     then (p_property->>'monthly_rent')::numeric else monthly_rent end,
      description      = case when p_property ? 'description'      then p_property->>'description'         else description end,
      bedrooms         = case when p_property ? 'bedrooms'         then (p_property->>'bedrooms')::int     else bedrooms end,
      bathrooms        = case when p_property ? 'bathrooms'        then (p_property->>'bathrooms')::int    else bathrooms end,
      furnished_status = case when p_property ? 'furnished_status' then p_property->>'furnished_status'    else furnished_status end,
      security_deposit_months = case when p_property ? 'security_deposit_months' then (p_property->>'security_deposit_months')::smallint else security_deposit_months end,
      available_from          = case when p_property ? 'available_from'          then (p_property->>'available_from')::date           else available_from end,
      area_sqm                = case when p_property ? 'area_sqm'                then (p_property->>'area_sqm')::numeric              else area_sqm end,
      floor_number            = case when p_property ? 'floor_number'            then (p_property->>'floor_number')::smallint         else floor_number end,
      total_floors            = case when p_property ? 'total_floors'            then (p_property->>'total_floors')::smallint         else total_floors end,
      minimum_lease_months    = case when p_property ? 'minimum_lease_months'    then (p_property->>'minimum_lease_months')::smallint else minimum_lease_months end,
      condo_id                = case when p_property ? 'condo_name'              then v_condo_id                                     else condo_id end,
      amenities        = coalesce(v_amenities, amenities),
      location_id      = coalesce(v_location_id, location_id),
      status           = v_status
    where id = p_property_id and profile_id = v_uid;
  end if;

  ----------------------------------------------------------------------------- images
  select coalesce(
           array_agg((e.elem->>'id')::uuid) filter (where e.elem->>'id' is not null),
           '{}'::uuid[]
         )
    into v_kept
    from jsonb_array_elements(v_images) e(elem);

  with del as (
    delete from public.property_images
     where property_id = p_property_id
       and not (id = any(v_kept))
    returning storage_path
  )
  select coalesce(array_agg(storage_path), '{}'::text[]) into v_deleted from del;

  update public.property_images pi
     set sort_order = (e.elem->>'sort_order')::int
    from jsonb_array_elements(v_images) e(elem)
   where pi.property_id = p_property_id
     and pi.id = (e.elem->>'id')::uuid
     and pi.sort_order is distinct from (e.elem->>'sort_order')::int;

  with ins as (
    insert into public.property_images (property_id, storage_path, sort_order, status)
    select p_property_id, e.elem->>'storage_path', (e.elem->>'sort_order')::int, 'pending'
      from jsonb_array_elements(v_images) e(elem)
     where e.elem->>'id' is null
    returning id, storage_path, sort_order
  )
  select coalesce(jsonb_agg(to_jsonb(ins) order by ins.sort_order), '[]'::jsonb)
    into v_pending
    from ins;

  return jsonb_build_object(
    'property_id',   p_property_id,
    'location_id',   v_location_id,
    'condo_id',      v_condo_id,
    'status',        v_status,
    'deleted_paths', to_jsonb(v_deleted),
    'pending',       v_pending
  );
end;
$$;

revoke all on function public.save_property(uuid, boolean, jsonb, jsonb, jsonb, boolean) from public;
grant execute on function public.save_property(uuid, boolean, jsonb, jsonb, jsonb, boolean) to authenticated;
