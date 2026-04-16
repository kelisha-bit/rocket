# How to Add a Leader to a Ministry

## Overview
The ministries page now supports assigning leaders from your member database to each ministry. Leaders are linked by their member ID, ensuring data consistency across your church management system.

## Features Added

### 1. **Leader Selection Dropdown**
- Searchable dropdown that filters members by name or member code
- Real-time search as you type
- Displays member name, code, and phone number for easy identification
- Option to clear/remove a leader assignment

### 2. **Leader Display**
- Ministry table now shows the actual leader's name (fetched from members table)
- Shows "—" when no leader is assigned
- Leader information is automatically updated when you change assignments

### 3. **Database Integration**
- Leader is stored as `leader_id` (foreign key to members table)
- Automatically fetches leader name when loading ministries
- Maintains referential integrity with the members table

## How to Use

### Adding a Leader When Creating a New Ministry

1. Click the **"+ Add Ministry"** button
2. Fill in the ministry name
3. In the **Leader** field, start typing the member's name or member code
4. A dropdown will appear showing matching members
5. Click on the member you want to assign as leader
6. The selected member's name will appear below the search box
7. Complete the other fields (meeting day, time, status)
8. Click **Save**

### Adding/Changing a Leader for an Existing Ministry

1. Find the ministry in the table
2. Click the **Edit** button
3. In the **Leader** field, click to activate the search
4. Start typing to search for a member
5. Select the new leader from the dropdown
6. Click **Save** to update

### Removing a Leader

1. Edit the ministry
2. Click in the Leader search field
3. Select **"No leader"** from the dropdown (first option)
4. Click **Save**

## Search Tips

- Search by **full name**: Type any part of the member's name
- Search by **member code**: Type the member code (e.g., "GWC-0001")
- The search is case-insensitive
- Results update as you type

## Technical Details

### Database Schema
```sql
ministries table:
- head_member_id (UUID, foreign key to members.id)
- head_name (TEXT, deprecated - use join instead)

members table:
- id (UUID, primary key)
- full_name (TEXT)
- member_code (TEXT)
```

### Files Modified
1. **src/lib/supabase/ministries.ts**
   - Added `leader_name` to Ministry interface
   - Updated `fetchMinistries()` to join with members table using `head_member_id`
   - Modified `transformMinistry()` to include leader name from join

2. **src/lib/ministry-adapter.ts**
   - Added `leaderId` field to Ministry interface
   - Updated `adaptMinistryToDatabase()` to map to `head_member_id`
   - Modified `adaptMinistryToFrontend()` to accept leader name

3. **src/app/ministries/page.tsx**
   - Added member fetching on page load
   - Added leader search state and filtering
   - Replaced text input with searchable dropdown
   - Added visual feedback for selected leader

## Benefits

✅ **Data Integrity**: Leaders are linked to actual member records
✅ **Easy Search**: Find members quickly by name or code
✅ **Automatic Updates**: Leader names update automatically if member info changes
✅ **User Friendly**: Clear visual feedback and intuitive interface
✅ **Flexible**: Can assign or remove leaders at any time

## Next Steps

Consider adding:
- Filter ministries by leader
- Show leader contact info in ministry details
- Assign multiple leaders/co-leaders
- Track leader history/changes
- Send notifications to leaders
