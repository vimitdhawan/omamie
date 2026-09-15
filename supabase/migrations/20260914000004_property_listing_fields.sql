-- Listing detail fields collected by the single-form property editor.
--
-- All five are nullable and, unlike property_type / location / monthly_rent /
-- furnished_status, they stay optional even on a live listing -- none of them joins
-- properties_complete_when_not_draft. A landlord who does not yet know the current
-- tenant's move-out date must still be able to publish. (Adding any of them to that
-- constraint would also validate existing rows and fail the migration outright against
-- any already-published listing.)

alter table public.properties
  add column security_deposit_months smallint,
  add column available_from          date,
  add column area_sqm                numeric(7, 2),
  add column floor_number            smallint,
  add column total_floors            smallint;

-- CHECK passes on NULL, so none of these block a partially-filled draft.
alter table public.properties
  add constraint properties_security_deposit_months_check
    check (security_deposit_months between 0 and 24),
  add constraint properties_area_sqm_check
    check (area_sqm > 0 and area_sqm <= 10000),
  add constraint properties_floor_number_check
    check (floor_number between -5 and 200),
  add constraint properties_total_floors_check
    check (total_floors between 1 and 200),
  add constraint properties_floor_within_building_check
    check (floor_number is null or total_floors is null or floor_number <= total_floors);

comment on column public.properties.security_deposit_months is
  'Deposit expressed in months of rent (UI: "2 Months Rent"). Not a currency amount: monthly_rent is nullable on drafts, so an amount could not be rendered back as months.';
comment on column public.properties.available_from is
  'First date the unit can be moved into. NULL = available now / unspecified. A date, not a timestamptz, so the day cannot shift across timezones.';
comment on column public.properties.area_sqm is
  'Usable floor area in square metres. Compared against property_find_requests.min_size_sqm.';

-- Tenants filter listings by size; the other four are display-only for now.
create index if not exists properties_area_sqm_idx
  on public.properties (area_sqm)
  where status = 'active';


-- Re-issue save_property with the five new columns. The signature is unchanged -- the
-- fields ride inside the existing p_property jsonb -- so the existing grants still apply.
--
-- Note the semantics the `p_property ? 'key'` guard gives us: the key being present with a
-- JSON null clears the column, while omitting the key preserves it. That is what lets a
-- partial draft save leave untouched fields alone *and* lets the editor clear a field.

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
    select location_id, status
      into v_location_id, v_cur_status
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
    'status',        v_status,
    'deleted_paths', to_jsonb(v_deleted),
    'pending',       v_pending
  );
end;
$$;

revoke all on function public.save_property(uuid, boolean, jsonb, jsonb, jsonb, boolean) from public;
grant execute on function public.save_property(uuid, boolean, jsonb, jsonb, jsonb, boolean) to authenticated;
