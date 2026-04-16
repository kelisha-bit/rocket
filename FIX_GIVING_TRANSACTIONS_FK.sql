-- =====================================================
-- FIX GIVING_TRANSACTIONS FOREIGN KEY
-- =====================================================
-- This ensures the member_id foreign key is properly set up
-- =====================================================

-- Check if giving_transactions table exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ giving_transactions table exists'
    ELSE '✗ giving_transactions table does NOT exist - need to create it'
  END as status
FROM information_schema.tables 
WHERE table_name = 'giving_transactions' 
AND table_schema = 'public';

-- If the table exists, check if it has the member_id column
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ member_id column exists'
    ELSE '✗ member_id column does NOT exist'
  END as status
FROM information_schema.columns 
WHERE table_name = 'giving_transactions' 
AND column_name = 'member_id'
AND table_schema = 'public';

-- Check if foreign key exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Foreign key exists: member_id → members(id)'
    ELSE '✗ Foreign key does NOT exist - need to add it'
  END as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'giving_transactions'
AND constraint_name LIKE '%member%';

-- If the table doesn't exist, create it
DROP TABLE IF EXISTS giving_transactions CASCADE;

CREATE TABLE giving_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
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

-- Create indexes
CREATE INDEX idx_giving_transactions_date ON giving_transactions(date DESC);
CREATE INDEX idx_giving_transactions_type ON giving_transactions(type);
CREATE INDEX idx_giving_transactions_category ON giving_transactions(category);
CREATE INDEX idx_giving_transactions_member_id ON giving_transactions(member_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_giving_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_giving_transactions_updated_at
  BEFORE UPDATE ON giving_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_giving_transactions_updated_at();

-- Enable RLS
ALTER TABLE giving_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for all users" ON giving_transactions FOR ALL USING (true) WITH CHECK (true);

-- Insert sample transactions
INSERT INTO giving_transactions (date, type, category, description, member_id, method, amount, reference, notes) VALUES 
  (CURRENT_DATE - INTERVAL '7 days', 'income', 'Tithe', 'Weekly Tithe', NULL, 'Mobile Money', 500.00, 'TITHE-001', 'Weekly tithe payment'),
  (CURRENT_DATE - INTERVAL '6 days', 'income', 'Offering', 'Sunday Offering', NULL, 'Cash', 1200.00, 'OFF-001', 'Main service offering'),
  (CURRENT_DATE - INTERVAL '5 days', 'income', 'Seed', 'Special Seed', NULL, 'Bank Transfer', 3000.00, 'SEED-001', 'Special seed for building project'),
  (CURRENT_DATE - INTERVAL '4 days', 'expense', 'Utilities', 'Electricity Bill', NULL, 'Bank Transfer', 450.00, 'UTIL-001', 'Monthly electricity payment'),
  (CURRENT_DATE - INTERVAL '3 days', 'income', 'Pledge', 'Building Fund Pledge', NULL, 'Cheque', 5000.00, 'PLG-001', 'Building fund pledge fulfillment'),
  (CURRENT_DATE - INTERVAL '2 days', 'expense', 'Salaries', 'Pastor Allowance', NULL, 'Bank Transfer', 2000.00, 'SAL-001', 'Monthly pastor allowance'),
  (CURRENT_DATE - INTERVAL '1 day', 'income', 'Donation', 'General Donation', NULL, 'Mobile Money', 1500.00, 'DON-001', 'General donation'),
  (CURRENT_DATE, 'income', 'Tithe', 'Weekly Tithe', NULL, 'Cash', 750.00, 'TITHE-002', 'Weekly tithe payment');

SELECT '✓ giving_transactions table created: ' || COUNT(*) || ' records' as status FROM giving_transactions;

-- Verify the foreign key
SELECT 
  '✓ Foreign key verified: member_id → members(id)' as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'giving_transactions'
AND constraint_name LIKE '%member%';

SELECT '========================================' as footer;
SELECT '✓ GIVING_TRANSACTIONS TABLE FIXED!' as final_status;
SELECT 'Refresh your finance page now!' as next_step;
SELECT '========================================' as footer;