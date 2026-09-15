-- Property images table
--
-- Replaces the `properties.images text[]` column with a first-class table that carries
-- ordering (`sort_order`) and an upload lifecycle (`status`).
--
-- Lifecycle: rows are inserted as 'pending' inside the same transaction as the property
-- write, the files are then uploaded to storage, and the rows are flipped to 'uploaded'.
-- Read paths MUST filter on status = 'uploaded' so a crashed upload never renders as a
-- broken image.

create table public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  sort_order   integer not null default 0 check (sort_order >= 0),
  status       text not null default 'pending'
               check (status in ('pending', 'uploaded', 'failed')),
  width        integer,
  height       integer,
  byte_size    integer,
  content_type text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Storage paths are globally unique, which makes the backfill and retries idempotent.
create unique index property_images_storage_path_key
  on public.property_images (storage_path);

create index property_images_property_sort_idx
  on public.property_images (property_id, sort_order);

-- Supports the TTL sweeper that reaps rows abandoned between commit and upload.
create index property_images_pending_idx
  on public.property_images (created_at)
  where status = 'pending';

-- Deliberately NOT unique on (property_id, sort_order): reordering re-numbers rows in a
-- single statement and would transiently collide.

create trigger property_images_updated_at
  before update on public.property_images
  for each row
  execute function update_properties_updated_at();

alter table public.property_images enable row level security;

-- RLS policies do not imply table privileges; both are required.
grant select, insert, update, delete on public.property_images to authenticated;
grant select, insert, update, delete on public.property_images to service_role;

-- Ownership is derived from the parent property. `properties.profile_id` is the auth uid
-- (see the properties RLS policies), so this join is a primary-key lookup.
create policy "property_images_select_own"
  on public.property_images for select
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  );

create policy "property_images_insert_own"
  on public.property_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  );

create policy "property_images_update_own"
  on public.property_images for update
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  );

create policy "property_images_delete_own"
  on public.property_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.profile_id = auth.uid()
    )
  );

-- Backfill from the legacy array, preserving array order as sort_order.
insert into public.property_images (property_id, storage_path, sort_order, status, created_at)
select p.id, img.path, img.ord - 1, 'uploaded', p.created_at
  from public.properties p
  cross join lateral unnest(coalesce(p.images, '{}'::text[]))
       with ordinality as img(path, ord)
 where img.path is not null and img.path <> ''
on conflict (storage_path) do nothing;

-- The column is kept for one release: during a rolling deploy the previous app version is
-- still reading and writing it, and dropping it here would 500 those requests with 42703.
comment on column public.properties.images is
  'DEPRECATED - superseded by public.property_images. Drop in a follow-up migration.';
