-- =====================================================
-- Fix event_status enum values
-- =====================================================
-- The error "invalid input value for enum event_status: 'Scheduled'"
-- indicates the database has an enum type with different values.
-- This script diagnoses and fixes the issue.
-- =====================================================

-- Step 1: Check if event_status is an enum type and see its values
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'event_status'
ORDER BY e.enumsortorder;

-- Step 2: Check the actual column type for events.status
SELECT 
  column_name, 
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND table_schema = 'public'
  AND column_name = 'status';

-- =====================================================
-- FIX OPTION A: If status is an enum with lowercase values
-- Convert the column to TEXT with CHECK constraint (recommended)
-- =====================================================

-- First, alter the column to TEXT type (this removes enum constraint)
ALTER TABLE events 
  ALTER COLUMN status TYPE TEXT;

-- Add CHECK constraint with proper capitalized values
ALTER TABLE events 
  ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Scheduled', 'Draft', 'Completed', 'Cancelled'));

-- =====================================================
-- FIX OPTION B: If you want to keep enum but with capitalized values
-- (Only use if you prefer enum type over TEXT)
-- =====================================================

-- Rename existing enum to old name
-- ALTER TYPE event_status RENAME TO event_status_old;

-- Create new enum with capitalized values
-- CREATE TYPE event_status AS ENUM ('Scheduled', 'Draft', 'Completed', 'Cancelled');

-- Convert column to new enum type
-- ALTER TABLE events 
--   ALTER COLUMN status TYPE event_status 
--   USING status::text::event_status;

-- Drop old enum
-- DROP TYPE event_status_old;

-- =====================================================
-- Step 3: Update any existing lowercase values to capitalized
-- =====================================================

UPDATE events 
SET status = CASE status
  WHEN 'scheduled' THEN 'Scheduled'
  WHEN 'draft' THEN 'Draft'
  WHEN 'completed' THEN 'Completed'
  WHEN 'cancelled' THEN 'Cancelled'
  ELSE status
END
WHERE status IN ('scheduled', 'draft', 'completed', 'cancelled');

-- =====================================================
-- Step 4: Verify the fix
-- =====================================================

-- Check column type
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'status';

-- Check distinct status values
SELECT DISTINCT status FROM events;

-- =====================================================
-- Refresh schema cache for Supabase
-- =====================================================
NOTIFY pgrst, 'reload schema';

SELECT 'event_status enum fix complete' AS status;
