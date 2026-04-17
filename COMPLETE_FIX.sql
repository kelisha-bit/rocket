-- =====================================================
-- COMPLETE FIX - Recreate all tables in correct order
-- =====================================================
-- This ensures all foreign keys are properly set up
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL TABLES
-- =====================================================

DROP TABLE IF EXISTS ministries CASCADE;
DROP TABLE IF EXISTS cell_groups CASCADE;
DROP TABLE IF EXISTS members CASCADE;

SELECT '✓ All tables dropped' as status;

-- =====================================================
-- STEP 2: CREATE MEMBERS TABLE FIRST
-- =====================================================

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
  attendance_rate INTEGER DEFAULT 0,
  total_giving DECIMAL(10, 2) DEFAULT 0,
  address TEXT,
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')) DEFAULT 'Single',
  occupation TEXT,
  emergency_contact TEXT,
  baptised BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for members
CREATE INDEX idx_members_member_code ON members(member_code);
CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_status ON members(status);

-- Create trigger for members
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

-- Enable RLS for members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for all users" ON members FOR ALL USING (true) WITH CHECK (true);

-- Insert sample members
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

SELECT '✓ Members table created: ' || COUNT(*) || ' records' as status FROM members;

-- =====================================================
-- STEP 3: CREATE MINISTRIES TABLE (with FK to members)
-- =====================================================

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

-- Create indexes for ministries
CREATE INDEX idx_ministries_name ON ministries(name);
CREATE INDEX idx_ministries_status ON ministries(status);
CREATE INDEX idx_ministries_head_member_id ON ministries(head_member_id);

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
CREATE POLICY "Enable all access for all users" ON ministries FOR ALL USING (true) WITH CHECK (true);

-- Insert sample ministries
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

SELECT '✓ Ministries table created: ' || COUNT(*) || ' records' as status FROM ministries;

-- =====================================================
-- STEP 4: CREATE CELL GROUPS TABLE
-- =====================================================

CREATE TABLE cell_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
  meeting_day TEXT DEFAULT 'Wednesday',
  meeting_time TEXT DEFAULT '7:00 PM',
  location TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Suspended')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cell_groups
CREATE INDEX idx_cell_groups_name ON cell_groups(name);
CREATE INDEX idx_cell_groups_status ON cell_groups(status);
CREATE INDEX idx_cell_groups_leader_id ON cell_groups(leader_id);

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
CREATE POLICY "Enable all access for all users" ON cell_groups FOR ALL USING (true) WITH CHECK (true);

-- Insert sample cell groups
INSERT INTO cell_groups (name, leader_id, meeting_day, meeting_time, location, status) VALUES 
  ('Victory Cell Group', NULL, 'Wednesday', '7:00 PM', 'East Legon', 'Active'),
  ('Faith Builders', NULL, 'Friday', '6:30 PM', 'Accra Central', 'Active'),
  ('Hope Fellowship', NULL, 'Saturday', '4:00 PM', 'Tema', 'Active'),
  ('Grace Circle', NULL, 'Thursday', '5:00 PM', 'Kumasi', 'Active'),
  ('Mighty Men', NULL, 'Tuesday', '6:00 PM', 'Takoradi', 'Active'),
  ('Youth Fire', NULL, 'Sunday', '2:00 PM', 'Cape Coast', 'Active'),
  ('Seniors Circle', NULL, 'Monday', '3:00 PM', 'Ho', 'Active'),
  ('New Beginnings', NULL, 'Wednesday', '6:00 PM', 'Sunyani', 'Active');

SELECT '✓ Cell Groups table created: ' || COUNT(*) || ' records' as status FROM cell_groups;

-- =====================================================
-- STEP 5: ADD MEMBER CODE GENERATION FUNCTION
-- =====================================================

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

SELECT '✓ Member code generation function created' as status;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT '========== DATABASE SETUP COMPLETE ==========' as header;

SELECT 'Members' as table_name, COUNT(*) as count FROM members
UNION ALL
SELECT 'Ministries', COUNT(*) FROM ministries
UNION ALL
SELECT 'Cell Groups', COUNT(*) FROM cell_groups;

-- Verify foreign keys
SELECT '========== FOREIGN KEYS ==========' as header;

SELECT 
  tc.table_name || ' → ' || ccu.table_name AS relationship,
  kcu.column_name AS column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('ministries', 'cell_groups')
ORDER BY tc.table_name;

SELECT '========================================' as footer;
SELECT '✓ ALL TABLES CREATED WITH PROPER FOREIGN KEYS!' as final_status;
SELECT 'Refresh your /member-management page now!' as next_step;
SELECT '========================================' as footer;