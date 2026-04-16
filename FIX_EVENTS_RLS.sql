-- =====================================================
-- Fix Events Table RLS Policies
-- =====================================================
-- The events table policies require 'authenticated' role
-- but the app uses the anon key. This fixes all tables
-- to allow anon access (consistent with other tables).
-- =====================================================

-- Drop existing restrictive policies on events
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON events;

-- Re-create policies allowing anon + authenticated access
CREATE POLICY "Allow public read events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete events"
  ON events FOR DELETE
  USING (true);

-- =====================================================
-- Also fix attendance table if it has the same issue
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users to read attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to delete attendance" ON attendance;

CREATE POLICY "Allow public read attendance"
  ON attendance FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update attendance"
  ON attendance FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete attendance"
  ON attendance FOR DELETE
  USING (true);

-- =====================================================
-- Verify
-- =====================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('events', 'attendance')
ORDER BY tablename, cmd;
