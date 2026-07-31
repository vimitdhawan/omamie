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

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);
