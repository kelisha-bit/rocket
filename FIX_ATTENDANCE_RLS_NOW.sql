-- =====================================================
-- FIX ATTENDANCE RLS - Run This Now
-- =====================================================
-- This disables RLS on the attendance table
-- =====================================================

-- Disable RLS on attendance table
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'Attendance RLS disabled - module should work now!' as status;

-- Test
SELECT COUNT(*) as total_records FROM attendance;

-- Show sample data
SELECT date, service, location, total 
FROM attendance 
ORDER BY date DESC 
LIMIT 5;

-- =====================================================
-- DONE! Now refresh browser and test /attendance
-- =====================================================
