# Profile Page Database Fix Instructions

## Problem
The `user_profiles` table already exists in your database but is missing some columns needed for the profile page, causing the error:
```
ERROR: 42703: column "address" of relation "user_profiles" does not exist
```

## Solution
Run the migration scripts in the following order:

### Step 1: Check Current Table Structure (Optional)
Run `CHECK_USER_PROFILES_TABLE.sql` to see what columns currently exist:

```sql
-- Copy and paste the contents of CHECK_USER_PROFILES_TABLE.sql
-- into your Supabase SQL Editor and execute
```

This will show you:
- If the table exists
- What columns are currently in the table
- RLS status
- Existing policies
- Triggers
- Number of existing records

### Step 2: Update the Table
Run `UPDATE_USER_PROFILES_TABLE.sql` to add missing columns:

```sql
-- Copy and paste the contents of UPDATE_USER_PROFILES_TABLE.sql
-- into your Supabase SQL Editor and execute
```

This script will:
- ✅ Add all missing columns (address, city, country, bio, etc.)
- ✅ Keep existing data intact
- ✅ Set up proper RLS policies
- ✅ Create triggers for automatic timestamps
- ✅ Create trigger for automatic profile creation on user signup
- ✅ Safe to run multiple times (idempotent)

### Step 3: Verify the Fix
After running the update script, you can:

1. **Check the table structure again** by running `CHECK_USER_PROFILES_TABLE.sql`
2. **Test the profile page** by navigating to `/profile` in your app
3. **Try editing your profile** to ensure all fields work

## What Gets Added

The following columns will be added if they don't exist:

| Column | Type | Description |
|--------|------|-------------|
| `full_name` | TEXT | User's full name |
| `phone` | TEXT | Phone number |
| `address` | TEXT | Street address |
| `city` | TEXT | City |
| `country` | TEXT | Country |
| `avatar_url` | TEXT | Profile picture URL |
| `bio` | TEXT | User biography |
| `date_of_birth` | DATE | Date of birth |
| `role` | TEXT | User role (default: 'Staff') |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Security Features Added

1. **Row Level Security (RLS)** - Enabled on the table
2. **View Policy** - Users can only view their own profile
3. **Update Policy** - Users can only update their own profile
4. **Insert Policy** - Users can only insert their own profile

## Automatic Features

1. **Auto-update timestamp** - `updated_at` automatically updates on record changes
2. **Auto-create profile** - Profile automatically created when new user signs up
3. **Metadata sync** - Full name and avatar from auth metadata synced to profile

## Troubleshooting

### If you still get errors after running the update:

1. **Check if the script ran successfully**:
   - Look for any error messages in the SQL editor
   - Run `CHECK_USER_PROFILES_TABLE.sql` to verify columns were added

2. **Clear your browser cache**:
   - The app might be caching old data
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

3. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

4. **Check RLS policies**:
   - Make sure you're logged in with a valid user
   - RLS policies require authentication

5. **Verify Supabase connection**:
   - Check your `.env` file has correct Supabase credentials
   - Ensure `NEXT_PUBLIC_USE_SUPABASE_AUTH=true`

### If the table doesn't exist at all:

Run `CREATE_USER_PROFILES_TABLE.sql` instead of the update script.

## Files Reference

- **`CHECK_USER_PROFILES_TABLE.sql`** - Diagnostic script to check table structure
- **`UPDATE_USER_PROFILES_TABLE.sql`** - Migration to add missing columns (USE THIS ONE)
- **`CREATE_USER_PROFILES_TABLE.sql`** - Original creation script (only if table doesn't exist)
- **`PROFILE_PAGE_IMPLEMENTATION.md`** - Full documentation of the profile page

## Quick Fix Command

If you just want to fix it quickly, run this in Supabase SQL Editor:

```sql
-- Copy the entire contents of UPDATE_USER_PROFILES_TABLE.sql and paste here
```

That's it! Your profile page should work after running the update script.

---

**Status**: Ready to fix
**Priority**: High
**Estimated Time**: 2 minutes
