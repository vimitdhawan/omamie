-- Add column to track which steps have been completed
alter table public.properties add column completed_steps text[] default array[]::text[];

-- Add comment explaining the column
comment on column public.properties.completed_steps is 'Array of completed step IDs: step1_details, step2_amenities, step3_pricing';

-- Create index for better query performance
create index idx_properties_completed_steps on public.properties using gin(completed_steps);
