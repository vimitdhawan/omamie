-- A viewing is the in-person tour stage of the tenant journey, between an owner's match
-- approval and the tenant's final lease decision. Linked to property_matches (not directly
-- to property/tenant) since a viewing only ever makes sense in the context of one specific
-- match. A reschedule is a new row rather than an update, so the service reads the latest
-- row per match by created_at.

create table public.viewings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.property_matches(id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  host_name text,
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_viewings_match_id on public.viewings(match_id);

create trigger update_viewings_updated_at
  before update on public.viewings
  for each row
  execute function public.update_updated_at_column();

alter table public.viewings enable row level security;

-- RLS policies do not imply table privileges; both are required. Writes go through the
-- service-role client (same pattern as leases and property_matches inserts), so no
-- INSERT/UPDATE policy is added for authenticated users here.
grant select, insert, update, delete on public.viewings to authenticated;
grant select, insert, update, delete on public.viewings to service_role;

create policy "tenants_select_own_viewings"
  on public.viewings for select
  to authenticated
  using (
    exists (
      select 1 from public.property_matches pm
      where pm.id = match_id and pm.tenant_id = auth.uid()
    )
  );

create policy "owners_select_viewings_for_own_matches"
  on public.viewings for select
  to authenticated
  using (
    exists (
      select 1 from public.property_matches pm
      where pm.id = match_id and pm.property_owner_id = auth.uid()
    )
  );
