-- =====================================================
-- FIX MINISTRIES FOREIGN KEY
-- =====================================================
-- This adds the foreign key constraint for head_member_id
-- =====================================================

-- First, drop the existing ministries table and recreate with proper FK
DROP TABLE IF EXISTS ministries CASCADE;

-- Recreate ministries table with proper foreign key
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  head_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  meeting_day TEXT DEFAULT 'Sunday',
  meeting_time TEXT DEFAULT '9:00 AM',
  status TEXT CHECK (status IN ('Active', 'Inactive', 'New')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ministries_name ON ministries(name);
CREATE INDEX idx_ministries_status ON ministries(status);
CREATE INDEX idx_ministries_head_member_id ON ministries(head_member_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ministries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ministries_updated_at
  BEFORE UPDATE ON ministries
  FOR EACH ROW
  EXECUTE FUNCTION update_ministries_updated_at();

-- Enable RLS
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON ministries FOR ALL USING (true) WITH CHECK (true);

-- Insert sample ministries (some with head_member_id)
INSERT INTO ministries (name, head_member_id, meeting_day, meeting_time, status) VALUES 
  ('Worship Team', NULL, 'Saturday', '4:00 PM', 'Active'),
  ('Ushering Ministry', NULL, 'Sunday', '7:30 AM', 'Active'),
  ('Media Ministry', NULL, 'Sunday', '6:30 AM', 'Active'),
  ('Children''s Ministry', NULL, 'Sunday', '8:00 AM', 'Active'),
  ('Youth Ministry', NULL, 'Sunday', '2:00 PM', 'Active'),
  ('Prayer Ministry', NULL, 'Wednesday', '6:00 PM', 'Active'),
  ('Evangelism Ministry', NULL, 'Saturday', '9:00 AM', 'Active'),
  ('Hospitality Ministry', NULL, 'Sunday', '8:00 AM', 'Active'),
  ('Drama Ministry', NULL, 'Friday', '6:00 PM', 'Active'),
  ('Music Ministry', NULL, 'Thursday', '6:00 PM', 'Active'),
  ('Counseling Ministry', NULL, 'By Appointment', 'Various', 'Active'),
  ('Outreach Ministry', NULL, 'Monthly', 'Various', 'Active'),
  ('Women Ministry', NULL, 'Saturday', '10:00 AM', 'Active'),
  ('Men Ministry', NULL, 'Saturday', '8:00 AM', 'Active'),
  ('Marriage & Family', NULL, 'Friday', '6:00 PM', 'Active'),
  ('Finance Committee', NULL, 'First Monday', '5:00 PM', 'Active'),
  ('Elders Board', NULL, 'Second Sunday', '1:00 PM', 'Active'),
  ('Welfare Ministry', NULL, 'Wednesday', '5:00 PM', 'Active'),
  ('Sanctuary Keepers', NULL, 'Sunday', '6:00 AM', 'Active'),
  ('Intercessory Prayer', NULL, 'Tuesday', '6:00 AM', 'Active'),
  ('Missions Ministry', NULL, 'Monthly', 'Various', 'Active'),
  ('Discipleship Ministry', NULL, 'Thursday', '7:00 PM', 'Active'),
  ('Dance Ministry', NULL, 'Friday', '5:00 PM', 'Active'),
  ('Security Ministry', NULL, 'Sunday', '6:30 AM', 'Active');

SELECT '✓ Ministries table recreated with foreign key: ' || COUNT(*) || ' records' as status FROM ministries;

-- Verify the foreign key exists
SELECT 
  '✓ Foreign key constraint added: head_member_id → members(id)' as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'ministries'
AND constraint_name LIKE '%head_member%';