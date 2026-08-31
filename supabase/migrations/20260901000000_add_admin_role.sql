-- Migration: Add admin role and property status history tracking
-- Date: 2026-09-01
-- Purpose: Enable admin functionality with property approval workflow

-- ============================================================================
-- 1. UPDATE PROFILES TABLE TO SUPPORT ADMIN ROLE
-- ============================================================================

-- Drop existing role constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_role_check;

-- Add new constraint with admin included
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('agent', 'owner', 'tenant', 'admin'));

-- ============================================================================
-- 2. CREATE PROPERTY STATUS HISTORY TABLE
-- ============================================================================

-- Create table to track all property status changes for audit trail
CREATE TABLE public.property_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES public.profiles(id),
  reason text,  -- Optional rejection reason or notes
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_status_history ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated and service role
GRANT SELECT, INSERT ON public.property_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_status_history TO service_role;

-- ============================================================================
-- 3. RLS POLICIES FOR PROPERTY STATUS HISTORY
-- ============================================================================

-- Policy: Admins can view all history entries
CREATE POLICY "admins_select_all_status_history"
  ON public.property_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Property owners can view history for their own properties
CREATE POLICY "owners_select_own_property_history"
  ON public.property_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_status_history.property_id
        AND p.profile_id = auth.uid()
    )
  );

-- Policy: Admins can insert history entries
CREATE POLICY "admins_insert_status_history"
  ON public.property_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. INDEXES FOR PROPERTY STATUS HISTORY
-- ============================================================================

-- Index for efficient property history lookups
CREATE INDEX idx_property_status_history_property_id 
  ON public.property_status_history(property_id);

-- Index for chronological sorting
CREATE INDEX idx_property_status_history_created_at 
  ON public.property_status_history(created_at DESC);

-- Index for admin queries
CREATE INDEX idx_property_status_history_changed_by 
  ON public.property_status_history(changed_by);

-- ============================================================================
-- 5. ADMIN RLS POLICIES FOR EXISTING TABLES
-- ============================================================================

-- Allow admins to read ALL profiles
CREATE POLICY "admins_select_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to read ALL properties
CREATE POLICY "admins_select_all_properties"
  ON public.properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to UPDATE all properties (for approval/rejection)
CREATE POLICY "admins_update_all_properties"
  ON public.properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to read ALL contact messages
CREATE POLICY "admins_select_all_contact_messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
