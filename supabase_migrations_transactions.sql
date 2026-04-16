-- Create transactions table for finance management
CREATE TABLE IF NOT EXISTS transactions (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- Allow authenticated users to read all transactions
CREATE POLICY "Allow authenticated users to read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert transactions
CREATE POLICY "Allow authenticated users to insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update transactions
CREATE POLICY "Allow authenticated users to update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete transactions
CREATE POLICY "Allow authenticated users to delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data (optional - for testing)
INSERT INTO transactions (date, type, category, description, method, amount, reference, notes, recorded_by) VALUES
  ('2026-04-13', 'income', 'Tithe', 'Sunday Tithe Collection', 'Cash', 1250.00, NULL, 'Combined tithes from Sunday service', 'Admin'),
  ('2026-04-13', 'income', 'Offering', 'Sunday Offering', 'Cash', 450.00, NULL, NULL, 'Admin'),
  ('2026-04-13', 'income', 'Building Fund', 'Building Project Donation', 'Bank Transfer', 1500.00, 'GTB-TRX-1021', NULL, 'Admin'),
  ('2026-04-12', 'expense', 'Utilities', 'Electricity Bill - April', 'Bank Transfer', 450.00, 'ECG-APR-2026', NULL, 'Admin'),
  ('2026-04-11', 'expense', 'Salaries', 'Pastor Salary - April', 'Bank Transfer', 2000.00, 'SAL-APR-001', NULL, 'Admin'),
  ('2026-04-10', 'income', 'Offering', 'Midweek Service Offering', 'Mobile Money', 320.00, 'MOMO-7701', NULL, 'Admin'),
  ('2026-04-10', 'expense', 'Maintenance', 'Sound System Repair', 'Cash', 350.00, NULL, 'Fixed microphone and speakers', 'Admin'),
  ('2026-04-09', 'expense', 'Events', 'Easter Program Expenses', 'Cash', 800.00, NULL, 'Decorations and refreshments', 'Admin'),
  ('2026-04-08', 'expense', 'Supplies', 'Office Supplies', 'Cash', 120.00, NULL, NULL, 'Admin'),
  ('2026-04-07', 'expense', 'Outreach', 'Community Outreach', 'Cash', 500.00, NULL, 'Food and materials for outreach', 'Admin'),
  ('2026-04-06', 'income', 'Donation', 'Anonymous Donation', 'Bank Transfer', 2500.00, 'GTB-TRX-1001', NULL, 'Admin'),
  ('2026-04-05', 'expense', 'Transport', 'Fuel for Church Van', 'Cash', 200.00, NULL, NULL, 'Admin'),
  ('2026-04-03', 'expense', 'Utilities', 'Water Bill - April', 'Bank Transfer', 80.00, 'GWCL-APR-2026', NULL, 'Admin'),
  ('2026-04-01', 'expense', 'Salaries', 'Admin Staff Salary', 'Bank Transfer', 1200.00, 'SAL-APR-002', NULL, 'Admin');

-- Create a view for financial summary
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
  DATE_TRUNC('month', date) as month,
  type,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM transactions
GROUP BY DATE_TRUNC('month', date), type
ORDER BY month DESC, type;

-- Create a view for category breakdown
CREATE OR REPLACE VIEW category_breakdown AS
SELECT 
  type,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as average_amount
FROM transactions
GROUP BY type, category
ORDER BY type, total_amount DESC;

COMMENT ON TABLE transactions IS 'Stores all financial transactions (income and expenses) for the church';
COMMENT ON COLUMN transactions.type IS 'Transaction type: income or expense';
COMMENT ON COLUMN transactions.category IS 'Category of the transaction (e.g., Tithe, Offering, Utilities, Salaries)';
COMMENT ON COLUMN transactions.member_id IS 'Optional reference to the member who made the transaction (for income)';
COMMENT ON COLUMN transactions.method IS 'Payment method used';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in local currency';
COMMENT ON COLUMN transactions.reference IS 'Optional transaction reference number';
COMMENT ON COLUMN transactions.recorded_by IS 'User who recorded the transaction';
