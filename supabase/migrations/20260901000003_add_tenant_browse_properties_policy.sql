-- Allow any authenticated user to browse active properties
-- This enables tenants to view property listings for searching/filtering

create policy "anyone_can_browse_active_properties"
  on public.properties for select
  using (status = 'active');
