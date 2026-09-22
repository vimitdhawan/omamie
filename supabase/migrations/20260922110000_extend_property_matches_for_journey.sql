-- Extends property_matches to carry the tenant search journey beyond owner approval:
-- a match engine can now surface curated suggestions ('curated'/'dismissed'), and an
-- approved match can carry a lease decision once its viewing is done. Stage itself is
-- never stored here — it is derived in the app from this status, the latest viewing, and
-- the leases table — so this migration only adds the columns other tables can't already
-- express.

alter table public.property_matches
  add column match_score integer check (match_score between 0 and 100),
  add column curated_at timestamptz,
  add column lease_decision text check (lease_decision in ('pending', 'confirmed', 'declined')),
  add column lease_decision_at timestamptz;

-- 'curated' = surfaced by the match engine, tenant has not acted yet.
-- 'dismissed' = tenant hid a curated suggestion without expressing interest.
alter table public.property_matches drop constraint property_matches_status_check;
alter table public.property_matches add constraint property_matches_status_check
  check (status in ('curated', 'dismissed', 'interested', 'approved', 'rejected'));

-- Curated rows are created by the match engine, not by a tenant or an owner action.
alter table public.property_matches drop constraint property_matches_initiated_by_check;
alter table public.property_matches add constraint property_matches_initiated_by_check
  check (initiated_by in ('tenant', 'owner', 'system'));

create index idx_property_matches_status on public.property_matches(status);

-- No tenant UPDATE policy is added here, deliberately: a tenant-writable status column
-- would let a tenant set their own match straight to 'approved'. Tenant-side transitions
-- (curated -> interested/dismissed, and the lease decision) go through the service-role
-- client in the repository, gated by an explicit tenant_id predicate in application code —
-- the same pattern repository.createMatch already uses for tenant-initiated inserts.
