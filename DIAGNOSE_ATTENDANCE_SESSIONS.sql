-- Check attendance_sessions columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'attendance_sessions'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('attendance_sessions', 'attendance_records')
ORDER BY tablename, cmd;

-- Sample data to understand the shape
SELECT * FROM attendance_sessions LIMIT 3;
