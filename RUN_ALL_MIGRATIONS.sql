-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- =====================================================
-- This script runs all migrations in the correct order
-- to set up the complete church management system.
-- =====================================================
-- 
-- EXECUTION ORDER:
-- 1. Cell Groups (no dependencies)
-- 2. Ministries (no dependencies)
-- 3. Members (depends on cell_groups and ministries)
-- =====================================================

-- =====================================================
-- STEP 1: CELL GROUPS MIGRATION
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS cell_groups CASCADE;

-- Create cell_groups table
CREATE TABLE cell_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID,
  assistant_leader_id UUID,
  meeting_day TEXT CHECK (meeting_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meeting_time TIME,
  meeting_location TEXT,
  max_capacity INTEGER DEFAULT 15 CHECK (max_capacity > 0),
  current_members INTEGER DEFAULT 0 CHECK (current_members >= 0),
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  zone TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  established_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cell_groups
CREATE INDEX idx_cell_groups_name ON cell_groups(name);
CREATE INDEX idx_cell_groups_leader_id ON cell_groups(leader_id);
CREATE INDEX idx_cell_groups_status ON cell_groups(status);
CREATE INDEX idx_cell_groups_zone ON cell_groups(zone);
CREATE INDEX idx_cell_groups_meeting_day ON cell_groups(meeting_day);
CREATE INDEX idx_cell_groups_created_at ON cell_groups(created_at DESC);

-- Create trigger for cell_groups
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

-- Enable RLS for cell_groups
ALTER TABLE cell_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON cell_groups FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON cell_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON cell_groups FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON cell_groups FOR DELETE USING (true);

-- Insert sample cell group data
INSERT INTO cell_groups (name, description, meeting_day, meeting_time, meeting_location, max_capacity, current_members, status, zone, contact_phone, contact_email, established_date, notes) VALUES 
  ('Victory Cell Group', 'A vibrant cell group focused on spiritual growth and community fellowship', 'Wednesday', '19:00:00', 'Community Center, East Legon', 20, 15, 'active', 'East Legon', '+233 24 111 2222', 'victory@greaterworks.gh', '2020-01-15', 'Meets every Wednesday evening'),
  ('Faith Builders', 'Building strong foundations of faith through Bible study and prayer', 'Friday', '18:30:00', 'Church Annex Building', 15, 12, 'active', 'Accra Central', '+233 24 333 4444', 'faith@greaterworks.gh', '2019-06-10', 'Focus on new believers and discipleship'),
  ('Hope Fellowship', 'A supportive community for families and young professionals', 'Saturday', '16:00:00', 'Tema Community Hall', 25, 18, 'active', 'Tema', '+233 24 555 6666', 'hope@greaterworks.gh', '2018-03-22', 'Family-oriented cell group'),
  ('Grace Circle', 'Women''s cell group focusing on spiritual growth and mutual support', 'Thursday', '17:00:00', 'Church Prayer Room', 12, 10, 'active', 'Kumasi', '+233 24 777 8888', 'grace@greaterworks.gh', '2021-09-05', 'Women only cell group'),
  ('Mighty Men', 'Men''s fellowship group for spiritual accountability and growth', 'Tuesday', '18:00:00', 'Church Conference Room', 15, 8, 'active', 'Takoradi', '+233 24 999 0000', 'men@greaterworks.gh', '2017-11-18', 'Men only cell group'),
  ('Youth Fire', 'Dynamic youth cell group for ages 18-35', 'Sunday', '14:00:00', 'Youth Center', 30, 22, 'active', 'Cape Coast', '+233 24 111 3333', 'youth@greaterworks.gh', '2020-07-12', 'High energy worship and teaching'),
  ('Seniors Circle', 'Cell group for mature believers and senior members', 'Monday', '15:00:00', 'Church Library', 10, 7, 'active', 'Ho', '+233 24 222 4444', 'seniors@greaterworks.gh', '2019-02-10', 'Afternoon meetings for seniors'),
  ('New Beginnings', 'Cell group for new members and recent converts', 'Wednesday', '18:00:00', 'Church Classroom 1', 12, 5, 'active', 'Sunyani', '+233 24 333 5555', 'newbeginnings@greaterworks.gh', '2022-01-08', 'Focus on foundational teachings');

-- =====================================================
-- STEP 2: MINISTRIES MIGRATION
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS ministries CASCADE;

-- Create ministries table
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID,
  assistant_leader_id UUID,
  department TEXT,
  meeting_schedule TEXT,
  meeting_location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  max_members INTEGER CHECK (max_members > 0),
  current_members INTEGER DEFAULT 0 CHECK (current_members >= 0),
  status TEXT CHECK (status IN ('active', 'inactive', 'recruiting', 'suspended')) DEFAULT 'active',
  vision_statement TEXT,
  mission_statement TEXT,
  requirements TEXT,
  established_date DATE DEFAULT CURRENT_DATE,
  budget DECIMAL(10, 2) DEFAULT 0 CHECK (budget >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ministries
CREATE INDEX idx_ministries_name ON ministries(name);
CREATE INDEX idx_ministries_leader_id ON ministries(leader_id);
CREATE INDEX idx_ministries_department ON ministries(department);
CREATE INDEX idx_ministries_status ON ministries(status);
CREATE INDEX idx_ministries_created_at ON ministries(created_at DESC);

-- Create trigger for ministries
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

-- Enable RLS for ministries
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON ministries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON ministries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON ministries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON ministries FOR DELETE USING (true);

-- Insert sample ministry data
INSERT INTO ministries (name, description, department, meeting_schedule, meeting_location, contact_phone, contact_email, max_members, current_members, status, vision_statement, mission_statement, requirements, established_date, budget, notes) VALUES 
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

-- =====================================================
-- STEP 3: MEMBERS MIGRATION
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS members CASCADE;

-- Create members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  photo_url TEXT DEFAULT 'https://i.pravatar.cc/48?img=12',
  photo_alt TEXT,
  phone TEXT,
  email TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female')) DEFAULT 'Male',
  date_of_birth DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'new', 'transferred')) DEFAULT 'new',
  tithe_status TEXT CHECK (tithe_status IN ('tithe-faithful', 'tithe-irregular', 'tithe-none')) DEFAULT 'tithe-none',
  join_date DATE DEFAULT CURRENT_DATE,
  last_attendance_date DATE,
  attendance_rate INTEGER DEFAULT 0 CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
  total_giving DECIMAL(10, 2) DEFAULT 0 CHECK (total_giving >= 0),
  address TEXT,
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')) DEFAULT 'Single',
  occupation TEXT,
  emergency_contact TEXT,
  baptised BOOLEAN DEFAULT false,
  primary_cell_group_id UUID REFERENCES cell_groups(id) ON DELETE SET NULL,
  primary_ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for members
