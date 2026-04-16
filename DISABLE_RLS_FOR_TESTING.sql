-- =====================================================
-- TEMPORARY: DISABLE RLS FOR TESTING
-- =====================================================
-- ⚠️ WARNING: This disables security for testing only!
-- ⚠️ DO NOT use this in production!
-- =====================================================

-- Option 1: Disable RLS completely (for testing only)
ALTER TABLE giving_transactions DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled - table is now fully accessible' as status;

-- =====================================================
-- TO RE-ENABLE RLS LATER:
-- =====================================================
-- Run this when you're ready to add security back:
-- 
-- ALTER TABLE giving_transactions ENABLE ROW LEVEL SECURITY;
-- 
-- Then run FIX_RLS_POLICIES.sql to set up proper policies
-- =====================================================

-- Test query
SELECT COUNT(*) as total_records FROM giving_transactions;

-- =====================================================
-- NOTES:
-- - This is for TESTING ONLY
-- - Anyone can read/write to this table now
-- - Re-enable RLS before going to production
-- - Use FIX_RLS_POLICIES.sql for proper security
-- =====================================================
