-- Atomic property save.
--
-- The listing form submits once. `save_property` commits the property, its location and the
-- image bookkeeping in a single transaction (a plpgsql function body is one implicit
-- transaction), inserting new image rows as 'pending'. The caller then uploads the files and
-- calls `finalize_property_images` to promote the rows -- and, if this was a publish, the
-- listing itself.
--
-- Both functions are SECURITY INVOKER so the existing owner-only RLS on `properties` applies.
-- They are called with the cookie-scoped client, never the service role.

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
      description, bedrooms, bathrooms, furnished_status, amenities, status
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


-- Promote image rows once their files are in storage, and publish the listing if this save
-- was a publish. Replay-safe: the 'pending' predicate makes a repeated call a no-op.
create or replace function public.finalize_property_images(
  p_property_id uuid,
  p_uploaded    uuid[],
  p_failed      uuid[],
  p_publish     boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_failed_paths text[];
  v_status       text;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.properties
     where id = p_property_id and profile_id = v_uid
     for update
  ) then
    raise exception 'Property not found or not owned' using errcode = '42501';
  end if;

  update public.property_images
     set status = 'uploaded'
   where property_id = p_property_id
     and id = any(coalesce(p_uploaded, '{}'::uuid[]))
     and status = 'pending';

  with del as (
    delete from public.property_images
     where property_id = p_property_id
       and id = any(coalesce(p_failed, '{}'::uuid[]))
    returning storage_path
  )
  select coalesce(array_agg(storage_path), '{}'::text[]) into v_failed_paths from del;

  if p_publish then
    update public.properties
       set status = 'review'
     where id = p_property_id
       and status in ('draft', 'pending');
  end if;

  select status into v_status from public.properties where id = p_property_id;

  return jsonb_build_object(
    'status',       v_status,
    'failed_paths', to_jsonb(v_failed_paths)
  );
end;
$$;

revoke all on function public.finalize_property_images(uuid, uuid[], uuid[], boolean) from public;
grant execute on function public.finalize_property_images(uuid, uuid[], uuid[], boolean) to authenticated;
