-- =====================================================
-- FIX: member_attendance 400 errors
-- =====================================================
-- Run this in your Supabase SQL editor to fix the
-- 400 errors on member_attendance queries.
-- =====================================================

-- Step 1: Create the table if it doesn't exist
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

-- Step 2: Add unique constraint if missing
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_attendance_unique
  ON member_attendance(member_id, date, service);

-- Step 3: Add indexes
CREATE INDEX IF NOT EXISTS idx_member_attendance_member_id ON member_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_date ON member_attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_member_attendance_service ON member_attendance(service);

-- Step 4: Enable RLS
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies and recreate with BOTH anon + authenticated access
DROP POLICY IF EXISTS "Allow authenticated users to read member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to delete member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow anon to read member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow anon to insert member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow anon to update member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "Allow anon to delete member_attendance" ON member_attendance;

-- Allow both anon and authenticated roles
CREATE POLICY "Allow read member_attendance"
  ON member_attendance FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert member_attendance"
  ON member_attendance FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update member_attendance"
  ON member_attendance FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete member_attendance"
  ON member_attendance FOR DELETE
  TO anon, authenticated
  USING (true);

-- Step 6: Verify
SELECT 'member_attendance table ready' AS status;
SELECT COUNT(*) AS record_count FROM member_attendance;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'member_attendance';
