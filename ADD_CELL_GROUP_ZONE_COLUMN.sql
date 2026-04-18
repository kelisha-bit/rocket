-- =====================================================
-- Add zone column to cell_groups table
-- =====================================================

-- Add zone column
ALTER TABLE cell_groups 
ADD COLUMN IF NOT EXISTS zone TEXT DEFAULT 'Zone A';

-- Add leader_name column (denormalized for easier queries)
-- This gets populated via trigger or application logic
ALTER TABLE cell_groups 
ADD COLUMN IF NOT EXISTS leader_name TEXT;

-- Create index on zone for filtering
CREATE INDEX IF NOT EXISTS idx_cell_groups_zone ON cell_groups(zone);

-- Update existing records with default zone
UPDATE cell_groups 
SET zone = COALESCE(zone, 'Zone A')
WHERE zone IS NULL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Cell groups zone column added successfully' AS status;
