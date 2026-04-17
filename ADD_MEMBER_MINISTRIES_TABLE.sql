-- ============================================================
-- Migration: Allow members to belong to multiple ministries
-- Creates a junction table: member_ministries
-- The existing primary_ministry_id column is kept for backward
-- compatibility but the junction table is the source of truth.
-- ============================================================

-- 1. Create the junction table
CREATE TABLE IF NOT EXISTS member_ministries (
  member_id  UUID NOT NULL REFERENCES members(id)    ON DELETE CASCADE,
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (member_id, ministry_id)
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_member_ministries_member_id   ON member_ministries(member_id);
CREATE INDEX IF NOT EXISTS idx_member_ministries_ministry_id ON member_ministries(ministry_id);

-- 3. Seed the junction table from the existing primary_ministry_id column
--    so no existing data is lost
INSERT INTO member_ministries (member_id, ministry_id)
SELECT id, primary_ministry_id
FROM   members
WHERE  primary_ministry_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Enable Row Level Security
ALTER TABLE member_ministries ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (mirror the pattern used by other tables)
DROP POLICY IF EXISTS "Allow all operations on member_ministries" ON member_ministries;
CREATE POLICY "Allow all operations on member_ministries"
  ON member_ministries FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Verify
SELECT 'member_ministries table created and seeded successfully' AS status;
SELECT COUNT(*) AS seeded_rows FROM member_ministries;
