-- =====================================================
-- RECREATE giving_transactions TABLE
-- =====================================================
-- This will backup existing data and recreate the table
-- with the correct structure for the finance module
-- =====================================================

-- Step 1: Backup existing data if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'giving_transactions') THEN
    -- Create backup table
    DROP TABLE IF EXISTS giving_transactions_backup;
    CREATE TABLE giving_transactions_backup AS SELECT * FROM giving_transactions;
    RAISE NOTICE 'Existing data backed up to giving_transactions_backup';
    
    -- Drop the old table
    DROP TABLE giving_transactions CASCADE;
    RAISE NOTICE 'Old table dropped';
  ELSE
    RAISE NOTICE 'No existing table to backup';
  END IF;
END $$;

-- Step 2: Create the table with correct structure
CREATE TABLE giving_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  reference TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_giving_transactions_date ON giving_transactions(date DESC);
CREATE INDEX idx_giving_transactions_type ON giving_transactions(type);
CREATE INDEX idx_giving_transactions_category ON giving_transactions(category);
CREATE INDEX idx_giving_transactions_member_id ON giving_transactions(member_id);
CREATE INDEX idx_giving_transactions_created_at ON giving_transactions(created_at DESC);

-- Step 4: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_giving_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER giving_transactions_updated_at
  BEFORE UPDATE ON giving_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_giving_transactions_updated_at();

-- Step 5: Enable Row Level Security
ALTER TABLE giving_transactions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read transactions"
  ON giving_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert transactions"
  ON giving_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update transactions"
  ON giving_transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete transactions"
  ON giving_transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 7: Insert sample data
INSERT INTO giving_transactions (date, type, category, description, method, amount, reference, notes, recorded_by) VALUES
  ('2026-04-13', 'income', 'Tithe', 'Sunday Tithe Collection', 'Cash', 5000.00, 'TH-2026-04-13', 'Easter Sunday', 'Admin'),
  ('2026-04-13', 'income', 'Offering', 'Sunday Offering', 'Cash', 3500.00, 'OF-2026-04-13', 'Easter Sunday', 'Admin'),
  ('2026-04-13', 'income', 'Building Fund', 'Building Fund Contribution', 'Mobile Money', 2000.00, 'BF-2026-04-13', NULL, 'Admin'),
  ('2026-04-10', 'expense', 'Utilities', 'Electricity Bill - March', 'Bank Transfer', 1200.00, 'ECG-2026-03', NULL, 'Admin'),
  ('2026-04-08', 'expense', 'Maintenance', 'Sound System Repair', 'Cash', 800.00, 'INV-2026-001', 'Fixed microphone issues', 'Admin'),
  ('2026-04-06', 'income', 'Tithe', 'Sunday Tithe Collection', 'Cash', 4800.00, 'TH-2026-04-06', NULL, 'Admin'),
  ('2026-04-06', 'income', 'Offering', 'Sunday Offering', 'Cash', 3200.00, 'OF-2026-04-06', NULL, 'Admin'),
  ('2026-04-05', 'expense', 'Supplies', 'Communion Elements', 'Cash', 350.00, 'SUP-2026-001', 'Bread and juice', 'Admin'),
  ('2026-04-03', 'expense', 'Transport', 'Fuel for Church Van', 'Cash', 500.00, NULL, 'Outreach program', 'Admin'),
  ('2026-03-30', 'income', 'Tithe', 'Sunday Tithe Collection', 'Cash', 4500.00, 'TH-2026-03-30', NULL, 'Admin'),
  ('2026-03-30', 'income', 'Offering', 'Sunday Offering', 'Cash', 3000.00, 'OF-2026-03-30', NULL, 'Admin'),
  ('2026-03-28', 'expense', 'Salaries', 'Staff Salaries - March', 'Bank Transfer', 8000.00, 'SAL-2026-03', NULL, 'Admin'),
  ('2026-03-25', 'income', 'Special Offering', 'Missions Offering', 'Cash', 2500.00, 'SO-2026-03-25', 'Missions Sunday', 'Admin'),
  ('2026-03-20', 'expense', 'Events', 'Youth Conference Expenses', 'Cash', 1500.00, 'YC-2026-001', 'Venue and refreshments', 'Admin'),
  ('2026-03-15', 'income', 'Seed', 'Seed Offering', 'Mobile Money', 1000.00, 'SD-2026-03-15', NULL, 'Admin'),
  ('2026-03-10', 'expense', 'Utilities', 'Water Bill - February', 'Bank Transfer', 450.00, 'GWCL-2026-02', NULL, 'Admin'),
  ('2026-03-05', 'income', 'Pledge', 'Building Pledge Payment', 'Bank Transfer', 3000.00, 'PL-2026-001', 'Monthly pledge', 'Admin'),
  ('2026-02-28', 'expense', 'Salaries', 'Staff Salaries - February', 'Bank Transfer', 8000.00, 'SAL-2026-02', NULL, 'Admin'),
  ('2026-02-23', 'income', 'Tithe', 'Sunday Tithe Collection', 'Cash', 4200.00, 'TH-2026-02-23', NULL, 'Admin'),
  ('2026-02-20', 'expense', 'Outreach', 'Community Outreach Program', 'Cash', 1200.00, 'OUT-2026-001', 'Food and materials', 'Admin');

-- Step 8: Verification
SELECT 'Table recreated successfully!' as status;
SELECT COUNT(*) as total_records FROM giving_transactions;

-- Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'giving_transactions'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
  date,
  type,
  category,
  description,
  amount
FROM giving_transactions 
ORDER BY date DESC 
LIMIT 5;

-- =====================================================
-- NOTES:
-- - Old data is backed up in giving_transactions_backup
-- - To restore old data, you would need to map columns
-- - New table has 20 sample transactions
-- - All indexes and policies are set up
-- =====================================================
