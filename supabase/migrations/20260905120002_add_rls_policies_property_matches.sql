-- RLS Policies: Property owners can read their own property matches
create policy "property_owners_read_own_matches"
  on public.property_matches for select
  using (auth.uid() = property_owner_id);

-- RLS Policies: Property owners can update their own property matches
create policy "property_owners_update_own_matches"
  on public.property_matches for update
  using (auth.uid() = property_owner_id)
  with check (auth.uid() = property_owner_id);
