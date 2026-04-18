-- =====================================================
-- CERTIFICATES MODULE - DATABASE MIGRATION
-- =====================================================
-- This migration creates the certificate generation system
-- for church members including baptism, membership, and
-- achievement certificates.
-- =====================================================

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS certificates CASCADE;

-- Create certificate types enum
CREATE TYPE certificate_type AS ENUM (
  'baptism',
  'membership',
  'achievement',
  'appreciation',
  'completion',
  'ordination',
  'leadership'
);

-- Create certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type certificate_type NOT NULL DEFAULT 'membership',
  title TEXT NOT NULL,
  description TEXT,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  signed_by TEXT,
  signatory_title TEXT,
  church_name TEXT DEFAULT 'GreaterWorks City Church',
  church_location TEXT DEFAULT 'Accra, Ghana',
  status TEXT CHECK (status IN ('active', 'revoked', 'expired')) DEFAULT 'active',
  revocation_reason TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_certificates_member_id ON certificates(member_id);
CREATE INDEX idx_certificates_type ON certificates(type);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_issued_date ON certificates(issued_date DESC);
CREATE INDEX idx_certificates_created_at ON certificates(created_at DESC);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- Create function to generate unique certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number(cert_type certificate_type)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  code TEXT;
  exists_check INTEGER;
BEGIN
  -- Determine prefix based on certificate type
  prefix := CASE cert_type
    WHEN 'baptism' THEN 'BAP'
    WHEN 'membership' THEN 'MEM'
    WHEN 'achievement' THEN 'ACH'
    WHEN 'appreciation' THEN 'APR'
    WHEN 'completion' THEN 'COM'
    WHEN 'ordination' THEN 'ORD'
    WHEN 'leadership' THEN 'LED'
    ELSE 'CER'
  END;

  LOOP
    -- Generate code in format PREFIX-YYMMDD-XXXX
    code := prefix || '-' || 
            TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check FROM certificates WHERE certificate_number = code;
    
    -- If unique, return the code
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate certificate number if not provided
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := generate_certificate_number(NEW.type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_number
  BEFORE INSERT ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_number();

-- Enable Row Level Security (RLS)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for certificates
CREATE POLICY "Enable read access for all users"
  ON certificates FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON certificates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON certificates FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON certificates FOR DELETE
  USING (true);

-- Create view for certificate statistics
CREATE OR REPLACE VIEW certificate_statistics AS
SELECT 
  COUNT(*) as total_certificates,
  COUNT(*) FILTER (WHERE status = 'active') as active_certificates,
  COUNT(*) FILTER (WHERE status = 'revoked') as revoked_certificates,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_certificates,
  COUNT(*) FILTER (WHERE type = 'baptism') as baptism_certificates,
  COUNT(*) FILTER (WHERE type = 'membership') as membership_certificates,
  COUNT(*) FILTER (WHERE type = 'achievement') as achievement_certificates,
  COUNT(*) FILTER (WHERE type = 'appreciation') as appreciation_certificates,
  COUNT(*) FILTER (WHERE type = 'completion') as completion_certificates,
  COUNT(*) FILTER (WHERE type = 'ordination') as ordination_certificates,
  COUNT(*) FILTER (WHERE type = 'leadership') as leadership_certificates,
  COUNT(*) FILTER (WHERE issued_date >= CURRENT_DATE - INTERVAL '30 days') as issued_last_30_days,
  COUNT(*) FILTER (WHERE issued_date >= CURRENT_DATE - INTERVAL '90 days') as issued_last_90_days
FROM certificates;

-- Create view for member certificates with full details
CREATE OR REPLACE VIEW member_certificates_view AS
SELECT 
  c.*,
  m.full_name as member_name,
  m.photo_url as member_photo,
  m.phone as member_phone,
  m.email as member_email,
  m.gender as member_gender
FROM certificates c
JOIN members m ON c.member_id = m.id;

-- Function to revoke a certificate
CREATE OR REPLACE FUNCTION revoke_certificate(
  cert_id UUID,
  reason TEXT,
  revoked_by_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE certificates 
  SET 
    status = 'revoked',
    revocation_reason = reason,
    revoked_at = NOW(),
    revoked_by = revoked_by_id,
    updated_at = NOW()
  WHERE id = cert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get member certificate count
CREATE OR REPLACE FUNCTION get_member_certificate_count(member_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  cert_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cert_count 
  FROM certificates 
  WHERE member_id = member_uuid AND status = 'active';
  RETURN COALESCE(cert_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Insert sample certificate data
INSERT INTO certificates (
  certificate_number, member_id, type, title, description, 
  issued_date, signed_by, signatory_title, status
) 
SELECT 
  generate_certificate_number('membership'::certificate_type),
  m.id,
  'membership'::certificate_type,
  'Certificate of Membership',
  'This certifies that the bearer is a recognized member of GreaterWorks City Church in good standing.',
  CURRENT_DATE - INTERVAL '1 day',
  'Pastor John Doe',
  'Senior Pastor',
  'active'
FROM members m
WHERE m.status = 'active'
LIMIT 3;

-- Add comments for documentation
COMMENT ON TABLE certificates IS 'Certificate generation and management for church members';
COMMENT ON COLUMN certificates.id IS 'Unique identifier for each certificate';
COMMENT ON COLUMN certificates.certificate_number IS 'Unique certificate number in format PREFIX-YYMMDD-XXXX';
COMMENT ON COLUMN certificates.member_id IS 'Reference to the member who received the certificate';
COMMENT ON COLUMN certificates.type IS 'Type of certificate: baptism, membership, achievement, etc.';
COMMENT ON COLUMN certificates.title IS 'Certificate title/display name';
COMMENT ON COLUMN certificates.description IS 'Detailed description or message on the certificate';
COMMENT ON COLUMN certificates.issued_date IS 'Date the certificate was issued';
COMMENT ON COLUMN certificates.expiry_date IS 'Optional expiration date for the certificate';
COMMENT ON COLUMN certificates.signed_by IS 'Name of the person who signed the certificate';
COMMENT ON COLUMN certificates.signatory_title IS 'Title/position of the signatory';
COMMENT ON COLUMN certificates.status IS 'Certificate status: active, revoked, or expired';

-- Verification queries
SELECT 'Certificates table created successfully!' as status;
SELECT 'Total certificates inserted: ' || COUNT(*) as sample_data FROM certificates;
SELECT 'Certificate statistics view created!' as view_status;

-- Test the certificate statistics view
SELECT * FROM certificate_statistics;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'certificates';

SELECT 'Certificates module migration completed successfully!' as final_status;
