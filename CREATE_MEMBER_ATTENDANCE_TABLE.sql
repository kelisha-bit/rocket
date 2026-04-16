-- =====================================================
-- CREATE member_attendance TABLE + ANON RLS POLICIES
-- =====================================================
-- Run this in the Supabase SQL Editor.
-- Safe to run even if the table already exists.
-- =====================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS member_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES attendance(id) ON DELETE SET NULL,
  date         DATE NOT NULL,
  service      TEXT NOT NULL CHECK (service IN (
                  'Sunday Service', 'Midweek Service', 'Cell Group',
                  'Special Event', 'Prayer Meeting'
               )),
  present      BOOLEAN NOT NULL DEFAULT true,
  notes        TEXT,
  recorded_by  TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Unique constraint: one record per member per date+service
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_attendance_unique
  ON member_attendance(member_id, date, service);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_member_attendance_member_id   ON member_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_date        ON member_attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_member_attendance_service     ON member_attendance(service);
CREATE INDEX IF NOT EXISTS idx_member_attendance_attendance_id ON member_attendance(attendance_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_present     ON member_attendance(present);

-- 4. Auto-update updated_at trigger
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
  FOR EACH ROW EXECUTE FUNCTION update_member_attendance_updated_at();

-- 5. Enable RLS
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;

-- 6. Drop ALL existing policies (both authenticated and anon variants)
DROP POLICY IF EXISTS "Allow authenticated users to read member_attendance"   ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert member_attendance"  ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update member_attendance"  ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to delete member_attendance"  ON member_attendance;
DROP POLICY IF EXISTS "anon_read_member_attendance"   ON member_attendance;
DROP POLICY IF EXISTS "anon_insert_member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "anon_update_member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "anon_delete_member_attendance" ON member_attendance;

-- 7. Create open anon-compatible policies
CREATE POLICY "anon_read_member_attendance"
  ON member_attendance FOR SELECT USING (true);

CREATE POLICY "anon_insert_member_attendance"
  ON member_attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_member_attendance"
  ON member_attendance FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_member_attendance"
  ON member_attendance FOR DELETE USING (true);

-- 8. Verify
SELECT '✅ member_attendance table ready' AS status;

SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'member_attendance'
ORDER BY cmd;
