-- Documents attached to a lease (signed contract, receipts, etc.). Access mirrors leases:
-- the tenant on the lease, and the owner/agent of the underlying property, can read them.

create table public.lease_documents (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  name text not null,
  file_type text,
  file_size_bytes bigint,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index idx_lease_documents_lease_id on public.lease_documents(lease_id);

alter table public.lease_documents enable row level security;

grant select, insert, delete on public.lease_documents to authenticated;
grant select, insert, delete on public.lease_documents to service_role;

create policy "tenants_select_own_lease_documents"
  on public.lease_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.leases l
      where l.id = lease_id and l.tenant_id = auth.uid()
    )
  );

create policy "owners_select_lease_documents_for_own_properties"
  on public.lease_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.leases l
      join public.properties p on p.id = l.property_id
      where l.id = lease_id and p.profile_id = auth.uid()
    )
  );

-- Storage bucket for lease documents. Private (not public like property-images): contracts
-- and receipts must not be world-readable. Access is brokered by the service-role client,
-- mirroring the property-images upload pattern.
insert into storage.buckets (id, name, public)
values ('lease-documents', 'lease-documents', false)
on conflict (id) do nothing;

do $$
begin
  create policy "Allow service role read lease documents"
    on storage.objects for select
    to service_role
    using (bucket_id = 'lease-documents');
exception when duplicate_object then
  null;
end $$;

do $$
begin
  create policy "Allow service role upload lease documents"
    on storage.objects for insert
    to service_role
    with check (bucket_id = 'lease-documents');
exception when duplicate_object then
  null;
end $$;

do $$
begin
  create policy "Allow service role update lease documents"
    on storage.objects for update
    to service_role
    using (bucket_id = 'lease-documents');
exception when duplicate_object then
  null;
end $$;

do $$
begin
  create policy "Allow service role delete lease documents"
    on storage.objects for delete
    to service_role
    using (bucket_id = 'lease-documents');
exception when duplicate_object then
  null;
end $$;
