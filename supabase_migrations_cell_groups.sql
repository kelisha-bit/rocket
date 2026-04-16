-- =====================================================
-- CELL GROUPS MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the cell groups management system
-- for organizing members into smaller fellowship groups.
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS cell_groups CASCADE;

-- Create cell_groups table
CREATE TABLE cell_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID, -- Will reference members(id) after members table is created
  assistant_leader_id UUID, -- Will reference members(id) after members table is created
  meeting_day TEXT CHECK (meeting_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meeting_time TIME,
  meeting_location TEXT,
  max_capacity INTEGER DEFAULT 15 CHECK (max_capacity > 0),
  current_members INTEGER DEFAULT 0 CHECK (current_members >= 0),
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  zone TEXT, -- Geographic zone or area
  contact_phone TEXT,
  contact_email TEXT,
  established_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_cell_groups_name ON cell_groups(name);
CREATE INDEX idx_cell_groups_leader_id ON cell_groups(leader_id);
CREATE INDEX idx_cell_groups_status ON cell_groups(status);
CREATE INDEX idx_cell_groups_zone ON cell_groups(zone);
CREATE INDEX idx_cell_groups_meeting_day ON cell_groups(meeting_day);
CREATE INDEX idx_cell_groups_created_at ON cell_groups(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cell_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cell_groups_updated_at
  BEFORE UPDATE ON cell_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_cell_groups_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE cell_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cell_groups
CREATE POLICY "Enable read access for all users"
  ON cell_groups FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON cell_groups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON cell_groups FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON cell_groups FOR DELETE
  USING (true);

-- Insert sample cell group data
INSERT INTO cell_groups (
  name, description, meeting_day, meeting_time, meeting_location, 
  max_capacity, current_members, status, zone, contact_phone, 
  contact_email, established_date, notes
) VALUES 
  ('Victory Cell Group', 'A vibrant cell group focused on spiritual growth and community fellowship', 'Wednesday', '19:00:00', 'Community Center, East Legon', 20, 15, 'active', 'East Legon', '+233 24 111 2222', 'victory@greaterworks.gh', '2020-01-15', 'Meets every Wednesday evening'),
  
  ('Faith Builders', 'Building strong foundations of faith through Bible study and prayer', 'Friday', '18:30:00', 'Church Annex Building', 15, 12, 'active', 'Accra Central', '+233 24 333 4444', 'faith@greaterworks.gh', '2019-06-10', 'Focus on new believers and discipleship'),
  
  ('Hope Fellowship', 'A supportive community for families and young professionals', 'Saturday', '16:00:00', 'Tema Community Hall', 25, 18, 'active', 'Tema', '+233 24 555 6666', 'hope@greaterworks.gh', '2018-03-22', 'Family-oriented cell group'),
  
  ('Grace Circle', 'Women''s cell group focusing on spiritual growth and mutual support', 'Thursday', '17:00:00', 'Church Prayer Room', 12, 10, 'active', 'Kumasi', '+233 24 777 8888', 'grace@greaterworks.gh', '2021-09-05', 'Women only cell group'),
  
  ('Mighty Men', 'Men''s fellowship group for spiritual accountability and growth', 'Tuesday', '18:00:00', 'Church Conference Room', 15, 8, 'active', 'Takoradi', '+233 24 999 0000', 'men@greaterworks.gh', '2017-11-18', 'Men only cell group'),
  
  ('Youth Fire', 'Dynamic youth cell group for ages 18-35', 'Sunday', '14:00:00', 'Youth Center', 30, 22, 'active', 'Cape Coast', '+233 24 111 3333', 'youth@greaterworks.gh', '2020-07-12', 'High energy worship and teaching'),
  
  ('Seniors Circle', 'Cell group for mature believers and senior members', 'Monday', '15:00:00', 'Church Library', 10, 7, 'active', 'Ho', '+233 24 222 4444', 'seniors@greaterworks.gh', '2019-02-10', 'Afternoon meetings for seniors'),
  
  ('New Beginnings', 'Cell group for new members and recent converts', 'Wednesday', '18:00:00', 'Church Classroom 1', 12, 5, 'active', 'Sunyani', '+233 24 333 5555', 'newbeginnings@greaterworks.gh', '2022-01-08', 'Focus on foundational teachings');

-- Create view for cell group statistics
CREATE OR REPLACE VIEW cell_group_statistics AS
SELECT 
  COUNT(*) as total_cell_groups,
  COUNT(*) FILTER (WHERE status = 'active') as active_groups,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_groups,
  COUNT(*) FILTER (WHERE status = 'suspended') as suspended_groups,
  SUM(current_members) as total_members_in_groups,
  SUM(max_capacity) as total_capacity,
  ROUND(AVG(current_members), 2) as avg_members_per_group,
  ROUND((SUM(current_members) * 100.0 / NULLIF(SUM(max_capacity), 0)), 2) as capacity_utilization_percent,
  COUNT(DISTINCT zone) as total_zones,
  COUNT(*) FILTER (WHERE meeting_day = 'Sunday') as sunday_groups,
  COUNT(*) FILTER (WHERE meeting_day = 'Wednesday') as wednesday_groups,
  COUNT(*) FILTER (WHERE meeting_day = 'Friday') as friday_groups
FROM cell_groups;

-- Create view for cell group capacity analysis
CREATE OR REPLACE VIEW cell_group_capacity_analysis AS
SELECT 
  id,
  name,
  current_members,
  max_capacity,
  (max_capacity - current_members) as available_spots,
  ROUND((current_members * 100.0 / max_capacity), 2) as utilization_percent,
  CASE 
    WHEN current_members >= max_capacity THEN 'Full'
    WHEN current_members >= (max_capacity * 0.8) THEN 'Nearly Full'
    WHEN current_members >= (max_capacity * 0.5) THEN 'Moderate'
    ELSE 'Low Capacity'
  END as capacity_status,
  zone,
  meeting_day,
  meeting_time,
  status
FROM cell_groups
WHERE status = 'active'
ORDER BY utilization_percent DESC;

-- Function to update cell group member count
CREATE OR REPLACE FUNCTION update_cell_group_member_count(
  group_id UUID,
  new_count INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE cell_groups 
  SET 
    current_members = new_count,
    updated_at = NOW()
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add member to cell group
CREATE OR REPLACE FUNCTION add_member_to_cell_group(
  group_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE cell_groups 
  SET 
    current_members = current_members + 1,
    updated_at = NOW()
  WHERE id = group_id AND current_members < max_capacity;
END;
$$ LANGUAGE plpgsql;

-- Function to remove member from cell group
CREATE OR REPLACE FUNCTION remove_member_from_cell_group(
  group_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE cell_groups 
  SET 
    current_members = GREATEST(current_members - 1, 0),
    updated_at = NOW()
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE cell_groups IS 'Cell groups for organizing members into smaller fellowship communities';
COMMENT ON COLUMN cell_groups.id IS 'Unique identifier for each cell group';
COMMENT ON COLUMN cell_groups.name IS 'Name of the cell group';
COMMENT ON COLUMN cell_groups.description IS 'Description of the cell group purpose and focus';
COMMENT ON COLUMN cell_groups.leader_id IS 'Primary leader of the cell group (references members)';
COMMENT ON COLUMN cell_groups.assistant_leader_id IS 'Assistant leader of the cell group (references members)';
COMMENT ON COLUMN cell_groups.meeting_day IS 'Day of the week when group meets';
COMMENT ON COLUMN cell_groups.meeting_time IS 'Time when group meets';
COMMENT ON COLUMN cell_groups.meeting_location IS 'Location where group meets';
COMMENT ON COLUMN cell_groups.max_capacity IS 'Maximum number of members the group can accommodate';
COMMENT ON COLUMN cell_groups.current_members IS 'Current number of active members';
COMMENT ON COLUMN cell_groups.status IS 'Group status: active, inactive, suspended';
COMMENT ON COLUMN cell_groups.zone IS 'Geographic zone or area';
COMMENT ON COLUMN cell_groups.contact_phone IS 'Contact phone number for the group';
COMMENT ON COLUMN cell_groups.contact_email IS 'Contact email for the group';
COMMENT ON COLUMN cell_groups.established_date IS 'Date when the group was established';

-- Verification queries
SELECT 'Cell Groups table created successfully!' as status;
SELECT 'Total cell groups inserted: ' || COUNT(*) as sample_data FROM cell_groups;
SELECT 'Cell group statistics view created!' as view_status;

-- Test the cell group statistics view
SELECT * FROM cell_group_statistics;

-- Test capacity analysis view
SELECT * FROM cell_group_capacity_analysis LIMIT 5;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cell_groups' 
ORDER BY ordinal_position;

SELECT 'Cell Groups module migration completed successfully!' as final_status;