-- Create property-images storage bucket
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict(id) do nothing;

-- Allow public read access to images (anyone can view)
do $$
begin
  create policy "Allow public read"
    on storage.objects for select
    using (bucket_id = 'property-images');
exception when duplicate_object then
  null;
end $$;

-- Allow service role to upload images (server-side only)
do $$
begin
  create policy "Allow service role upload"
    on storage.objects for insert
    to service_role
    with check (bucket_id = 'property-images');
exception when duplicate_object then
  null;
end $$;

-- Allow service role to update/delete images
do $$
begin
  create policy "Allow service role update"
    on storage.objects for update
    to service_role
    using (bucket_id = 'property-images');
exception when duplicate_object then
  null;
end $$;

do $$
begin
  create policy "Allow service role delete"
    on storage.objects for delete
    to service_role
    using (bucket_id = 'property-images');
exception when duplicate_object then
  null;
end $$;
