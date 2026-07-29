-- Close the RLS gap on the properties table: previously only SELECT/INSERT/UPDATE
-- had policies. DELETE was implicitly denied for all requesters (including owners),
-- which broke the service-layer `deleteProperty()` flow.
--
-- Allow owners to delete their own properties. Guest-owned rows (owner_id IS NULL)
-- cannot be deleted by anyone via RLS — admin tooling is required for those.
DROP POLICY IF EXISTS "Owners can delete their own properties" ON public.properties;

CREATE POLICY "Owners can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_id);