CREATE INDEX idx_members_member_code ON members(member_code);
CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_tithe_status ON members(tithe_status);
CREATE INDEX idx_members_gender ON members(gender);
CREATE INDEX idx_members_join_date ON members(join_date DESC);
CREATE INDEX idx_members_created_at ON members(created_at DESC);
CREATE INDEX idx_members_primary_ministry_id ON members(primary_ministry_id);
CREATE INDEX idx_members_primary_cell_group_id ON members(primary_cell_group_id);
CREATE INDEX idx_members_search ON members USING gin(to_tsvector('english', full_name || ' ' || COALESCE(phone, '') || ' ' || member_code));

-- Create triggers for members
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_members_updated_at();

CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := 'GWC-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    SELECT COUNT(*) INTO exists_check FROM members WHERE member_code = code;
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_member_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_code IS NULL OR NEW.member_code = '' THEN
    NEW.member_code := generate_member_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_member_code
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION set_member_code();

-- Enable RLS for members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON members FOR DELETE USING (true);

-- Insert sample member data
INSERT INTO members (member_code, full_name, photo_url, photo_alt, phone, email, gender, date_of_birth, status, tithe_status, join_date, last_attendance_date, attendance_rate, total_giving, address, marital_status, occupation, emergency_contact, baptised) VALUES 
  ('GWC-260415-A001', 'John Mensah', 'https://i.pravatar.cc/48?img=1', 'John Mensah profile photo', '+233 24 123 4567', 'john.mensah@greaterworks.gh', 'Male', '1985-03-15', 'active', 'tithe-faithful', '2020-01-15', '2026-04-13', 95, 2500.00, 'Accra, Ghana', 'Married', 'Teacher', '+233 20 987 6543', true),
  ('GWC-260415-A002', 'Mary Asante', 'https://i.pravatar.cc/48?img=2', 'Mary Asante profile photo', '+233 24 234 5678', 'mary.asante@greaterworks.gh', 'Female', '1990-07-22', 'active', 'tithe-faithful', '2019-06-10', '2026-04-13', 88, 1800.00, 'Kumasi, Ghana', 'Single', 'Nurse', '+233 20 876 5432', true),
  ('GWC-260415-A003', 'Samuel Osei', 'https://i.pravatar.cc/48?img=3', 'Samuel Osei profile photo', '+233 24 345 6789', 'samuel.osei@greaterworks.gh', 'Male', '1978-11-08', 'active', 'tithe-irregular', '2018-03-22', '2026-04-06', 75, 3200.00, 'Tema, Ghana', 'Married', 'Engineer', '+233 20 765 4321', true),
  ('GWC-260415-A004', 'Grace Adjei', 'https://i.pravatar.cc/48?img=4', 'Grace Adjei profile photo', '+233 24 456 7890', 'grace.adjei@greaterworks.gh', 'Female', '1995-02-14', 'active', 'tithe-faithful', '2021-09-05', '2026-04-13', 92, 1200.00, 'Accra, Ghana', 'Single', 'Student', '+233 20 654 3210', false),
  ('GWC-260415-A005', 'Emmanuel Boateng', 'https://i.pravatar.cc/48?img=5', 'Emmanuel Boateng profile photo', '+233 24 567 8901', 'emmanuel.boateng@greaterworks.gh', 'Male', '1982-09-30', 'active', 'tithe-faithful', '2017-11-18', '2026-04-13', 85, 2800.00, 'Takoradi, Ghana', 'Married', 'Businessman', '+233 20 543 2109', true),
  ('GWC-260415-A006', 'Esther Owusu', 'https://i.pravatar.cc/48?img=6', 'Esther Owusu profile photo', '+233 24 678 9012', 'esther.owusu@greaterworks.gh', 'Female', '1987-12-03', 'active', 'tithe-irregular', '2020-07-12', '2026-04-10', 78, 1500.00, 'Cape Coast, Ghana', 'Divorced', 'Accountant', '+233 20 432 1098', true),
  ('GWC-260415-N001', 'Daniel Appiah', 'https://i.pravatar.cc/48?img=7', 'Daniel Appiah profile photo', '+233 24 789 0123', 'daniel.appiah@greaterworks.gh', 'Male', '1993-05-18', 'new', 'tithe-none', '2026-04-01', '2026-04-13', 100, 0.00, 'Accra, Ghana', 'Single', 'Software Developer', '+233 20 321 0987', false),
  ('GWC-260415-N002', 'Rebecca Antwi', 'https://i.pravatar.cc/48?img=8', 'Rebecca Antwi profile photo', '+233 24 890 1234', 'rebecca.antwi@greaterworks.gh', 'Female', '1991-08-25', 'new', 'tithe-none', '2026-03-28', '2026-04-13', 100, 0.00, 'Kumasi, Ghana', 'Single', 'Marketing Executive', '+233 20 210 9876', false),
  ('GWC-260415-I001', 'Peter Nkrumah', 'https://i.pravatar.cc/48?img=9', 'Peter Nkrumah profile photo', '+233 24 901 2345', 'peter.nkrumah@greaterworks.gh', 'Male', '1975-01-12', 'inactive', 'tithe-none', '2015-05-20', '2025-12-25', 45, 5600.00, 'Sunyani, Ghana', 'Married', 'Farmer', '+233 20 109 8765', true),
  ('GWC-260415-I002', 'Joyce Amponsah', 'https://i.pravatar.cc/48?img=10', 'Joyce Amponsah profile photo', '+233 24 012 3456', 'joyce.amponsah@greaterworks.gh', 'Female', '1980-06-07', 'inactive', 'tithe-irregular', '2016-08-14', '2026-01-15', 35, 2100.00, 'Ho, Ghana', 'Widowed', 'Seamstress', '+233 20 098 7654', true),
  ('GWC-260415-T001', 'Francis Darko', 'https://i.pravatar.cc/48?img=11', 'Francis Darko profile photo', '+233 24 123 4567', 'francis.darko@greaterworks.gh', 'Male', '1988-04-20', 'transferred', 'tithe-faithful', '2019-02-10', '2025-11-30', 82, 3400.00, 'Tamale, Ghana', 'Married', 'Doctor', '+233 20 987 6543', true),
  ('GWC-260415-A007', 'Abigail Mensah', 'https://i.pravatar.cc/48?img=12', 'Abigail Mensah profile photo', '+233 24 234 5678', 'abigail.mensah@greaterworks.gh', 'Female', '1992-10-11', 'active', 'tithe-faithful', '2022-01-08', '2026-04-13', 90, 1600.00, 'Accra, Ghana', 'Single', 'Lawyer', '+233 20 876 5432', false);

