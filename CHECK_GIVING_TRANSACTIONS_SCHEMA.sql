-- =====================================================
-- DIAGNOSTIC QUERIES FOR giving_transactions TABLE
-- =====================================================
-- Run these queries in Supabase SQL Editor to check your table structure
-- =====================================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'giving_transactions'
) as table_exists;

-- 2. List all columns in giving_transactions table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'giving_transactions'
ORDER BY ordinal_position;

-- 3. Check table constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'giving_transactions';

-- 4. Show sample data (if any exists)
SELECT * FROM giving_transactions LIMIT 5;

-- 5. Count records
SELECT COUNT(*) as total_records FROM giving_transactions;

-- =====================================================
-- EXPECTED COLUMNS (what the code needs)
-- =====================================================
-- The code expects these columns:
-- - id (UUID)
-- - date (DATE)
-- - type (TEXT) - 'income' or 'expense'
-- - category (TEXT) - income/expense categories
-- - description (TEXT)
-- - member_id (UUID) - optional, references members
-- - method (TEXT) - 'Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'
-- - amount (DECIMAL/NUMERIC)
-- - reference (TEXT) - optional
-- - notes (TEXT) - optional
-- - recorded_by (TEXT) - optional
-- - created_at (TIMESTAMP)
-- - updated_at (TIMESTAMP)
-- =====================================================
