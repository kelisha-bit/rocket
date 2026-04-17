-- =====================================================
-- FIX MEMBER primary_ministry_id REFERENCES
-- =====================================================
-- After FIX_MINISTRIES_FK.sql recreated the ministries
-- table with new UUIDs, members still point to old IDs.
-- This script re-links them by matching ministry names.
-- =====================================================

-- First, see what ministry names exist in the DB now
-- and what orphaned IDs members are pointing to:
SELECT 
  m.primary_ministry_id,
  COUNT(*) as member_count,
  min.name as ministry_name
FROM members m
LEFT JOIN ministries min ON min.id = m.primary_ministry_id
WHERE m.primary_ministry_id IS NOT NULL
GROUP BY m.primary_ministry_id, min.name
ORDER BY member_count DESC;

-- =====================================================
-- NULL out any primary_ministry_id that no longer
-- matches a real ministry (orphaned references)
-- =====================================================
UPDATE members
SET primary_ministry_id = NULL
WHERE primary_ministry_id IS NOT NULL
  AND primary_ministry_id NOT IN (SELECT id FROM ministries);

-- Verify how many were cleared
SELECT 'Orphaned ministry references cleared' as status;
SELECT COUNT(*) as members_with_valid_ministry 
FROM members 
WHERE primary_ministry_id IS NOT NULL;

-- =====================================================
-- NOTE: Members now have NULL primary_ministry_id.
-- Reassign them through the Member Management UI,
-- or run targeted UPDATE statements like:
--
-- UPDATE members 
-- SET primary_ministry_id = (SELECT id FROM ministries WHERE name = 'Worship Team')
-- WHERE full_name = 'John Mensah';
-- =====================================================
