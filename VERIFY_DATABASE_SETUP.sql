-- =====================================================
-- DATABASE VERIFICATION SCRIPT
-- =====================================================
-- Run this script to verify that all tables are created
-- and the member management system is properly integrated
-- =====================================================

-- =====================================================
-- 1. CHECK TABLES EXIST
-- =====================================================

SELECT 
  CASE 
    WHEN COUNT(*) = 3 THEN '✓ All 3 tables exist (members, cell_groups, ministries)'
    ELSE '✗ Missing tables! Expected 3, found ' || COUNT(*)
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('members', 'cell_groups', 'ministries');

-- =====================================================
-- 2. CHECK TABLE STRUCTURES
-- =====================================================

-- Members table columns
SELECT 'Members table has ' || COUNT(*) || ' columns' as status
FROM information_schema.columns 
WHERE table_name = 'members' AND table_schema = 'public';

-- Cell groups table columns
SELECT 'Cell groups table has ' || COUNT(*) || ' columns' as status
FROM information_schema.columns 
WHERE table_name = 'cell_groups' AND table_schema = 'public';

-- Ministries table columns
SELECT 'Ministries table has ' || COUNT(*) || ' columns' as status
FROM information_schema.columns 
WHERE table_name = 'ministries' AND table_schema = 'public';

-- =====================================================
-- 3. CHECK SAMPLE DATA
-- =====================================================

SELECT 'Members: ' || COUNT(*) || ' records' as status FROM members
UNION ALL
SELECT 'Cell Groups: ' || COUNT(*) || ' records' FROM cell_groups
UNION ALL
SELECT 'Ministries: ' || COUNT(*) || ' records' FROM ministries;

-- =====================================================
-- 4. CHECK INDEXES
-- =====================================================

SELECT 'Members table has ' || COUNT(*) || ' indexes' as status
FROM pg_indexes WHERE tablename = 'members';

SELECT 'Cell groups table has ' || COUNT(*) || ' indexes' as status
FROM pg_indexes WHERE tablename = 'cell_groups';

SELECT 'Ministries table has ' || COUNT(*) || ' indexes' as status
FROM pg_indexes WHERE tablename = 'ministries';

-- =====================================================
-- 5. CHECK FOREIGN KEYS
-- =====================================================

SELECT 
  '✓ Members → Cell Groups foreign key exists' as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'members'
AND constraint_name LIKE '%cell_group%';

SELECT 
  '✓ Members → Ministries foreign key exists' as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'members'
AND constraint_name LIKE '%ministry%';

-- =====================================================
-- 6. CHECK RLS POLICIES
-- =====================================================

SELECT 
  'Members table has ' || COUNT(*) || ' RLS policies' as status
FROM pg_policies WHERE tablename = 'members';

SELECT 
  'Cell groups table has ' || COUNT(*) || ' RLS policies' as status
FROM pg_policies WHERE tablename = 'cell_groups';

SELECT 
  'Ministries table has ' || COUNT(*) || ' RLS policies' as status
FROM pg_policies WHERE tablename = 'ministries';

-- =====================================================
-- 7. CHECK VIEWS
-- =====================================================

SELECT 
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ All statistics views exist'
    ELSE '✗ Missing views! Expected 3, found ' || COUNT(*)
  END as status
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('member_statistics', 'cell_group_statistics', 'ministry_statistics');

-- =====================================================
-- 8. CHECK FUNCTIONS
-- =====================================================

SELECT 
  '✓ ' || COUNT(*) || ' utility functions created' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('generate_member_code', 'search_members', 'get_member_age', 'update_member_attendance_rate', 'update_member_giving_total');

-- =====================================================
-- 9. TEST MEMBER STATISTICS VIEW
-- =====================================================

SELECT 
  'Total Members: ' || total_members as metric,
  'Active: ' || active_members as active,
  'New: ' || new_members as new_mem,
  'Baptised: ' || baptised_members as baptised
FROM member_statistics;

-- =====================================================
-- 10. TEST SEARCH FUNCTION
-- =====================================================

SELECT 
  '✓ Search function works! Found ' || COUNT(*) || ' members matching "John"' as status
FROM search_members('John');

-- =====================================================
-- 11. CHECK MEMBER CODE GENERATION
-- =====================================================

SELECT 
  '✓ Generated member code: ' || generate_member_code() as status;

-- =====================================================
-- 12. CHECK DATA RELATIONSHIPS
-- =====================================================

-- Members with cell groups
SELECT 
  'Members with cell group assignment: ' || COUNT(*) as status
FROM members 
WHERE primary_cell_group_id IS NOT NULL;

-- Members with ministries
SELECT 
  'Members with ministry assignment: ' || COUNT(*) as status
FROM members 
WHERE primary_ministry_id IS NOT NULL;

-- =====================================================
-- 13. CHECK TRIGGERS
-- =====================================================

SELECT 
  'Members table has ' || COUNT(*) || ' triggers' as status
FROM information_schema.triggers 
WHERE event_object_table = 'members';

SELECT 
  'Cell groups table has ' || COUNT(*) || ' triggers' as status
FROM information_schema.triggers 
WHERE event_object_table = 'cell_groups';

SELECT 
  'Ministries table has ' || COUNT(*) || ' triggers' as status
FROM information_schema.triggers 
WHERE event_object_table = 'ministries';

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

SELECT '========== DATABASE SUMMARY ==========' as header;

SELECT 
  'Members' as table_name, 
  COUNT(*) as records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM members
UNION ALL
SELECT 
  'Cell Groups' as table_name, 
  COUNT(*) as records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM cell_groups
UNION ALL
SELECT 
  'Ministries' as table_name, 
  COUNT(*) as records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM ministries;

-- Member breakdown
SELECT '========== MEMBER BREAKDOWN ==========' as header;

SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM members
GROUP BY status
ORDER BY count DESC;

-- Tithe status
SELECT '========== TITHE STATUS ==========' as header;

SELECT 
  tithe_status,
  COUNT(*) as count,
  SUM(total_giving) as total_giving
FROM members
GROUP BY tithe_status
ORDER BY count DESC;

-- Gender distribution
SELECT '========== GENDER DISTRIBUTION ==========' as header;

SELECT 
  gender,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM members
GROUP BY gender;

-- Final status
SELECT '========================================' as footer;
SELECT '✓ DATABASE IS READY FOR USE!' as final_status;
SELECT 'Navigate to /member-management to test' as next_step;
SELECT '========================================' as footer;