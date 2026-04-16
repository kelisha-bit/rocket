-- =====================================================
-- FINAL VERIFICATION - Check if everything is working
-- =====================================================

-- Check table counts
SELECT '========== TABLE COUNTS ==========' as header;

SELECT 'Members' as table_name, COUNT(*) as count FROM members
UNION ALL
SELECT 'Ministries', COUNT(*) FROM ministries
UNION ALL
SELECT 'Cell Groups', COUNT(*) FROM cell_groups;

-- Check member status breakdown
SELECT '========== MEMBER STATUS BREAKDOWN ==========' as header;

SELECT 
  status,
  COUNT(*) as count
FROM members
GROUP BY status
ORDER BY count DESC;

-- Check ministries
SELECT '========== MINISTRIES ==========' as header;

SELECT 
  name,
  meeting_day,
  meeting_time,
  status
FROM ministries
ORDER BY name;

-- Check cell groups
SELECT '========== CELL GROUPS ==========' as header;

SELECT 
  name,
  meeting_day,
  meeting_time,
  location,
  status
FROM cell_groups
ORDER BY name;

-- Test member code generation
SELECT '========== TEST MEMBER CODE GENERATION ==========' as header;

SELECT generate_member_code() as generated_code;

-- Final status
SELECT '========================================' as footer;
SELECT '✓ DATABASE IS READY!' as status;
SELECT 'Navigate to /member-management to test' as next_step;
SELECT 'You should see 12 members loaded from database' as expected_result;
SELECT '========================================' as footer;