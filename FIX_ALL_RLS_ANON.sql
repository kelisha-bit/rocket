-- =====================================================
-- Fix ALL Table RLS Policies for Anon Key Access
-- =====================================================
-- Run this in Supabase SQL Editor.
-- Drops all "authenticated only" policies and replaces
-- them with policies that work with the anon key.
-- =====================================================

-- ─── EVENTS ──────────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON events;
DROP POLICY IF EXISTS "Allow public read events" ON events;
DROP POLICY IF EXISTS "Allow public insert events" ON events;
DROP POLICY IF EXISTS "Allow public update events" ON events;
DROP POLICY IF EXISTS "Allow public delete events" ON events;

CREATE POLICY "anon_read_events"   ON events FOR SELECT USING (true);
CREATE POLICY "anon_insert_events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_events" ON events FOR DELETE USING (true);

-- ─── ATTENDANCE ──────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to delete attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public read attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public update attendance" ON attendance;
DROP POLICY IF EXISTS "Allow public delete attendance" ON attendance;

CREATE POLICY "anon_read_attendance"   ON attendance FOR SELECT USING (true);
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE USING (true);

-- ─── GIVING_TRANSACTIONS ─────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow public read giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow public insert giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow public update giving_transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow public delete giving_transactions" ON giving_transactions;
-- Also drop any variant names
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON giving_transactions;

CREATE POLICY "anon_read_giving"   ON giving_transactions FOR SELECT USING (true);
CREATE POLICY "anon_insert_giving" ON giving_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_giving" ON giving_transactions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_giving" ON giving_transactions FOR DELETE USING (true);

-- ─── MEMBERS ─────────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to insert members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to update members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to delete members" ON members;
DROP POLICY IF EXISTS "Allow public read members" ON members;
DROP POLICY IF EXISTS "Allow public insert members" ON members;
DROP POLICY IF EXISTS "Allow public update members" ON members;
DROP POLICY IF EXISTS "Allow public delete members" ON members;

CREATE POLICY "anon_read_members"   ON members FOR SELECT USING (true);
CREATE POLICY "anon_insert_members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_members" ON members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_members" ON members FOR DELETE USING (true);

-- ─── MINISTRIES ──────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read ministries" ON ministries;
DROP POLICY IF EXISTS "Allow authenticated users to insert ministries" ON ministries;
DROP POLICY IF EXISTS "Allow authenticated users to update ministries" ON ministries;
DROP POLICY IF EXISTS "Allow authenticated users to delete ministries" ON ministries;
DROP POLICY IF EXISTS "Allow public read ministries" ON ministries;
DROP POLICY IF EXISTS "Allow public insert ministries" ON ministries;
DROP POLICY IF EXISTS "Allow public update ministries" ON ministries;
DROP POLICY IF EXISTS "Allow public delete ministries" ON ministries;

CREATE POLICY "anon_read_ministries"   ON ministries FOR SELECT USING (true);
CREATE POLICY "anon_insert_ministries" ON ministries FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_ministries" ON ministries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ministries" ON ministries FOR DELETE USING (true);

-- ─── CELL_GROUPS ─────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated users to read cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow authenticated users to insert cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow authenticated users to update cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow authenticated users to delete cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow public read cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow public insert cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow public update cell_groups" ON cell_groups;
DROP POLICY IF EXISTS "Allow public delete cell_groups" ON cell_groups;

CREATE POLICY "anon_read_cell_groups"   ON cell_groups FOR SELECT USING (true);
CREATE POLICY "anon_insert_cell_groups" ON cell_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_cell_groups" ON cell_groups FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_cell_groups" ON cell_groups FOR DELETE USING (true);

-- ─── VERIFY ──────────────────────────────────────────
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('events','attendance','giving_transactions','members','ministries','cell_groups')
ORDER BY tablename, cmd;
