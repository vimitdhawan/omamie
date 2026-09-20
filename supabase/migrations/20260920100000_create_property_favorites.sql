-- Tenant "saved properties" (heart icon on the explore grid).

create table public.property_favorites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, property_id)
);

create index idx_property_favorites_tenant_id on public.property_favorites(tenant_id);
create index idx_property_favorites_property_id on public.property_favorites(property_id);

alter table public.property_favorites enable row level security;

-- RLS policies do not imply table privileges; both are required.
grant select, insert, delete on public.property_favorites to authenticated;
grant select, insert, delete on public.property_favorites to service_role;

create policy "tenants_select_own_favorites"
  on public.property_favorites for select
  to authenticated
  using (auth.uid() = tenant_id);

create policy "tenants_insert_own_favorites"
  on public.property_favorites for insert
  to authenticated
  with check (auth.uid() = tenant_id);

create policy "tenants_delete_own_favorites"
  on public.property_favorites for delete
  to authenticated
  using (auth.uid() = tenant_id);
