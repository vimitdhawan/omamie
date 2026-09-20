-- Tenants need to see images for active listings on Explore/Saved/detail pages, not just
-- their own uploads. RLS is enforced independently per table in a join, so the tenant-facing
-- `authenticated_select_active_properties` policy on `properties` does not carry over to the
-- nested `property_images` select used by the property queries. Only 'uploaded' images should
-- ever be tenant-visible (pending/failed rows are upload-lifecycle internals).

create policy "authenticated_select_images_for_active_properties"
  on public.property_images for select
  to authenticated
  using (
    status = 'uploaded'
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'active'
    )
  );
