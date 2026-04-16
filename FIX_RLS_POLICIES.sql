-- =====================================================
-- FIX RLS POLICIES FOR giving_transactions
-- =====================================================
-- This fixes the "violates row-level security policy" error
-- =====================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON giving_transactions;

-- Step 2: Create more permissive policies
-- These policies allow all authenticated users full access

-- Allow SELECT (read)
CREATE POLICY "Enable read access for authenticated users"
  ON giving_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow INSERT (create)
CREATE POLICY "Enable insert access for authenticated users"
  ON giving_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow UPDATE (edit)
CREATE POLICY "Enable update access for authenticated users"
  ON giving_transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow DELETE (remove)
CREATE POLICY "Enable delete access for authenticated users"
  ON giving_transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 3: Also create policies for anon users (if needed for public access)
-- Uncomment these if you want unauthenticated users to have access

-- CREATE POLICY "Enable read access for anon users"
--   ON giving_transactions
--   FOR SELECT
--   TO anon
--   USING (true);

-- CREATE POLICY "Enable insert access for anon users"
--   ON giving_transactions
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- CREATE POLICY "Enable update access for anon users"
--   ON giving_transactions
--   FOR UPDATE
--   TO anon
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable delete access for anon users"
--   ON giving_transactions
--   FOR DELETE
--   TO anon
--   USING (true);

-- Step 4: Verify policies are created
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
WHERE tablename = 'giving_transactions';

-- Step 5: Test query (should work now)
SELECT COUNT(*) as total_records FROM giving_transactions;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'RLS policies updated successfully!' as status;
SELECT 'You should now be able to create transactions' as message;

-- =====================================================
-- NOTES:
-- - These policies allow all authenticated users full access
-- - If you need more restrictive policies later, you can update them
-- - Make sure you're logged in when testing
-- =====================================================
