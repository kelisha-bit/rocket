-- =====================================================
-- ADD MISSING COLUMNS TO MEMBERS TABLE
-- =====================================================
-- This adds the primary_ministry_id and primary_cell_group_id columns
-- =====================================================

-- Add missing columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS primary_ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL;

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS primary_cell_group_id UUID REFERENCES cell_groups(id) ON DELETE SET NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_members_primary_ministry_id ON members(primary_ministry_id);
CREATE INDEX IF NOT EXISTS idx_members_primary_cell_group_id ON members(primary_cell_group_id);

-- Verify the columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
AND column_name IN ('primary_ministry_id', 'primary_cell_group_id')
ORDER BY column_name;

SELECT '✓ Missing columns added to members table!' as status;
SELECT 'Refresh your page and try creating a member again!' as next_step;