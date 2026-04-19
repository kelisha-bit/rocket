-- ============================================================
-- Setup Ministry Leaders
-- This script helps assign leaders to ministries
-- ============================================================

-- First, let's see what ministries we have
SELECT id, name, head_member_id, meeting_day, meeting_time, status
FROM ministries
ORDER BY name;

-- To assign a leader to a ministry, you need:
-- 1. The ministry ID (from the query above)
-- 2. The member ID of the person you want to assign as leader

-- Example: Find members who could be leaders
SELECT id, full_name, phone_number, email, gender, status
FROM members
WHERE status = 'Active'
ORDER BY full_name;

-- ============================================================
-- ASSIGN LEADERS TO MINISTRIES
-- Replace the UUIDs below with actual IDs from your database
-- ============================================================

-- Example: Assign leader to Men Ministry
-- UPDATE ministries
-- SET head_member_id = 'MEMBER_UUID_HERE'
-- WHERE name = 'Men Ministry';

-- Example: Assign leader to Women Ministry
-- UPDATE ministries
-- SET head_member_id = 'MEMBER_UUID_HERE'
-- WHERE name = 'Women Ministry';

-- Example: Assign leader to Youth Ministry
-- UPDATE ministries
-- SET head_member_id = 'MEMBER_UUID_HERE'
-- WHERE name ILIKE '%Youth%';

-- Example: Assign leader to Music Ministry
-- UPDATE ministries
-- SET head_member_id = 'MEMBER_UUID_HERE'
-- WHERE name ILIKE '%Music%' OR name ILIKE '%Choir%';

-- ============================================================
-- QUICK SETUP: Assign first active male member to Men Ministry
-- ============================================================
-- Uncomment to use:
/*
WITH first_male AS (
  SELECT id FROM members 
  WHERE (gender ILIKE 'male' OR gender ILIKE 'm') 
    AND status = 'Active'
  ORDER BY full_name
  LIMIT 1
)
UPDATE ministries
SET head_member_id = (SELECT id FROM first_male)
WHERE name = 'Men Ministry';
*/

-- ============================================================
-- QUICK SETUP: Assign first active female member to Women Ministry
-- ============================================================
-- Uncomment to use:
/*
WITH first_female AS (
  SELECT id FROM members 
  WHERE (gender ILIKE 'female' OR gender ILIKE 'f') 
    AND status = 'Active'
  ORDER BY full_name
  LIMIT 1
)
UPDATE ministries
SET head_member_id = (SELECT id FROM first_female)
WHERE name = 'Women Ministry';
*/

-- ============================================================
-- Verify the assignments
-- ============================================================
SELECT 
  m.name AS ministry_name,
  m.meeting_day,
  m.meeting_time,
  mem.full_name AS leader_name,
  mem.phone_number AS leader_phone,
  mem.email AS leader_email
FROM ministries m
LEFT JOIN members mem ON m.head_member_id = mem.id
WHERE m.name IN ('Men Ministry', 'Women Ministry', 'Youth Ministry', 'Music Ministry', 'Youth', 'Music', 'Choir')
ORDER BY m.name;

-- ============================================================
-- Add members to ministries (member_ministries junction table)
-- ============================================================

-- Example: Add a member to Men Ministry
-- INSERT INTO member_ministries (member_id, ministry_id)
-- SELECT 'MEMBER_UUID_HERE', id
-- FROM ministries
-- WHERE name = 'Men Ministry'
-- ON CONFLICT DO NOTHING;

-- Example: Add multiple male members to Men Ministry
-- INSERT INTO member_ministries (member_id, ministry_id)
-- SELECT m.id, min.id
-- FROM members m
-- CROSS JOIN ministries min
-- WHERE (m.gender ILIKE 'male' OR m.gender ILIKE 'm')
--   AND m.status = 'Active'
--   AND min.name = 'Men Ministry'
-- ON CONFLICT DO NOTHING;

-- Example: Add multiple female members to Women Ministry
-- INSERT INTO member_ministries (member_id, ministry_id)
-- SELECT m.id, min.id
-- FROM members m
-- CROSS JOIN ministries min
-- WHERE (m.gender ILIKE 'female' OR m.gender ILIKE 'f')
--   AND m.status = 'Active'
--   AND min.name = 'Women Ministry'
-- ON CONFLICT DO NOTHING;

-- Verify member assignments
SELECT 
  min.name AS ministry_name,
  COUNT(mm.member_id) AS member_count
FROM ministries min
LEFT JOIN member_ministries mm ON min.id = mm.ministry_id
WHERE min.name IN ('Men Ministry', 'Women Ministry', 'Youth Ministry', 'Music Ministry', 'Youth', 'Music', 'Choir')
GROUP BY min.id, min.name
ORDER BY min.name;
