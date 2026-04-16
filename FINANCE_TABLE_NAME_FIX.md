# Finance Module - Table Name Fix

## Issue
The finance module code was looking for a table named `transactions`, but the actual Supabase database table is named `giving_transactions`.

## Error Message
```
Could not find the table 'public.transactions' in the schema cache
Perhaps you meant the table 'public.giving_transactions'
code=PGRST205
```

## ✅ Fix Applied

Updated `src/lib/supabase/transactions.ts` to use the correct table name `giving_transactions` in all queries:

### Changes Made:
1. ✅ `fetchTransactions()` - Changed from `transactions` to `giving_transactions`
2. ✅ `fetchTransactionsByType()` - Changed from `transactions` to `giving_transactions`
3. ✅ `fetchTransactionsByDateRange()` - Changed from `transactions` to `giving_transactions`
4. ✅ `fetchTransactionById()` - Changed from `transactions` to `giving_transactions`
5. ✅ `createTransaction()` - Changed from `transactions` to `giving_transactions`
6. ✅ `updateTransaction()` - Changed from `transactions` to `giving_transactions`
7. ✅ `deleteTransaction()` - Changed from `transactions` to `giving_transactions`
8. ✅ `getFinancialSummary()` - Changed from `transactions` to `giving_transactions`
9. ✅ `getCategoryBreakdown()` - Changed from `transactions` to `giving_transactions`

## Testing

After this fix, the finance module should work correctly:

1. **Navigate to `/finance`**
2. **Click "Add Income"** or **"Add Expense"**
3. **Fill the form** and save
4. **Verify** the transaction appears in the list
5. **Test edit** and **delete** operations

## Database Schema

The actual table in your Supabase database is:

```sql
giving_transactions (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
  method TEXT CHECK (method IN ('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque')),
  amount DECIMAL(10, 2) NOT NULL,
  reference TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Migration File Note

The migration file `supabase_migrations_transactions.sql` creates a table named `transactions`, but your database already has `giving_transactions`. 

### Options:

**Option 1: Use Existing Table (Recommended)**
- ✅ Already done - Code now uses `giving_transactions`
- No migration needed
- Finance module will work with existing data

**Option 2: Rename Database Table**
If you want to rename the database table to match the migration:
```sql
ALTER TABLE giving_transactions RENAME TO transactions;
```
Then revert the code changes to use `transactions`.

**Option 3: Keep Both Names Consistent**
Update the migration file to create `giving_transactions` instead of `transactions` for future reference.

## Recommendation

**Use Option 1** (already applied) - Keep using `giving_transactions` as it's the existing table name in your database. The code has been updated to match.

## Verification

To verify the fix is working:

```sql
-- Check if table exists
SELECT COUNT(*) FROM giving_transactions;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'giving_transactions';

-- Test a simple query
SELECT * FROM giving_transactions LIMIT 5;
```

## Status

✅ **FIXED** - Finance module now correctly uses `giving_transactions` table name.

The finance page should now work without the 404 errors!
