-- Create properties table for property listings
-- Migration: 20260731000000_create_properties

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner reference (placeholder "test" for now, will be UUID FK to profiles later)
  profile_id TEXT NOT NULL DEFAULT 'test',
  
  -- Step 1: Property Details
  title TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'condo', 'house', 'townhouse')),
  location TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL CHECK (monthly_rent > 0),
  description TEXT,
  
  -- Step 2: Amenities & Features
  bedrooms INTEGER NOT NULL DEFAULT 1 CHECK (bedrooms >= 0 AND bedrooms <= 20),
  bathrooms INTEGER NOT NULL DEFAULT 1 CHECK (bathrooms >= 1 AND bathrooms <= 20),
  furnished_status TEXT NOT NULL CHECK (furnished_status IN ('furnished', 'partial', 'unfurnished')),
  amenities TEXT[] DEFAULT '{}',
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_properties_profile_id ON public.properties(profile_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();

-- Note: No RLS policies for now - backend-only access via service role
-- RLS can be enabled when auth feature is implemented
