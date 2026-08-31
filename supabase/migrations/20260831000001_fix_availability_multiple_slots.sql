-- Fix property_availability table to allow multiple time slots per day
-- Remove the UNIQUE constraint on (property_id, day_of_week) to support:
-- - Multiple time slots per day (e.g., 09:00-11:00 AND 12:00-15:00)
-- - More flexible availability patterns

-- Drop the existing unique constraint
ALTER TABLE property_availability
DROP CONSTRAINT IF EXISTS property_availability_property_id_day_of_week_key;

-- Add a comment explaining the schema design
COMMENT ON TABLE property_availability IS 'Weekly default availability patterns. Multiple rows per property+day_of_week allowed to support split time slots (e.g., morning and afternoon slots on same day).';
