-- property_find_requests is superseded by tenant_requirements (one row per tenant, visible to
-- owners on their own matches) and tenant_profile (personal context). Existing rows are dev/seed
-- data and are not migrated.

comment on column public.properties.area_sqm is
  'Usable floor area in square metres. Compared against tenant_requirements.min_size_sqm.';

drop table public.property_find_requests;
