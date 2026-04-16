-- Check the actual columns in attendance_records
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'attendance_records'
ORDER BY ordinal_position;

-- Check RLS policies on it
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'attendance_records'
ORDER BY cmd;
