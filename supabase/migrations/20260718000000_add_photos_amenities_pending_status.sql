-- Add 'pending' to the property_status enum so guest (unauthenticated) listings
-- can land in a moderation queue without breaking the NOT NULL constraint.
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
-- The Supabase CLI / psql executes this migration outside a transaction by default
-- for ADD VALUE statements; if your runner wraps in a txn, split this file.
ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'pending';

-- Persist amenities that were previously dropped by the service layer.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS amenities text[] NOT NULL DEFAULT '{}';

-- Drop the OLD insert policy that required auth.uid() = owner_id, which blocked
-- guest (owner_id IS NULL) submissions. Replace with a more permissive insert.
DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;

-- Authenticated owners/agents can insert properties owned by themselves.
CREATE POLICY "Users can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (owner_id IS NULL OR auth.uid() = owner_id);

-- Allow anyone to view 'active' listings (public marketplace) and owners to view
-- their own rows. Drop the old select policy and recreate with the OR condition.
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;

CREATE POLICY "Anyone can view active listings, owners see their own"
  ON public.properties FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = owner_id
  );
