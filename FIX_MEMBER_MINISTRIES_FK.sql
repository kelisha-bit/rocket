-- ============================================================
-- Fix: Add missing foreign key relationships to member_ministries
-- Run this in Supabase SQL Editor if the FKs don't exist
-- ============================================================

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS member_ministries (
  member_id   UUID NOT NULL,
  ministry_id UUID NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (member_id, ministry_id)
);

-- 2. Add foreign key constraint to members (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'member_ministries_member_id_fkey' 
    AND table_name = 'member_ministries'
  ) THEN
    ALTER TABLE member_ministries
    ADD CONSTRAINT member_ministries_member_id_fkey
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Add foreign key constraint to ministries (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'member_ministries_ministry_id_fkey' 
    AND table_name = 'member_ministries'
  ) THEN
    ALTER TABLE member_ministries
    ADD CONSTRAINT member_ministries_ministry_id_fkey
    FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_member_ministries_member_id   ON member_ministries(member_id);
CREATE INDEX IF NOT EXISTS idx_member_ministries_ministry_id ON member_ministries(ministry_id);

-- 5. Enable Row Level Security
ALTER TABLE member_ministries ENABLE ROW LEVEL SECURITY;

-- 6. Drop and recreate RLS policies to ensure they exist
DROP POLICY IF EXISTS "Allow all operations on member_ministries" ON member_ministries;
DROP POLICY IF EXISTS "Allow read access on member_ministries" ON member_ministries;

CREATE POLICY "Allow all operations on member_ministries"
  ON member_ministries FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Refresh PostgREST schema cache
-- This is critical for the API to recognize the new FK relationships
NOTIFY pgrst, 'reload schema';

-- 8. Verify constraints exist
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'member_ministries' 
AND tc.constraint_type = 'FOREIGN KEY';
