-- =====================================================
-- MEMBERS MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the members management system
-- for church member registration, profiles, and tracking.
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
  primary_cell_group_id UUID,
  primary_ministry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
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

-- Create trigger to automatically update updated_at timestamp
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

-- Create function to generate unique member codes
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate code in format GWC-YYMMDD-XXXX
    code := 'GWC-' || 
            TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check FROM members WHERE member_code = code;
    
    -- If unique, return the code
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate member code if not provided
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

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for members
CREATE POLICY "Enable read access for all users"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON members FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON members FOR DELETE
  USING (true);

-- Create view for member statistics
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
  SUM(total_giving) as total_giving_amount,
  COUNT(*) FILTER (WHERE date_of_birth IS NOT NULL AND 
    EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 35) as young_adults,
  COUNT(*) FILTER (WHERE date_of_birth IS NOT NULL AND 
    EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 55) as middle_aged,
  COUNT(*) FILTER (WHERE date_of_birth IS NOT NULL AND 
    EXTRACT(YEAR FROM AGE(date_of_birth)) > 55) as seniors
FROM members;

-- Create view for member demographics
CREATE OR REPLACE VIEW member_demographics AS
SELECT 
  gender,
  marital_status,
  status,
  tithe_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM members
GROUP BY gender, marital_status, status, tithe_status
ORDER BY count DESC;

-- Insert sample member data
INSERT INTO members (
  member_code, full_name, photo_url, photo_alt, phone, email, gender, 
  date_of_birth, status, tithe_status, join_date, last_attendance_date, 
  attendance_rate, total_giving, address, marital_status, occupation, 
  emergency_contact, baptised
) VALUES 
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

-- Create utility functions for member management

-- Function to search members by text
CREATE OR REPLACE FUNCTION search_members(search_text TEXT)
RETURNS TABLE (
  id UUID,
  member_code TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  status TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.member_code,
    m.full_name,
    m.phone,
    m.email,
    m.status,
    ts_rank(to_tsvector('english', m.full_name || ' ' || COALESCE(m.phone, '') || ' ' || m.member_code), 
            plainto_tsquery('english', search_text)) as rank
  FROM members m
  WHERE to_tsvector('english', m.full_name || ' ' || COALESCE(m.phone, '') || ' ' || m.member_code) 
        @@ plainto_tsquery('english', search_text)
  ORDER BY rank DESC, m.full_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get member age
CREATE OR REPLACE FUNCTION get_member_age(member_id UUID)
RETURNS INTEGER AS $$
DECLARE
  birth_date DATE;
  member_age INTEGER;
BEGIN
  SELECT date_of_birth INTO birth_date FROM members WHERE id = member_id;
  
  IF birth_date IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT EXTRACT(YEAR FROM AGE(birth_date)) INTO member_age;
  RETURN COALESCE(member_age, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update member attendance rate
CREATE OR REPLACE FUNCTION update_member_attendance_rate(
  member_id UUID,
  new_attendance_rate INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE members 
  SET 
    attendance_rate = new_attendance_rate,
    last_attendance_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = member_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update member giving total
CREATE OR REPLACE FUNCTION update_member_giving_total(
  member_id UUID,
  additional_amount DECIMAL(10, 2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE members 
  SET 
    total_giving = total_giving + additional_amount,
    updated_at = NOW()
  WHERE id = member_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE members IS 'Church member registration and profile management';
COMMENT ON COLUMN members.id IS 'Unique identifier for each member';
COMMENT ON COLUMN members.member_code IS 'Unique member code in format GWC-YYMMDD-XXXX';
COMMENT ON COLUMN members.full_name IS 'Full name of the member';
COMMENT ON COLUMN members.photo_url IS 'URL to member profile photo';
COMMENT ON COLUMN members.photo_alt IS 'Alt text for member photo';
COMMENT ON COLUMN members.phone IS 'Primary phone number';
COMMENT ON COLUMN members.email IS 'Primary email address';
COMMENT ON COLUMN members.gender IS 'Gender: Male or Female';
COMMENT ON COLUMN members.date_of_birth IS 'Date of birth for age calculation';
COMMENT ON COLUMN members.status IS 'Member status: active, inactive, new, transferred';
COMMENT ON COLUMN members.tithe_status IS 'Tithe giving status: faithful, irregular, none';
COMMENT ON COLUMN members.join_date IS 'Date when member joined the church';
COMMENT ON COLUMN members.last_attendance_date IS 'Last recorded attendance date';
COMMENT ON COLUMN members.attendance_rate IS 'Attendance percentage (0-100)';
COMMENT ON COLUMN members.total_giving IS 'Total amount given by member';
COMMENT ON COLUMN members.address IS 'Home address';
COMMENT ON COLUMN members.marital_status IS 'Marital status: Single, Married, Widowed, Divorced';
COMMENT ON COLUMN members.occupation IS 'Professional occupation';
COMMENT ON COLUMN members.emergency_contact IS 'Emergency contact information';
COMMENT ON COLUMN members.baptised IS 'Whether member has been baptised';
COMMENT ON COLUMN members.primary_cell_group_id IS 'Primary cell group assignment';
COMMENT ON COLUMN members.primary_ministry_id IS 'Primary ministry assignment';

-- Verification queries
SELECT 'Members table created successfully!' as status;
SELECT 'Total members inserted: ' || COUNT(*) as sample_data FROM members;
SELECT 'Member statistics view created!' as view_status;

-- Test the member statistics view
SELECT * FROM member_statistics;

-- Test member search function
SELECT 'Testing search function...' as test;
SELECT * FROM search_members('John') LIMIT 3;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'members';

SELECT 'Members module migration completed successfully!' as final_status;