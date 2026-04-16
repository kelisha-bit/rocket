-- =====================================================
-- Diagnose & Fix Events Table Column Names
-- =====================================================
-- Step 1: Check what columns actually exist
-- =====================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- Step 2: If the table has wrong column names (e.g.
-- event_date instead of date), run the rename below.
-- Only run the ALTER statements that apply to your table.
-- =====================================================

-- If column is named 'event_date' instead of 'date':
-- ALTER TABLE events RENAME COLUMN event_date TO date;

-- If column is named 'event_time' instead of 'time':
-- ALTER TABLE events RENAME COLUMN event_time TO time;

-- If column is named 'venue' instead of 'location':
-- ALTER TABLE events RENAME COLUMN venue TO location;

-- If column is named 'attendance_expected' instead of 'expected_attendance':
-- ALTER TABLE events RENAME COLUMN attendance_expected TO expected_attendance;

-- If column is named 'attendance_actual' instead of 'actual_attendance':
-- ALTER TABLE events RENAME COLUMN attendance_actual TO actual_attendance;

-- =====================================================
-- Step 3: If the table doesn't exist at all, create it
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '09:00',
  location TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT 'Church-wide'
    CHECK (department IN ('Church-wide', 'Youth', 'Women', 'Men', 'Children')),
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Scheduled', 'Draft', 'Completed', 'Cancelled')),
  expected_attendance INTEGER NOT NULL DEFAULT 0,
  actual_attendance INTEGER,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with open policies (anon key access)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_events"   ON events;
DROP POLICY IF EXISTS "anon_insert_events" ON events;
DROP POLICY IF EXISTS "anon_update_events" ON events;
DROP POLICY IF EXISTS "anon_delete_events" ON events;

CREATE POLICY "anon_read_events"   ON events FOR SELECT USING (true);
CREATE POLICY "anon_insert_events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_events" ON events FOR DELETE USING (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- Step 4: Verify
-- =====================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;
