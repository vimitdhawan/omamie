create type public.contact_subject as enum (
  'listing',
  'finding',
  'partnership',
  'general',
  'feedback',
  'issue',
  'other'
);

create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text,
  subject contact_subject not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Grant permissions to service_role only (all access via backend)
grant select, insert, update, delete on public.contact_messages to service_role;

-- RLS Policy: Service role manages all contact messages
create policy "service_role_manages_contact_messages"
  on public.contact_messages for all
  using (auth.role() = 'service_role');
