-- Enable RLS on property_matches table
alter table public.property_matches enable row level security;

-- Grant permissions to authenticated and service role
grant select, insert, update, delete on public.property_matches to authenticated;
grant select, insert, update, delete on public.property_matches to service_role;
