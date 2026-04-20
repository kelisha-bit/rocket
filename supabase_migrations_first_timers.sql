-- =====================================================
-- FIRST TIMERS MODULE - DATABASE MIGRATION
-- =====================================================

DROP TABLE IF EXISTS first_timers CASCADE;

CREATE TABLE first_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  address TEXT,
  preferred_contact_method TEXT,
  first_visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  notes TEXT,
  invited_by_name TEXT,
  invited_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Connected', 'Converted', 'Not Interested')) DEFAULT 'New',
  converted_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_by UUID DEFAULT auth.uid(),
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_first_timers_full_name ON first_timers(full_name);
CREATE INDEX idx_first_timers_first_visit_date ON first_timers(first_visit_date DESC);
CREATE INDEX idx_first_timers_status ON first_timers(status);
CREATE INDEX idx_first_timers_event_id ON first_timers(event_id);
CREATE INDEX idx_first_timers_search ON first_timers USING gin(to_tsvector('english', full_name || ' ' || COALESCE(phone, '') || ' ' || COALESCE(email, '')));

CREATE OR REPLACE FUNCTION update_first_timers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_first_timers_updated_at
  BEFORE UPDATE ON first_timers
  FOR EACH ROW
  EXECUTE FUNCTION update_first_timers_updated_at();

ALTER TABLE first_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read first_timers"
  ON first_timers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert first_timers"
  ON first_timers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin/pastor update first_timers"
  ON first_timers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND (
          up.role ILIKE '%admin%'
          OR up.role ILIKE '%pastor%'
          OR up.role ILIKE '%administrator%'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND (
          up.role ILIKE '%admin%'
          OR up.role ILIKE '%pastor%'
          OR up.role ILIKE '%administrator%'
        )
    )
  );

CREATE POLICY "Allow admin/pastor delete first_timers"
  ON first_timers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
        AND (
          up.role ILIKE '%admin%'
          OR up.role ILIKE '%pastor%'
          OR up.role ILIKE '%administrator%'
        )
    )
  );
