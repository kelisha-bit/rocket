-- =====================================================
-- DIAGNOSTIC: Check giving_transactions table structure
-- =====================================================
-- Run this FIRST to see what we're working with
-- =====================================================

-- 1. Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'giving_transactions'
    ) THEN 'Table EXISTS'
    ELSE 'Table DOES NOT EXIST'
  END as table_status;

-- 2. Show ALL columns that currently exist
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'giving_transactions'
ORDER BY ordinal_position;

-- 3. Show sample data (first 3 rows)
SELECT * FROM giving_transactions LIMIT 3;

-- 4. Count total records
SELECT COUNT(*) as total_records FROM giving_transactions;

-- 5. Show table constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'giving_transactions';

-- =====================================================
-- INSTRUCTIONS:
-- 1. Run this query
-- 2. Copy the results (especially the column list)
-- 3. Share the output so we can create the correct fix
-- =====================================================
