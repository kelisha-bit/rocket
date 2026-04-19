-- =====================================================
-- ADD MINISTRY-SCOPED TRACKING (Option A)
-- =====================================================
-- Adds ministry_id scoping to:
--  - events
--  - attendance_sessions
--  - giving_transactions
-- Creates:
--  - ministry_activities
--
-- This enables each ministry to track its own attendance,
-- contributions, activities, and events.
-- =====================================================

-- 1) events: add ministry_id
ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS ministry_id UUID;

ALTER TABLE IF EXISTS events
  DROP CONSTRAINT IF EXISTS fk_events_ministry_id;

ALTER TABLE IF EXISTS events
  ADD CONSTRAINT fk_events_ministry_id
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_ministry_id ON events(ministry_id);

-- Backfill events.ministry_id using existing department text
UPDATE events e
SET ministry_id = m.id
FROM ministries m
WHERE e.ministry_id IS NULL
  AND (
    (e.department = 'Women' AND m.name ILIKE '%Women%') OR
    (e.department = 'Men' AND m.name ILIKE '%Men%') OR
    (e.department = 'Youth' AND m.name ILIKE '%Youth%') OR
    (e.department = 'Children' AND m.name ILIKE '%Children%') OR
    (e.department = 'Church-wide' AND m.name ILIKE '%Church%')
  );


-- 2) attendance_sessions: add ministry_id
ALTER TABLE IF EXISTS attendance_sessions
  ADD COLUMN IF NOT EXISTS ministry_id UUID;

ALTER TABLE IF EXISTS attendance_sessions
  DROP CONSTRAINT IF EXISTS fk_attendance_sessions_ministry_id;

ALTER TABLE IF EXISTS attendance_sessions
  ADD CONSTRAINT fk_attendance_sessions_ministry_id
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_ministry_id ON attendance_sessions(ministry_id);

-- Replace unique index to be ministry-scoped (ministry_id, type, date)
DROP INDEX IF EXISTS idx_attendance_sessions_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_sessions_unique
  ON attendance_sessions(ministry_id, session_type, session_date);


-- 3) giving_transactions: add ministry_id
ALTER TABLE IF EXISTS giving_transactions
  ADD COLUMN IF NOT EXISTS ministry_id UUID;

ALTER TABLE IF EXISTS giving_transactions
  DROP CONSTRAINT IF EXISTS fk_giving_transactions_ministry_id;

ALTER TABLE IF EXISTS giving_transactions
  ADD CONSTRAINT fk_giving_transactions_ministry_id
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_giving_transactions_ministry_id ON giving_transactions(ministry_id);


-- 4) ministry_activities: create table
CREATE TABLE IF NOT EXISTS ministry_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'event', 'contribution', 'service')),
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  amount DECIMAL(10,2),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ministry_activities_ministry_id ON ministry_activities(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_activities_date ON ministry_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_ministry_activities_type ON ministry_activities(type);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_ministry_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ministry_activities_updated_at ON ministry_activities;
CREATE TRIGGER trigger_update_ministry_activities_updated_at
  BEFORE UPDATE ON ministry_activities
  FOR EACH ROW EXECUTE FUNCTION update_ministry_activities_updated_at();

-- RLS (open access, consistent with the rest of this project)
ALTER TABLE ministry_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_ministry_activities"   ON ministry_activities;
DROP POLICY IF EXISTS "anon_insert_ministry_activities" ON ministry_activities;
DROP POLICY IF EXISTS "anon_update_ministry_activities" ON ministry_activities;
DROP POLICY IF EXISTS "anon_delete_ministry_activities" ON ministry_activities;

CREATE POLICY "anon_read_ministry_activities"   ON ministry_activities FOR SELECT USING (true);
CREATE POLICY "anon_insert_ministry_activities" ON ministry_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_ministry_activities" ON ministry_activities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_ministry_activities" ON ministry_activities FOR DELETE USING (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verification
SELECT '✅ ministry-scoped tracking added' AS status;
