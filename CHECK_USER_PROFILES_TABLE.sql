-- Check the current structure of user_profiles table
-- Run this to see what columns currently exist

-- 1. Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles'
    ) 
    THEN 'Table EXISTS' 
    ELSE 'Table DOES NOT EXIST' 
  END AS table_status;

-- 2. List all columns in user_profiles table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- 4. List all policies on user_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- 5. Check for triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'user_profiles';

-- 6. Count existing records
SELECT COUNT(*) AS total_profiles
FROM user_profiles;
