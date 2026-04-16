-- =====================================================
-- Fix RLS on attendance_sessions and attendance_records
-- for anon key access (NEXT_PUBLIC_USE_SUPABASE_AUTH=false)
-- Run in Supabase SQL Editor
-- =====================================================

-- ─── attendance_sessions ─────────────────────────────
DROP POLICY IF EXISTS "anon_read_attendance_sessions"   ON attendance_sessions;
DROP POLICY IF EXISTS "anon_insert_attendance_sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "anon_update_attendance_sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "anon_delete_attendance_sessions" ON attendance_sessions;

-- Drop any authenticated-only variants
DROP POLICY IF EXISTS "Allow authenticated users to read attendance_sessions"   ON attendance_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance_sessions"  ON attendance_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to update attendance_sessions"  ON attendance_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to delete attendance_sessions"  ON attendance_sessions;

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_attendance_sessions"
  ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "anon_insert_attendance_sessions"
  ON attendance_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_attendance_sessions"
  ON attendance_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance_sessions"
  ON attendance_sessions FOR DELETE USING (true);

-- ─── attendance_records ───────────────────────────────
DROP POLICY IF EXISTS "anon_read_attendance_records"   ON attendance_records;
DROP POLICY IF EXISTS "anon_insert_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_update_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_delete_attendance_records" ON attendance_records;

DROP POLICY IF EXISTS "Allow authenticated users to read attendance_records"   ON attendance_records;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance_records"  ON attendance_records;
DROP POLICY IF EXISTS "Allow authenticated users to update attendance_records"  ON attendance_records;
DROP POLICY IF EXISTS "Allow authenticated users to delete attendance_records"  ON attendance_records;

-- Also drop the policy name from the original diagnosis
DROP POLICY IF EXISTS "Authenticated users can manage member attendance" ON attendance_records;

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_attendance_records"
  ON attendance_records FOR SELECT USING (true);
CREATE POLICY "anon_insert_attendance_records"
  ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_attendance_records"
  ON attendance_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance_records"
  ON attendance_records FOR DELETE USING (true);

-- ─── Verify ───────────────────────────────────────────
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('attendance_sessions', 'attendance_records')
ORDER BY tablename, cmd;
