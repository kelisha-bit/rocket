-- =====================================================
-- FIX giving_transactions TABLE STRUCTURE
-- =====================================================
-- This migration will update the giving_transactions table
-- to match what the finance module code expects
-- =====================================================

-- First, let's check what we're working with
DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'giving_transactions') THEN
    RAISE NOTICE 'Table giving_transactions exists. Checking structure...';
    
    -- Add missing columns if they don't exist
    
    -- Add category column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'category') THEN
      ALTER TABLE giving_transactions ADD COLUMN category TEXT;
      RAISE NOTICE 'Added category column';
    END IF;
    
    -- Add description column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'description') THEN
      ALTER TABLE giving_transactions ADD COLUMN description TEXT;
      RAISE NOTICE 'Added description column';
    END IF;
    
    -- Add method column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'method') THEN
      ALTER TABLE giving_transactions ADD COLUMN method TEXT;
      RAISE NOTICE 'Added method column';
    END IF;
    
    -- Add reference column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'reference') THEN
      ALTER TABLE giving_transactions ADD COLUMN reference TEXT;
      RAISE NOTICE 'Added reference column';
    END IF;
    
    -- Add notes column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'notes') THEN
      ALTER TABLE giving_transactions ADD COLUMN notes TEXT;
      RAISE NOTICE 'Added notes column';
    END IF;
    
    -- Add recorded_by column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'recorded_by') THEN
      ALTER TABLE giving_transactions ADD COLUMN recorded_by TEXT;
      RAISE NOTICE 'Added recorded_by column';
    END IF;
    
    -- Add member_id column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'giving_transactions' AND column_name = 'member_id') THEN
      ALTER TABLE giving_transactions ADD COLUMN member_id UUID REFERENCES members(id) ON DELETE SET NULL;
      RAISE NOTICE 'Added member_id column';
    END IF;
    
  ELSE
    RAISE NOTICE 'Table giving_transactions does not exist. Creating it...';
  END IF;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS giving_transactions (
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

-- Update constraints if table already existed
DO $$
BEGIN
  -- Drop old constraints if they exist
  ALTER TABLE giving_transactions DROP CONSTRAINT IF EXISTS giving_transactions_type_check;
  ALTER TABLE giving_transactions DROP CONSTRAINT IF EXISTS giving_transactions_method_check;
  ALTER TABLE giving_transactions DROP CONSTRAINT IF EXISTS giving_transactions_amount_check;
  
  -- Add new constraints
  ALTER TABLE giving_transactions ADD CONSTRAINT giving_transactions_type_check 
    CHECK (type IN ('income', 'expense'));
  
  ALTER TABLE giving_transactions ADD CONSTRAINT giving_transactions_method_check 
    CHECK (method IN ('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'));
  
  ALTER TABLE giving_transactions ADD CONSTRAINT giving_transactions_amount_check 
    CHECK (amount > 0);
    
  RAISE NOTICE 'Constraints updated';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Some constraints may already exist or columns may not exist yet';
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_giving_transactions_date ON giving_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_giving_transactions_type ON giving_transactions(type);
CREATE INDEX IF NOT EXISTS idx_giving_transactions_category ON giving_transactions(category);
CREATE INDEX IF NOT EXISTS idx_giving_transactions_member_id ON giving_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_giving_transactions_created_at ON giving_transactions(created_at DESC);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_giving_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS giving_transactions_updated_at ON giving_transactions;
CREATE TRIGGER giving_transactions_updated_at
  BEFORE UPDATE ON giving_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_giving_transactions_updated_at();

-- Enable Row Level Security
ALTER TABLE giving_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON giving_transactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON giving_transactions;

-- Create policies for authenticated users
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

-- Insert sample data if table is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM giving_transactions) = 0 THEN
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
      ('2026-03-15', 'income', 'Seed', 'Seed Offering', 'Mobile Money', 1000.00, 'SD-2026-03-15', NULL, 'Admin');
    
    RAISE NOTICE 'Sample data inserted';
  ELSE
    RAISE NOTICE 'Table already has data, skipping sample data insertion';
  END IF;
END $$;

-- Verification queries
SELECT 'Table structure updated successfully!' as status;
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
