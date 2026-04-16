-- =====================================================
-- MINISTRIES MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the ministries management system
-- for organizing church ministries and departments.
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS ministries CASCADE;

-- Create ministries table
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID, -- Will reference members(id) after members table is created
  assistant_leader_id UUID, -- Will reference members(id) after members table is created
  department TEXT, -- Department category (e.g., Worship, Outreach, Administration)
  meeting_schedule TEXT, -- When the ministry meets
  meeting_location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  max_members INTEGER CHECK (max_members > 0),
  current_members INTEGER DEFAULT 0 CHECK (current_members >= 0),
  status TEXT CHECK (status IN ('active', 'inactive', 'recruiting', 'suspended')) DEFAULT 'active',
  vision_statement TEXT,
  mission_statement TEXT,
  requirements TEXT, -- Requirements to join the ministry
  established_date DATE DEFAULT CURRENT_DATE,
  budget DECIMAL(10, 2) DEFAULT 0 CHECK (budget >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ministries_name ON ministries(name);
CREATE INDEX idx_ministries_leader_id ON ministries(leader_id);
CREATE INDEX idx_ministries_department ON ministries(department);
CREATE INDEX idx_ministries_status ON ministries(status);
CREATE INDEX idx_ministries_created_at ON ministries(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
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

-- Enable Row Level Security (RLS)
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ministries
CREATE POLICY "Enable read access for all users"
  ON ministries FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON ministries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON ministries FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON ministries FOR DELETE
  USING (true);

-- Insert sample ministry data
INSERT INTO ministries (
  name, description, department, meeting_schedule, meeting_location,
  contact_phone, contact_email, max_members, current_members, status,
  vision_statement, mission_statement, requirements, established_date, budget, notes
) VALUES 
  ('Worship Team', 'Leading the congregation in praise and worship through music and song', 'Worship', 'Saturdays 4:00 PM, Sundays 7:00 AM', 'Main Sanctuary', '+233 24 111 2222', 'worship@greaterworks.gh', 25, 18, 'active', 'To lead people into the presence of God through anointed worship', 'To create an atmosphere where people can encounter God through music and worship', 'Musical ability, commitment to rehearsals, born-again Christian', '2015-01-15', 5000.00, 'Includes vocalists, instrumentalists, and sound technicians'),
  
  ('Ushering Ministry', 'Welcoming and assisting members and visitors during services', 'Service', 'Sundays 7:30 AM', 'Church Entrance', '+233 24 333 4444', 'ushers@greaterworks.gh', 30, 22, 'active', 'To create a welcoming and orderly environment for all who attend our services', 'To serve with excellence, ensuring everyone feels welcomed and comfortable', 'Friendly demeanor, punctuality, servant heart', '2016-06-10', 1000.00, 'Rotating schedule for all services'),
  
  ('Media Ministry', 'Managing audio-visual equipment, live streaming, and media production', 'Technical', 'Sundays 6:30 AM', 'Media Control Room', '+233 24 555 6666', 'media@greaterworks.gh', 15, 10, 'active', 'To use technology to enhance worship and spread the Gospel globally', 'To provide excellent technical support for all church services and events', 'Technical aptitude, willingness to learn, commitment to training', '2018-03-22', 8000.00, 'Includes camera operators, sound engineers, and video editors'),
  
  ('Children''s Ministry', 'Teaching and nurturing children in the ways of the Lord', 'Education', 'Sundays 8:00 AM', 'Children''s Wing', '+233 24 777 8888', 'children@greaterworks.gh', 40, 28, 'active', 'To raise a generation that knows and loves God', 'To provide age-appropriate biblical teaching and fun activities for children', 'Love for children, background check, teaching ability', '2014-09-05', 3000.00, 'Ages 0-12, divided into age groups'),
  
  ('Youth Ministry', 'Empowering young people to live for Christ and impact their generation', 'Youth', 'Sundays 2:00 PM', 'Youth Center', '+233 24 999 0000', 'youth@greaterworks.gh', 50, 35, 'active', 'To see young people fully devoted to Christ and making a difference', 'To create relevant programs that engage and equip youth for Kingdom impact', 'Passion for youth, ability to relate to young people', '2013-11-18', 4000.00, 'Ages 13-25, includes Bible study, social events, and outreach'),
  
  ('Prayer Ministry', 'Interceding for the church, community, and nations', 'Spiritual', 'Daily 5:00 AM, Wednesdays 6:00 PM', 'Prayer Room', '+233 24 111 3333', 'prayer@greaterworks.gh', 100, 45, 'active', 'To be a house of prayer for all nations', 'To cover the church and community in consistent, fervent prayer', 'Prayerful lifestyle, commitment to prayer meetings', '2012-07-12', 500.00, 'Includes prayer chains, all-night prayers, and prayer walks'),
  
  ('Evangelism Ministry', 'Reaching the lost with the Gospel message', 'Outreach', 'Saturdays 9:00 AM', 'Various Locations', '+233 24 222 4444', 'evangelism@greaterworks.gh', 60, 32, 'active', 'To see every person in our community hear the Gospel', 'To share the Good News through personal evangelism and community outreach', 'Boldness to share faith, training in evangelism', '2011-02-10', 2000.00, 'Street evangelism, hospital visits, community events'),
  
  ('Hospitality Ministry', 'Showing the love of Christ through hospitality and care', 'Service', 'Sundays 8:00 AM', 'Fellowship Hall', '+233 24 333 5555', 'hospitality@greaterworks.gh', 25, 15, 'active', 'To demonstrate God''s love through genuine hospitality', 'To create a warm, welcoming environment and provide refreshments', 'Servant heart, hospitality gift, food handling knowledge', '2017-01-08', 1500.00, 'Includes refreshments after services and special events'),
  
  ('Drama Ministry', 'Using dramatic arts to communicate biblical truths', 'Creative Arts', 'Fridays 6:00 PM', 'Main Sanctuary', '+233 24 444 6666', 'drama@greaterworks.gh', 20, 12, 'active', 'To bring the Bible to life through dramatic presentation', 'To minister through skits, plays, and dramatic performances', 'Acting ability, memorization skills, commitment to rehearsals', '2016-08-14', 800.00, 'Performs during special services and events'),
  
  ('Music Ministry', 'Instrumental music and choir for worship services', 'Worship', 'Thursdays 6:00 PM, Sundays 7:00 AM', 'Choir Room', '+233 24 555 7777', 'music@greaterworks.gh', 50, 38, 'active', 'To glorify God through excellent musical expression', 'To provide choral and instrumental music for worship services', 'Musical training, ability to read music, commitment to rehearsals', '2010-05-20', 6000.00, 'Includes choir, orchestra, and special music groups'),
  
  ('Counseling Ministry', 'Providing biblical counseling and support to members', 'Care', 'By appointment', 'Counseling Center', '+233 24 666 8888', 'counseling@greaterworks.gh', 10, 6, 'active', 'To see people healed and whole through biblical counseling', 'To provide professional, biblically-based counseling and support', 'Counseling training/certification, wisdom, confidentiality', '2015-12-03', 2000.00, 'Marriage, family, and individual counseling'),
  
  ('Outreach Ministry', 'Community service and social responsibility programs', 'Outreach', 'Monthly events', 'Community', '+233 24 777 9999', 'outreach@greaterworks.gh', 40, 25, 'active', 'To be the hands and feet of Jesus in our community', 'To serve the community through practical assistance and social programs', 'Compassion for the needy, willingness to serve', '2014-04-25', 5000.00, 'Food distribution, clothing drives, community clean-ups');

-- Create view for ministry statistics
CREATE OR REPLACE VIEW ministry_statistics AS
SELECT 
  COUNT(*) as total_ministries,
  COUNT(*) FILTER (WHERE status = 'active') as active_ministries,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_ministries,
  COUNT(*) FILTER (WHERE status = 'recruiting') as recruiting_ministries,
  COUNT(*) FILTER (WHERE status = 'suspended') as suspended_ministries,
  SUM(current_members) as total_members_in_ministries,
  SUM(budget) as total_budget,
  ROUND(AVG(current_members), 2) as avg_members_per_ministry,
  COUNT(DISTINCT department) as total_departments,
  COUNT(*) FILTER (WHERE department = 'Worship') as worship_ministries,
  COUNT(*) FILTER (WHERE department = 'Outreach') as outreach_ministries,
  COUNT(*) FILTER (WHERE department = 'Education') as education_ministries,
  COUNT(*) FILTER (WHERE department = 'Service') as service_ministries
FROM ministries;

-- Create view for ministry capacity analysis
CREATE OR REPLACE VIEW ministry_capacity_analysis AS
SELECT 
  id,
  name,
  department,
  current_members,
  max_members,
  (max_members - current_members) as available_spots,
  ROUND((current_members * 100.0 / NULLIF(max_members, 0)), 2) as utilization_percent,
  CASE 
    WHEN max_members IS NULL THEN 'Unlimited'
    WHEN current_members >= max_members THEN 'Full'
    WHEN current_members >= (max_members * 0.8) THEN 'Nearly Full'
    WHEN current_members >= (max_members * 0.5) THEN 'Moderate'
    ELSE 'Low Capacity'
  END as capacity_status,
  status,
  budget
FROM ministries
WHERE status IN ('active', 'recruiting')
ORDER BY utilization_percent DESC;

-- Create view for ministry by department
CREATE OR REPLACE VIEW ministries_by_department AS
SELECT 
  department,
  COUNT(*) as ministry_count,
  SUM(current_members) as total_members,
  SUM(budget) as total_budget,
  STRING_AGG(name, ', ' ORDER BY name) as ministry_names
FROM ministries
GROUP BY department
ORDER BY ministry_count DESC;

-- Function to update ministry member count
CREATE OR REPLACE FUNCTION update_ministry_member_count(
  ministry_id UUID,
  new_count INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE ministries 
  SET 
    current_members = new_count,
    updated_at = NOW()
  WHERE id = ministry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add member to ministry
CREATE OR REPLACE FUNCTION add_member_to_ministry(
  ministry_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE ministries 
  SET 
    current_members = current_members + 1,
    updated_at = NOW()
  WHERE id = ministry_id AND (max_members IS NULL OR current_members < max_members);
END;
$$ LANGUAGE plpgsql;

-- Function to remove member from ministry
CREATE OR REPLACE FUNCTION remove_member_from_ministry(
  ministry_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE ministries 
  SET 
    current_members = GREATEST(current_members - 1, 0),
    updated_at = NOW()
  WHERE id = ministry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get ministries by department
CREATE OR REPLACE FUNCTION get_ministries_by_department(dept_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  current_members INTEGER,
  max_members INTEGER,
  status TEXT,
  budget DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.description,
    m.current_members,
    m.max_members,
    m.status,
    m.budget
  FROM ministries m
  WHERE m.department = dept_name
  ORDER BY m.name;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE ministries IS 'Church ministries and departments for member involvement';
COMMENT ON COLUMN ministries.id IS 'Unique identifier for each ministry';
COMMENT ON COLUMN ministries.name IS 'Name of the ministry';
COMMENT ON COLUMN ministries.description IS 'Description of the ministry purpose and activities';
COMMENT ON COLUMN ministries.leader_id IS 'Primary leader of the ministry (references members)';
COMMENT ON COLUMN ministries.assistant_leader_id IS 'Assistant leader of the ministry (references members)';
COMMENT ON COLUMN ministries.department IS 'Department category (Worship, Outreach, Education, etc.)';
COMMENT ON COLUMN ministries.meeting_schedule IS 'When the ministry meets';
COMMENT ON COLUMN ministries.meeting_location IS 'Where the ministry meets';
COMMENT ON COLUMN ministries.contact_phone IS 'Contact phone number for the ministry';
COMMENT ON COLUMN ministries.contact_email IS 'Contact email for the ministry';
COMMENT ON COLUMN ministries.max_members IS 'Maximum number of members the ministry can accommodate';
COMMENT ON COLUMN ministries.current_members IS 'Current number of active members';
COMMENT ON COLUMN ministries.status IS 'Ministry status: active, inactive, recruiting, suspended';
COMMENT ON COLUMN ministries.vision_statement IS 'Vision statement of the ministry';
COMMENT ON COLUMN ministries.mission_statement IS 'Mission statement of the ministry';
COMMENT ON COLUMN ministries.requirements IS 'Requirements to join the ministry';
COMMENT ON COLUMN ministries.established_date IS 'Date when the ministry was established';
COMMENT ON COLUMN ministries.budget IS 'Annual budget allocation for the ministry';

-- Verification queries
SELECT 'Ministries table created successfully!' as status;
SELECT 'Total ministries inserted: ' || COUNT(*) as sample_data FROM ministries;
SELECT 'Ministry statistics view created!' as view_status;

-- Test the ministry statistics view
SELECT * FROM ministry_statistics;

-- Test capacity analysis view
SELECT * FROM ministry_capacity_analysis LIMIT 5;

-- Test ministries by department
SELECT * FROM ministries_by_department;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ministries' 
ORDER BY ordinal_position;

SELECT 'Ministries module migration completed successfully!' as final_status;