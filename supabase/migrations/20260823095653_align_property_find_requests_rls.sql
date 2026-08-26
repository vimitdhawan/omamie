drop policy if exists "users can manage own find requests" on public.property_find_requests;

create policy "users_select_own_find_requests"
  on public.property_find_requests for select
  using (auth.uid() = profile_id);

create policy "users_insert_own_find_requests"
  on public.property_find_requests for insert
  with check (auth.uid() = profile_id);

create policy "users_update_own_find_requests"
  on public.property_find_requests for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users_delete_own_find_requests"
  on public.property_find_requests for delete
  using (auth.uid() = profile_id);
