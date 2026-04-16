# Finance Module - Database Integration Guide

## Overview
The finance module has been fully integrated with Supabase database for persistent storage of income and expense transactions.

## Database Structure

### Transactions Table
```sql
transactions (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
  method TEXT NOT NULL CHECK (method IN ('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque')),
  amount DECIMAL(10, 2) NOT NULL,
  reference TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Income Categories
- Tithe
- Offering
- Seed
- Pledge
- Special Offering
- Building Fund
- Donation

### Expense Categories
- Utilities
- Salaries
- Maintenance
- Events
- Outreach
- Supplies
- Transport
- Other

### Payment Methods
- Cash
- Mobile Money
- Bank Transfer
- Cheque

## Files Created

### 1. Database Layer (`src/lib/supabase/transactions.ts`)
- **Purpose**: Direct Supabase database operations
- **Functions**:
  - `fetchTransactions()` - Get all transactions
  - `fetchTransactionsByType(type)` - Filter by income/expense
  - `fetchTransactionsByDateRange(start, end)` - Date range filtering
  - `fetchTransactionById(id)` - Get single transaction
  - `createTransaction(data)` - Add new transaction
  - `updateTransaction(id, data)` - Update existing transaction
  - `deleteTransaction(id)` - Remove transaction
  - `getFinancialSummary(start?, end?)` - Get income/expense totals
  - `getCategoryBreakdown(type, start?, end?)` - Category analysis

### 2. Adapter Layer (`src/lib/transaction-adapter.ts`)
- **Purpose**: Transform between database and frontend formats
- **Functions**:
  - `fetchFrontendTransactions()` - Get all transactions (frontend format)
  - `fetchFrontendTransactionsByType(type)` - Filtered by type
  - `fetchFrontendTransactionsByDateRange(start, end)` - Date range
  - `fetchFrontendTransactionById(id)` - Single transaction
  - `createFrontendTransaction(data)` - Create transaction
  - `updateFrontendTransaction(id, data)` - Update transaction
  - `deleteFrontendTransaction(id)` - Delete transaction
  - `getFrontendFinancialSummary(start?, end?)` - Summary data
  - `getFrontendCategoryBreakdown(type, start?, end?)` - Category data

### 3. Migration File (`supabase_migrations_transactions.sql`)
- **Purpose**: Database schema setup
- **Includes**:
  - Table creation with constraints
  - Indexes for performance
  - Row Level Security policies
  - Triggers for updated_at
  - Sample data for testing
  - Views for reporting

## Integration Features

### ✅ Complete CRUD Operations
- **Create**: Add new income/expense transactions
- **Read**: Fetch all transactions with filtering
- **Update**: Modify existing transactions
- **Delete**: Remove transactions with confirmation

### ✅ Real-time Data
- Transactions load from database on page mount
- Refresh button to reload data
- Automatic UI updates after create/update/delete

### ✅ Member Integration
- Income transactions can be linked to members
- Member dropdown populated from members table
- Member names displayed in transaction list

### ✅ Advanced Filtering
- Filter by transaction type (income/expense)
- Filter by category
- Filter by payment method
- Date range filtering
- Search by description, member, or reference

### ✅ Financial Analytics
- Real-time calculation of totals
- Income vs Expense comparison
- Net balance (surplus/deficit)
- Category breakdowns with percentages
- Payment method distribution

### ✅ Error Handling
- Try-catch blocks for all database operations
- User-friendly error messages via toast notifications
- Loading states during operations
- Empty state when no transactions exist

### ✅ Security
- Row Level Security (RLS) enabled
- Policies for authenticated users
- Input validation and constraints
- SQL injection prevention via parameterized queries

## Setup Instructions

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run the contents of:
supabase_migrations_transactions.sql
```

### 2. Verify Table Creation
```sql
-- Check if table exists
SELECT * FROM transactions LIMIT 10;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'transactions';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'transactions';
```

### 3. Test the Integration
1. Navigate to `/finance` page
2. Click "Add Income" or "Add Expense"
3. Fill in the form and save
4. Verify transaction appears in the list
5. Try editing and deleting transactions
6. Test filtering and search functionality

## API Usage Examples

### Fetch All Transactions
```typescript
import { fetchFrontendTransactions } from '@/lib/transaction-adapter';

const transactions = await fetchFrontendTransactions();
```