-- =====================================================
-- STEP 4: UPDATE FOREIGN KEYS
-- =====================================================

-- Add foreign key constraints to cell_groups
ALTER TABLE cell_groups 
  ADD CONSTRAINT fk_cell_groups_leader_id 
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE cell_groups 
  ADD CONSTRAINT fk_cell_groups_assistant_leader_id 
  FOREIGN KEY (assistant_leader_id) REFERENCES members(id) ON DELETE SET NULL;

-- Add foreign key constraints to ministries
ALTER TABLE ministries 
  ADD CONSTRAINT fk_ministries_leader_id 
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE ministries 
  ADD CONSTRAINT fk_ministries_assistant_leader_id 
  FOREIGN KEY (assistant_leader_id) REFERENCES members(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 5: CREATE VIEWS AND FUNCTIONS
-- =====================================================

-- Member statistics view
CREATE OR REPLACE VIEW member_statistics AS
SELECT 
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'new') as new_members,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_members,
  COUNT(*) FILTER (WHERE status = 'transferred') as transferred_members,
  COUNT(*) FILTER (WHERE gender = 'Male') as male_members,
  COUNT(*) FILTER (WHERE gender = 'Female') as female_members,
  COUNT(*) FILTER (WHERE baptised = true) as baptised_members,
  COUNT(*) FILTER (WHERE tithe_status = 'tithe-faithful') as faithful_tithers,
  COUNT(*) FILTER (WHERE tithe_status = 'tithe-irregular') as irregular_tithers,
  COUNT(*) FILTER (WHERE tithe_status = 'tithe-none') as non_tithers,
  ROUND(AVG(attendance_rate), 2) as avg_attendance_rate,
  SUM(total_giving) as total_giving_amount
