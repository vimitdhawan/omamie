-- Tenants can now sign in directly (enable-tenant-flow), so they need to read their own
-- property_matches rows (e.g. to show "Request Sent" on the explore grid) instead of every
-- read going through the service-role client.

create policy "tenants_read_own_matches"
  on public.property_matches for select
  using (auth.uid() = tenant_id);

create policy "tenants_insert_own_matches"
  on public.property_matches for insert
  with check (auth.uid() = tenant_id);
