-- =====================================================
-- ATTENDANCE MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the attendance tracking system
-- for church services, cell groups, and special events.
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS attendance CASCADE;

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('Sunday Service', 'Midweek Service', 'Cell Group', 'Special Event', 'Prayer Meeting')),
  location TEXT NOT NULL,
  total INTEGER NOT NULL CHECK (total >= 0),
  men INTEGER NOT NULL DEFAULT 0 CHECK (men >= 0),
  women INTEGER NOT NULL DEFAULT 0 CHECK (women >= 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  first_timers INTEGER NOT NULL DEFAULT 0 CHECK (first_timers >= 0),
  visitors INTEGER NOT NULL DEFAULT 0 CHECK (visitors >= 0),
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_date ON attendance(date DESC);
CREATE INDEX idx_attendance_service ON attendance(service);
CREATE INDEX idx_attendance_created_at ON attendance(created_at DESC);
CREATE INDEX idx_attendance_date_service ON attendance(date DESC, service);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Policy: Allow authenticated users to read all attendance records
CREATE POLICY "Allow authenticated users to read attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert attendance records
CREATE POLICY "Allow authenticated users to insert attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update attendance records
CREATE POLICY "Allow authenticated users to update attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete attendance records
CREATE POLICY "Allow authenticated users to delete attendance"
  ON attendance
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

INSERT INTO attendance (date, service, location, total, men, women, children, first_timers, visitors, notes, recorded_by) VALUES
  ('2026-04-13', 'Sunday Service', 'Main Auditorium', 1044, 420, 480, 144, 42, 28, 'Easter celebration', 'Admin'),
  ('2026-04-12', 'Cell Group', 'Various Zones', 626, 250, 280, 96, 14, 8, 'Zone leaders meeting afterwards', 'Admin'),
  ('2026-04-09', 'Midweek Service', 'Main Auditorium', 392, 156, 180, 56, 9, 5, NULL, 'Admin'),
  ('2026-04-06', 'Sunday Service', 'Main Auditorium', 1007, 405, 460, 142, 38, 25, 'Communion Sunday', 'Admin'),
  ('2026-04-03', 'Prayer Meeting', 'Prayer Hall', 156, 62, 70, 24, 3, 2, NULL, 'Admin'),
  ('2026-03-30', 'Sunday Service', 'Main Auditorium', 975, 390, 445, 140, 31, 22, NULL, 'Admin'),
  ('2026-03-26', 'Midweek Service', 'Main Auditorium', 380, 152, 175, 53, 7, 4, NULL, 'Admin'),
  ('2026-03-23', 'Sunday Service', 'Main Auditorium', 1012, 408, 465, 139, 35, 24, NULL, 'Admin'),
  ('2026-03-20', 'Special Event', 'Main Auditorium', 1250, 500, 570, 180, 65, 45, 'Youth Conference', 'Admin'),
  ('2026-03-16', 'Sunday Service', 'Main Auditorium', 968, 387, 442, 139, 29, 20, NULL, 'Admin'),
  ('2026-03-13', 'Prayer Meeting', 'Prayer Hall', 142, 58, 65, 19, 2, 1, NULL, 'Admin'),
  ('2026-03-09', 'Sunday Service', 'Main Auditorium', 995, 398, 452, 145, 33, 21, NULL, 'Admin'),
  ('2026-03-05', 'Midweek Service', 'Main Auditorium', 375, 150, 172, 53, 8, 5, NULL, 'Admin'),
  ('2026-03-02', 'Sunday Service', 'Main Auditorium', 1020, 410, 465, 145, 36, 23, NULL, 'Admin'),
  ('2026-02-27', 'Cell Group', 'Various Zones', 610, 245, 270, 95, 12, 7, NULL, 'Admin'),
  ('2026-02-23', 'Sunday Service', 'Main Auditorium', 988, 395, 448, 145, 32, 22, NULL, 'Admin'),
  ('2026-02-20', 'Special Event', 'Main Auditorium', 1180, 472, 538, 170, 58, 38, 'Marriage Seminar', 'Admin'),
  ('2026-02-16', 'Sunday Service', 'Main Auditorium', 972, 389, 443, 140, 30, 20, NULL, 'Admin'),
  ('2026-02-12', 'Midweek Service', 'Main Auditorium', 368, 147, 169, 52, 7, 4, NULL, 'Admin'),
  ('2026-02-09', 'Sunday Service', 'Main Auditorium', 1005, 402, 458, 145, 35, 24, NULL, 'Admin');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Attendance summary by service type
CREATE OR REPLACE VIEW attendance_by_service AS
SELECT 
  service,
  COUNT(*) as service_count,
  SUM(total) as total_attendance,
  ROUND(AVG(total)) as avg_attendance,
  SUM(first_timers) as total_first_timers,
  SUM(visitors) as total_visitors,
  SUM(men) as total_men,
  SUM(women) as total_women,
  SUM(children) as total_children
FROM attendance
GROUP BY service
ORDER BY total_attendance DESC;

-- View: Monthly attendance summary
CREATE OR REPLACE VIEW monthly_attendance_summary AS
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as service_count,
  SUM(total) as total_attendance,
  ROUND(AVG(total)) as avg_attendance,
  SUM(first_timers) as total_first_timers,
  SUM(visitors) as total_visitors
FROM attendance
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- View: Recent attendance records (last 30 days)
CREATE OR REPLACE VIEW recent_attendance AS
SELECT *
FROM attendance
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- View: Sunday service attendance trend
CREATE OR REPLACE VIEW sunday_service_trend AS
SELECT 
  date,
  total,
  first_timers,
  visitors,
  LAG(total) OVER (ORDER BY date) as previous_total,
  ROUND(((total - LAG(total) OVER (ORDER BY date))::NUMERIC / NULLIF(LAG(total) OVER (ORDER BY date), 0)) * 100, 2) as growth_percentage
FROM attendance
WHERE service = 'Sunday Service'
ORDER BY date DESC;

-- View: Demographics breakdown
CREATE OR REPLACE VIEW demographics_breakdown AS
SELECT 
  date,
  service,
  total,
  men,
  women,
  children,
  ROUND((men::NUMERIC / NULLIF(total, 0)) * 100, 1) as men_percentage,
  ROUND((women::NUMERIC / NULLIF(total, 0)) * 100, 1) as women_percentage,
  ROUND((children::NUMERIC / NULLIF(total, 0)) * 100, 1) as children_percentage
FROM attendance
ORDER BY date DESC;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function: Get attendance summary for a date range
CREATE OR REPLACE FUNCTION get_attendance_summary(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_attendance BIGINT,
  total_first_timers BIGINT,
  total_visitors BIGINT,
  avg_attendance NUMERIC,
  service_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(a.total)::BIGINT,
    SUM(a.first_timers)::BIGINT,
    SUM(a.visitors)::BIGINT,
    ROUND(AVG(a.total)),
    COUNT(*)::BIGINT
  FROM attendance a
  WHERE a.date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function: Get service type breakdown for a date range
CREATE OR REPLACE FUNCTION get_service_breakdown(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  service TEXT,
  service_count BIGINT,
  total_attendance BIGINT,
  avg_attendance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.service,
    COUNT(*)::BIGINT,
    SUM(a.total)::BIGINT,
    ROUND(AVG(a.total))
  FROM attendance a
  WHERE a.date BETWEEN start_date AND end_date
  GROUP BY a.service
  ORDER BY SUM(a.total) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate growth trend
CREATE OR REPLACE FUNCTION calculate_attendance_trend(
  current_start DATE,
  current_end DATE,
  previous_start DATE,
  previous_end DATE
)
RETURNS TABLE (
  current_total BIGINT,
  previous_total BIGINT,
  growth_percentage NUMERIC
) AS $$
DECLARE
  curr_total BIGINT;
  prev_total BIGINT;
BEGIN
  SELECT SUM(total) INTO curr_total FROM attendance WHERE date BETWEEN current_start AND current_end;
  SELECT SUM(total) INTO prev_total FROM attendance WHERE date BETWEEN previous_start AND previous_end;
  
  RETURN QUERY
  SELECT 
    COALESCE(curr_total, 0),
    COALESCE(prev_total, 0),
    CASE 
      WHEN prev_total > 0 THEN ROUND(((curr_total - prev_total)::NUMERIC / prev_total) * 100, 2)
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 'Attendance table created successfully' as status;

-- Show sample data count
SELECT COUNT(*) as sample_records FROM attendance;

-- Show indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'attendance';

-- Show policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'attendance';

-- Show views
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%attendance%';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The attendance module is now ready for use!
-- 
-- Next steps:
-- 1. Verify the data in the attendance table
-- 2. Test the views and functions
-- 3. Update the frontend to use the new database layer
-- =====================================================
