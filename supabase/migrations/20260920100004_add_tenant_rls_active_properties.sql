-- Tenants (enable-tenant-flow) need to browse active listings on the explore page, not just
-- their own properties. Any authenticated user may read a property once it is active
-- ("published"); owners already have full access to their own rows via the existing policy.

create policy "authenticated_select_active_properties"
  on public.properties for select
  to authenticated
  using (status = 'active');
