-- =====================================================
-- QUICK DIAGNOSTIC SCRIPT
-- =====================================================
-- Run this to check if tables exist and their structure
-- =====================================================

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('members', 'cell_groups', 'ministries') THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('members', 'cell_groups', 'ministries')
ORDER BY table_name;

-- If ministries table exists, show its columns
SELECT 
  'MINISTRIES TABLE COLUMNS:' as info;
  
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ministries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If members table exists, show its columns
SELECT 
  'MEMBERS TABLE COLUMNS:' as info;
  
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If cell_groups table exists, show its columns
SELECT 
  'CELL_GROUPS TABLE COLUMNS:' as info;
  
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cell_groups' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count records in each table
SELECT 
  'RECORD COUNTS:' as info;
  
SELECT 'members' as table_name, COUNT(*) as count FROM members
UNION ALL
SELECT 'ministries', COUNT(*) FROM ministries
UNION ALL
SELECT 'cell_groups', COUNT(*) FROM cell_groups;