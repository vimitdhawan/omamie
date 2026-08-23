-- Update properties status check constraint to include all property lifecycle statuses
-- Status flow: pending (form filling) → review (admin review) → active (approved)
-- Additional statuses: inactive (deleted by user), rented (property rented out)

-- Drop the old constraint
alter table public.properties
drop constraint properties_status_check;

-- Add new constraint with all statuses included
alter table public.properties
add constraint properties_status_check
check (status in ('pending', 'review', 'active', 'inactive', 'rented'));
