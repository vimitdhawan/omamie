-- Viewing Requests Table
CREATE TABLE IF NOT EXISTS viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requested_date DATE NOT NULL,
  requested_time_start TIME NOT NULL,
  requested_time_end TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Availability Table
CREATE TABLE IF NOT EXISTS property_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, day_of_week)
);

-- Availability Overrides Table
CREATE TABLE IF NOT EXISTS availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  override_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, override_date)
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  id_type TEXT CHECK (id_type IN ('passport', 'national_id', 'drivers_license')),
  id_number TEXT,
  id_document_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases Table
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2),
  status TEXT CHECK (status IN ('draft', 'active', 'expired', 'terminated')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease Documents Table
CREATE TABLE IF NOT EXISTS lease_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT CHECK (document_type IN ('agreement', 'move_in_photo', 'inspection_report', 'other')) NOT NULL,
  document_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reported_by_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  reported_by_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other')) NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Maintenance Images Table
CREATE TABLE IF NOT EXISTS maintenance_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT CHECK (image_type IN ('before', 'after')) DEFAULT 'before',
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_viewing_requests_property_id ON viewing_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requests_status ON viewing_requests(status);
CREATE INDEX IF NOT EXISTS idx_property_availability_property_id ON property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_property_id ON availability_overrides(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);

-- RLS Policies
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_images ENABLE ROW LEVEL SECURITY;

-- Viewing Requests RLS: Property owners can manage viewing requests for their properties
CREATE POLICY "Property owners can view viewing requests for their properties"
  ON viewing_requests FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can insert viewing requests"
  ON viewing_requests FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update viewing requests for their properties"
  ON viewing_requests FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

-- Property Availability RLS
CREATE POLICY "Property owners can manage availability for their properties"
  ON property_availability FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can manage availability overrides for their properties"
  ON availability_overrides FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

-- Tenants RLS: Property owners can manage tenants
CREATE POLICY "Authenticated users can manage tenants"
  ON tenants FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Leases RLS
CREATE POLICY "Property owners can manage leases for their properties"
  ON leases FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can manage lease documents"
  ON lease_documents FOR ALL
  USING (
    lease_id IN (
      SELECT l.id FROM leases l
      JOIN properties p ON l.property_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- Maintenance Requests RLS
CREATE POLICY "Property owners can manage maintenance requests for their properties"
  ON maintenance_requests FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can manage maintenance images"
  ON maintenance_images FOR ALL
  USING (
    maintenance_request_id IN (
      SELECT mr.id FROM maintenance_requests mr
      JOIN properties p ON mr.property_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_viewing_requests_updated_at BEFORE UPDATE ON viewing_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_availability_updated_at BEFORE UPDATE ON property_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_overrides_updated_at BEFORE UPDATE ON availability_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
