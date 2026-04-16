# Finance Module - Quick Fix ⚡

## Problem
Finance page showing 400 error: "Could not find the 'category' column"

## Solution (2 Steps)

### Step 1: Open Supabase SQL Editor
Go to your Supabase project → SQL Editor

### Step 2: Run This Migration
Copy and paste the entire contents of `FIX_GIVING_TRANSACTIONS_TABLE.sql` and click "Run"

## That's It! ✅

The migration will:
- ✅ Add missing columns
- ✅ Set up constraints
- ✅ Create indexes
- ✅ Add sample data
- ✅ Configure security

## Test It

1. Refresh your browser
2. Go to `/finance`
3. Click "Add Income"
4. Fill the form
5. Click "Save"
6. ✅ Should work!

## Need Help?

See `FINANCE_FIX_INSTRUCTIONS.md` for detailed steps.

---

**Time:** 2 minutes  
**Difficulty:** Easy  
**Files:** `FIX_GIVING_TRANSACTIONS_TABLE.sql`
