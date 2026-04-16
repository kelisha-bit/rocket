-- =====================================================
-- MEMBER ATTENDANCE MODULE - DATABASE MIGRATION
-- =====================================================
-- Creates the member_attendance table that links
-- individual members to specific attendance records,
-- enabling per-member attendance tracking.
-- =====================================================

-- Create member_attendance table
CREATE TABLE IF NOT EXISTS member_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('Sunday Service', 'Midweek Service', 'Cell Group', 'Special Event', 'Prayer Meeting')),
  present BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prevent duplicate check-ins for the same member on the same date+service
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_attendance_unique
  ON member_attendance(member_id, date, service);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_member_attendance_member_id ON member_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_date ON member_attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_member_attendance_service ON member_attendance(service);
CREATE INDEX IF NOT EXISTS idx_member_attendance_attendance_id ON member_attendance(attendance_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_present ON member_attendance(present);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_member_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_attendance_updated_at ON member_attendance;
CREATE TRIGGER trigger_update_member_attendance_updated_at
  BEFORE UPDATE ON member_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_member_attendance_updated_at();

-- Enable Row Level Security
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read member_attendance"
  ON member_attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert member_attendance"
  ON member_attendance FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update member_attendance"
  ON member_attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete member_attendance"
  ON member_attendance FOR DELETE TO authenticated USING (true);

-- =====================================================
-- VIEW: Member attendance with member details
-- =====================================================
CREATE OR REPLACE VIEW member_attendance_details AS
SELECT
  ma.id,
  ma.member_id,
  m.full_name,
  m.member_code,
  m.photo_url,
  m.gender,
  m.status AS member_status,
  ma.attendance_id,
  ma.date,
  ma.service,
  ma.present,
  ma.notes,
  ma.recorded_by,
  ma.created_at
FROM member_attendance ma
JOIN members m ON m.id = ma.member_id
ORDER BY ma.date DESC, m.full_name;

-- =====================================================
-- VIEW: Member attendance rate summary
-- =====================================================
CREATE OR REPLACE VIEW member_attendance_summary AS
SELECT
  m.id AS member_id,
  m.full_name,
  m.member_code,
  m.photo_url,
  m.status AS member_status,
  COUNT(ma.id) AS total_sessions,
  SUM(CASE WHEN ma.present THEN 1 ELSE 0 END) AS sessions_attended,
  ROUND(
    (SUM(CASE WHEN ma.present THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(ma.id), 0)) * 100
  ) AS attendance_rate,
  MAX(CASE WHEN ma.present THEN ma.date END) AS last_attended
FROM members m
LEFT JOIN member_attendance ma ON ma.member_id = m.id
GROUP BY m.id, m.full_name, m.member_code, m.photo_url, m.status
ORDER BY m.full_name;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'member_attendance table created successfully' AS status;
SELECT COUNT(*) AS member_attendance_records FROM member_attendance;
