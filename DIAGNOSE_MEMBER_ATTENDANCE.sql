-- =====================================================
-- DIAGNOSE: Does member_attendance table exist?
-- Run this first to see what's missing.
-- =====================================================

-- 1. Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'member_attendance'
    ) 
    THEN '✅ member_attendance table EXISTS'
    ELSE '❌ member_attendance table DOES NOT EXIST - run CREATE_MEMBER_ATTENDANCE_TABLE.sql'
  END AS table_status;

-- 2. Check ALL columns if table exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'member_attendance'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'member_attendance'
ORDER BY cmd;
