-- =====================================================
-- DIAGNOSE ALL RLS ISSUES
-- =====================================================
-- Run this to see which tables have RLS problems
-- =====================================================

-- Check RLS status on all tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ENABLED'
    ELSE '🔓 RLS DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'giving_transactions',
    'attendance_records',
    'events',
    'members',
    'cell_groups',
    'ministries'
  )
ORDER BY tablename;

-- Check existing policies
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN (
  'giving_transactions',
  'attendance_records',
  'events',
  'members',
  'cell_groups',
  'ministries'
)
ORDER BY tablename, cmd;

-- Check current user and role
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_database() as current_database;

-- Try to count records in each table
SELECT '=== TESTING TABLE ACCESS ===' as test;

SELECT 'giving_transactions' as table_name, COUNT(*) as record_count 
FROM giving_transactions;

SELECT 'attendance_records' as table_name, COUNT(*) as record_count 
FROM attendance_records;

SELECT 'events' as table_name, COUNT(*) as record_count 
FROM events;

SELECT 'members' as table_name, COUNT(*) as record_count 
FROM members;

SELECT 'cell_groups' as table_name, COUNT(*) as record_count 
FROM cell_groups;

SELECT 'ministries' as table_name, COUNT(*) as record_count 
FROM ministries;

-- Summary
SELECT '=== DIAGNOSIS COMPLETE ===' as status;
SELECT 'If you see counts above, tables are accessible' as message;
SELECT 'If you see errors, RLS is blocking access' as message;
SELECT 'Run FIX_ALL_RLS_POLICIES.sql to fix' as solution;