FROM members;

-- Cell group statistics view
CREATE OR REPLACE VIEW cell_group_statistics AS
SELECT 
  COUNT(*) as total_cell_groups,
  COUNT(*) FILTER (WHERE status = 'active') as active_groups,
  SUM(current_members) as total_members_in_groups,
  SUM(max_capacity) as total_capacity,
  ROUND(AVG(current_members), 2) as avg_members_per_group
FROM cell_groups;

-- Ministry statistics view
CREATE OR REPLACE VIEW ministry_statistics AS
SELECT 
  COUNT(*) as total_ministries,
  COUNT(*) FILTER (WHERE status = 'active') as active_ministries,
  SUM(current_members) as total_members_in_ministries,
  SUM(budget) as total_budget,
  ROUND(AVG(current_members), 2) as avg_members_per_ministry
FROM ministries;

-- Utility functions
CREATE OR REPLACE FUNCTION search_members(search_text TEXT)
RETURNS TABLE (id UUID, member_code TEXT, full_name TEXT, phone TEXT, email TEXT, status TEXT, rank REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.member_code, m.full_name, m.phone, m.email, m.status,
    ts_rank(to_tsvector('english', m.full_name || ' ' || COALESCE(m.phone, '') || ' ' || m.member_code), 
            plainto_tsquery('english', search_text)) as rank
  FROM members m
  WHERE to_tsvector('english', m.full_name || ' ' || COALESCE(m.phone, '') || ' ' || m.member_code) 
        @@ plainto_tsquery('english', search_text)
  ORDER BY rank DESC, m.full_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_member_age(member_id UUID)
RETURNS INTEGER AS $$
DECLARE
  birth_date DATE;
  member_age INTEGER;
BEGIN
  SELECT date_of_birth INTO birth_date FROM members WHERE id = member_id;
  IF birth_date IS NULL THEN RETURN 0; END IF;
  SELECT EXTRACT(YEAR FROM AGE(birth_date)) INTO member_age;
  RETURN COALESCE(member_age, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

-- Show summary
SELECT '========== DATABASE SUMMARY ==========' as header;

SELECT 'Cell Groups' as table_name, COUNT(*) as count FROM cell_groups
UNION ALL
SELECT 'Ministries' as table_name, COUNT(*) as count FROM ministries
UNION ALL
SELECT 'Members' as table_name, COUNT(*) as count FROM members;

-- Show member statistics
SELECT '========== MEMBER STATISTICS ==========' as header;
SELECT * FROM member_statistics;

-- Show cell group statistics
SELECT '========== CELL GROUP STATISTICS ==========' as header;
SELECT * FROM cell_group_statistics;

-- Show ministry statistics
SELECT '========== MINISTRY STATISTICS ==========' as header;
SELECT * FROM ministry_statistics;

-- Final status
SELECT '========================================' as footer;
SELECT 'ALL MIGRATIONS COMPLETED SUCCESSFULLY!' as final_status;
SELECT '========================================' as footer;