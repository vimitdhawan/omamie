-- Stores the admin's reason when a property listing is rejected, so the owner
-- knows what to fix before resubmitting.
alter table public.properties
add column rejection_reason text;
