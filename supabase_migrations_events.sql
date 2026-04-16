-- =====================================================
-- EVENTS MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the events management system
-- for church services, programs, and special events.
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS events CASCADE;

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('Church-wide', 'Youth', 'Women', 'Men', 'Children')),
  status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Draft', 'Completed', 'Cancelled')),
  expected_attendance INTEGER NOT NULL DEFAULT 0 CHECK (expected_attendance >= 0),
  actual_attendance INTEGER CHECK (actual_attendance >= 0),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date ON events(date ASC);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_department ON events(department);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_date_status ON events(date ASC, status);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Policy: Allow authenticated users to read all events
CREATE POLICY "Allow authenticated users to read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert events
CREATE POLICY "Allow authenticated users to insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update events
CREATE POLICY "Allow authenticated users to update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete events
CREATE POLICY "Allow authenticated users to delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

INSERT INTO events (title, date, time, location, department, status, expected_attendance, actual_attendance, notes, created_by) VALUES
  ('Sunday Worship Service', '2026-04-19', '08:00', 'Main Auditorium', 'Church-wide', 'Scheduled', 1100, NULL, NULL, 'Admin'),
  ('Sunday Worship Service', '2026-04-26', '08:00', 'Main Auditorium', 'Church-wide', 'Scheduled', 1100, NULL, NULL, 'Admin'),
  ('Midweek Teaching Service', '2026-04-22', '18:30', 'Main Auditorium', 'Church-wide', 'Scheduled', 420, NULL, NULL, 'Admin'),
  ('Midweek Teaching Service', '2026-04-29', '18:30', 'Main Auditorium', 'Church-wide', 'Scheduled', 420, NULL, 'Admin'),
  ('Youth Encounter Night', '2026-04-25', '19:00', 'Chapel Hall', 'Youth', 'Draft', 250, NULL, 'Confirm sound team & livestream', 'Admin'),
  ('Women of Virtue Prayer', '2026-04-17', '05:30', 'Prayer Room', 'Women', 'Scheduled', 180, NULL, NULL, 'Admin'),
  ('Women of Virtue Prayer', '2026-04-24', '05:30', 'Prayer Room', 'Women', 'Scheduled', 180, NULL, NULL, 'Admin'),
  ('Men''s Fellowship Breakfast', '2026-04-20', '07:00', 'Fellowship Hall', 'Men', 'Scheduled', 120, NULL, 'Bring your Bible', 'Admin'),
  ('Children''s Ministry Training', '2026-04-18', '14:00', 'Children''s Wing', 'Children', 'Scheduled', 45, NULL, NULL, 'Admin'),
  ('Cell Leaders Training', '2026-04-12', '15:00', 'Conference Room', 'Church-wide', 'Completed', 90, 87, 'Great turnout!', 'Admin'),
  ('Easter Celebration Service', '2026-04-13', '08:00', 'Main Auditorium', 'Church-wide', 'Completed', 1200, 1044, 'Easter celebration', 'Admin'),
  ('Youth Conference', '2026-03-20', '19:00', 'Main Auditorium', 'Youth', 'Completed', 300, 250, 'Youth Conference', 'Admin'),
  ('Marriage Seminar', '2026-02-20', '18:00', 'Main Auditorium', 'Church-wide', 'Completed', 200, 180, 'Marriage Seminar', 'Admin'),
  ('Harvest Thanksgiving', '2026-05-10', '08:00', 'Main Auditorium', 'Church-wide', 'Scheduled', 1300, NULL, 'Annual harvest celebration', 'Admin'),
  ('Youth Camp 2026', '2026-06-15', '09:00', 'Camp Grounds', 'Youth', 'Draft', 400, NULL, 'Need to confirm venue booking', 'Admin'),
  ('Women''s Conference', '2026-05-25', '09:00', 'Main Auditorium', 'Women', 'Scheduled', 500, NULL, 'Theme: Daughters of Destiny', 'Admin'),
  ('Men''s Retreat', '2026-07-05', '08:00', 'Retreat Center', 'Men', 'Draft', 200, NULL, 'Weekend retreat', 'Admin'),
  ('Children''s Fun Day', '2026-05-01', '10:00', 'Church Grounds', 'Children', 'Scheduled', 300, NULL, 'Games, food, and prizes', 'Admin'),
  ('Evangelism Outreach', '2026-04-30', '14:00', 'Community Center', 'Church-wide', 'Scheduled', 150, NULL, 'Door-to-door outreach', 'Admin'),
  ('Prayer Vigil', '2026-05-15', '22:00', 'Main Auditorium', 'Church-wide', 'Scheduled', 250, NULL, 'All-night prayer', 'Admin');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Events by department