### Create Income Transaction
```typescript
import { createFrontendTransaction } from '@/lib/transaction-adapter';

const newIncome = await createFrontendTransaction({
  id: 'new',
  date: '2026-04-15',
  type: 'income',
  category: 'Tithe',
  description: 'Sunday Tithe',
  method: 'Cash',
  amount: 500,
  recordedBy: 'Admin'
});
```

### Create Expense Transaction
```typescript
const newExpense = await createFrontendTransaction({
  id: 'new',
  date: '2026-04-15',
  type: 'expense',
  category: 'Utilities',
  description: 'Internet Bill',
  method: 'Bank Transfer',
  amount: 150,
  reference: 'INV-001',
  recordedBy: 'Admin'
});
```

### Update Transaction
```typescript
import { updateFrontendTransaction } from '@/lib/transaction-adapter';

const updated = await updateFrontendTransaction(transactionId, {
  ...existingTransaction,
  amount: 600,
  notes: 'Updated amount'
});
```

### Delete Transaction
```typescript
import { deleteFrontendTransaction } from '@/lib/transaction-adapter';

await deleteFrontendTransaction(transactionId);
```

### Get Financial Summary
```typescript
import { getFrontendFinancialSummary } from '@/lib/transaction-adapter';

const summary = await getFrontendFinancialSummary('2026-04-01', '2026-04-30');
// Returns: { income: 5000, expense: 3000, netBalance: 2000 }
```

## Database Views

### Financial Summary View
```sql
SELECT * FROM financial_summary;
-- Shows monthly income/expense totals
```

### Category Breakdown View
```sql
SELECT * FROM category_breakdown;
-- Shows totals by category with averages
```

## Performance Optimizations

### Indexes Created
- `idx_transactions_date` - Fast date-based queries
- `idx_transactions_type` - Quick type filtering
- `idx_transactions_category` - Category filtering
- `idx_transactions_member_id` - Member lookups
- `idx_transactions_created_at` - Recent transactions

### Query Optimization
- Transactions ordered by date (DESC) by default
- Member data joined in single query
- Efficient filtering with WHERE clauses
- Pagination ready (can be added)

## Future Enhancements

### Potential Features
1. **Recurring Transactions**: Auto-create monthly expenses
2. **Budget Management**: Set and track category budgets
3. **Financial Reports**: PDF/Excel export with charts
4. **Approval Workflow**: Multi-level approval for large expenses
5. **Audit Trail**: Track who modified what and when
6. **Bank Reconciliation**: Match transactions with bank statements
7. **Multi-currency Support**: Handle different currencies
8. **Attachments**: Upload receipts and invoices
9. **Tags**: Custom tags for better organization
10. **Notifications**: Alert on low balance or large expenses

### Analytics Enhancements
1. **Trend Analysis**: Month-over-month comparisons
2. **Forecasting**: Predict future income/expenses
3. **Variance Reports**: Budget vs actual
4. **Custom Date Ranges**: Quarter, year, custom periods
5. **Export to Accounting Software**: QuickBooks, Xero integration

## Troubleshooting

### Common Issues

**Issue**: Transactions not loading
- **Solution**: Check Supabase connection in `.env` file
- Verify RLS policies are set correctly
- Check browser console for errors

**Issue**: Cannot create transactions
- **Solution**: Verify user is authenticated
- Check INSERT policy on transactions table
- Ensure all required fields are provided

**Issue**: Member dropdown empty
- **Solution**: Verify members table has data
- Check members fetch is working
- Look for errors in console

**Issue**: Slow performance
- **Solution**: Verify indexes are created
- Check query execution plans
- Consider pagination for large datasets

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database connection
3. Review Supabase logs
4. Check RLS policies
5. Ensure migrations ran successfully

## Summary

The finance module is now fully integrated with Supabase, providing:
- ✅ Persistent data storage
- ✅ Real-time updates
- ✅ Secure access control
- ✅ Comprehensive analytics
- ✅ Professional UI/UX
- ✅ Complete CRUD operations
- ✅ Advanced filtering
- ✅ Error handling
- ✅ Loading states
- ✅ Member integration

The system is production-ready and can handle church financial management with both income and expense tracking!
