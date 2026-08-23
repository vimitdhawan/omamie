-- Add next_action column to track which pending action needs to be completed
-- Values: 'basic_details' | 'amenities' | 'review' | 'completed'
alter table public.properties
add column next_action text not null default 'basic_details'
check (next_action in ('basic_details', 'amenities', 'review', 'completed'));

-- Add started_at to track when listing creation started
alter table public.properties
add column started_at timestamptz not null default now();