CREATE OR REPLACE VIEW events_by_department AS
SELECT 
  department,
  COUNT(*) as event_count,
  SUM(expected_attendance) as total_expected,
  SUM(actual_attendance) as total_actual,
  ROUND(AVG(expected_attendance)) as avg_expected
FROM events
GROUP BY department
ORDER BY event_count DESC;

-- View: Events by status
CREATE OR REPLACE VIEW events_by_status AS
SELECT 
  status,
  COUNT(*) as event_count,
  SUM(expected_attendance) as total_expected,
  SUM(actual_attendance) as total_actual
FROM events
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'Scheduled' THEN 1
    WHEN 'Draft' THEN 2
    WHEN 'Completed' THEN 3
    WHEN 'Cancelled' THEN 4
  END;

-- View: Upcoming events (next 30 days)
CREATE OR REPLACE VIEW upcoming_events AS
SELECT *
FROM events
WHERE date >= CURRENT_DATE
  AND date <= CURRENT_DATE + INTERVAL '30 days'
  AND status = 'Scheduled'
ORDER BY date ASC, time ASC;

-- View: Monthly event summary
CREATE OR REPLACE VIEW monthly_event_summary AS
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as event_count,
  SUM(expected_attendance) as total_expected,
  SUM(actual_attendance) as total_actual,
  COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled_count
FROM events
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- View: Event attendance accuracy (completed events only)
CREATE OR REPLACE VIEW event_attendance_accuracy AS
SELECT 
  id,
  title,
  date,
  department,
  expected_attendance,
  actual_attendance,
  CASE 
    WHEN actual_attendance IS NOT NULL AND expected_attendance > 0 
    THEN ROUND(((actual_attendance::NUMERIC / expected_attendance) * 100), 2)
    ELSE NULL
  END as accuracy_percentage,
  CASE 
    WHEN actual_attendance IS NOT NULL 
    THEN actual_attendance - expected_attendance
    ELSE NULL
  END as variance
FROM events
WHERE status = 'Completed'
  AND actual_attendance IS NOT NULL
ORDER BY date DESC;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function: Get events for a specific month
CREATE OR REPLACE FUNCTION get_events_by_month(
  target_year INTEGER,
  target_month INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  date DATE,
  time TEXT,
  location TEXT,
  department TEXT,
  status TEXT,
  expected_attendance INTEGER,
  actual_attendance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.date,
    e.time,
    e.location,
    e.department,
    e.status,
    e.expected_attendance,
    e.actual_attendance
  FROM events e
  WHERE EXTRACT(YEAR FROM e.date) = target_year
    AND EXTRACT(MONTH FROM e.date) = target_month
  ORDER BY e.date ASC, e.time ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get event statistics for a date range
CREATE OR REPLACE FUNCTION get_event_statistics(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_events BIGINT,
  scheduled_events BIGINT,
  completed_events BIGINT,
  draft_events BIGINT,
  cancelled_events BIGINT,
  total_expected BIGINT,
  total_actual BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'Scheduled' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'Draft' THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)::BIGINT,
    SUM(expected_attendance)::BIGINT,
    SUM(actual_attendance)::BIGINT
  FROM events
  WHERE date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function: Get department event summary
CREATE OR REPLACE FUNCTION get_department_summary(
  target_department TEXT
)
RETURNS TABLE (
  total_events BIGINT,
  upcoming_events BIGINT,
  completed_events BIGINT,
  total_expected BIGINT,
  total_actual BIGINT,
  avg_attendance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN status = 'Scheduled' AND date >= CURRENT_DATE THEN 1 END)::BIGINT,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END)::BIGINT,
    SUM(expected_attendance)::BIGINT,
    SUM(actual_attendance)::BIGINT,
    ROUND(AVG(actual_attendance), 2)
  FROM events
  WHERE department = target_department;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 'Events table created successfully' as status;

-- Show sample data count
SELECT COUNT(*) as sample_records FROM events;

-- Show indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'events';

-- Show policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events';

-- Show views
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%event%';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The events module is now ready for use!
-- 
-- Next steps:
-- 1. Verify the data in the events table
-- 2. Test the views and functions
-- 3. Update the frontend to use the new database layer
-- =====================================================
