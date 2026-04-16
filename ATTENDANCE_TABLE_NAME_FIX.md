# Attendance Table Name Fix

## Problem
Getting 401 errors on attendance module:
```
Failed to load resource: saxlclucsroenfjbxjuh.supabase.co/rest/v1/attendance
Error creating attendance record
```

## Root Cause
**Wrong table name in code!**

- ❌ Code was using: `attendance`
- ✅ Actual table name: `attendance_records`

## Solution Applied

Updated **all 11 functions** in `src/lib/supabase/attendance.ts` to use the correct table name `attendance_records`:

### Functions Fixed:
1. ✅ `fetchAttendanceRecords()` - Changed from `attendance` to `attendance_records`
2. ✅ `fetchAttendanceByService()` - Changed from `attendance` to `attendance_records`
3. ✅ `fetchAttendanceByDateRange()` - Changed from `attendance` to `attendance_records`
4. ✅ `fetchAttendanceById()` - Changed from `attendance` to `attendance_records`
5. ✅ `createAttendanceRecord()` - Changed from `attendance` to `attendance_records`
6. ✅ `updateAttendanceRecord()` - Changed from `attendance` to `attendance_records`
7. ✅ `deleteAttendanceRecord()` - Changed from `attendance` to `attendance_records`
8. ✅ `getAttendanceSummary()` - Changed from `attendance` to `attendance_records`
9. ✅ `getServiceBreakdown()` - Changed from `attendance` to `attendance_records`
10. ✅ `getLatestAttendance()` - Changed from `attendance` to `attendance_records`
11. ✅ `getAttendanceTrend()` - Changed from `attendance` to `attendance_records`

## Files Modified
- ✅ `src/lib/supabase/attendance.ts` - All 11 functions updated

## Next Steps

### 1. Run RLS Fix (If Not Already Done)
You still need to fix RLS policies. Run this in Supabase SQL Editor:

```sql
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
```

Or run the complete fix: `FIX_ALL_RLS_POLICIES.sql`

### 2. Test Attendance Module
1. **Refresh browser** (Ctrl+Shift+R)
2. **Go to** `/attendance`
3. **Try these actions:**
   - View attendance records
   - Add new attendance record
   - Edit existing record
   - Delete a record
   - View statistics

## Expected Result

**Before Fix:**
```
❌ 401 error - table 'attendance' not found
❌ Cannot load attendance records
❌ Cannot create attendance records
```

**After Fix + RLS:**
```
✅ Attendance records load successfully
✅ Can create new records
✅ Can edit existing records
✅ Can delete records
✅ Statistics display correctly
```

## Summary

**Issue:** Wrong table name (`attendance` vs `attendance_records`)

**Fix:** Updated all 11 database functions to use correct table name

**Status:** ✅ Code fixed, but RLS still needs to be disabled

**Action Required:** Run `FIX_ALL_RLS_POLICIES.sql` to complete the fix

---

**This is the same issue we had with Finance module (`transactions` vs `giving_transactions`)!**
