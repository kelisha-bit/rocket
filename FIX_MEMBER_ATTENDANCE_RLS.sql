-- =====================================================
-- Fix member_attendance RLS Policies for Anon Key Access
-- =====================================================
-- The member_attendance table was created with authenticated-only
-- policies, but the app uses the anon key. This replaces them
-- with open policies that work with the anon key.
--
-- Run this in the Supabase SQL Editor.
-- =====================================================

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Allow authenticated users to read member_attendance"   ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert member_attendance"  ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update member_attendance"  ON member_attendance;
DROP POLICY IF EXISTS "Allow authenticated users to delete member_attendance"  ON member_attendance;

-- Drop any previously attempted anon policies (idempotent)
DROP POLICY IF EXISTS "anon_read_member_attendance"   ON member_attendance;
DROP POLICY IF EXISTS "anon_insert_member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "anon_update_member_attendance" ON member_attendance;
DROP POLICY IF EXISTS "anon_delete_member_attendance" ON member_attendance;

-- Create open policies that work with the anon key
CREATE POLICY "anon_read_member_attendance"
  ON member_attendance FOR SELECT USING (true);

CREATE POLICY "anon_insert_member_attendance"
  ON member_attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_member_attendance"
  ON member_attendance FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_member_attendance"
  ON member_attendance FOR DELETE USING (true);

-- Verify
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'member_attendance'
ORDER BY cmd;
