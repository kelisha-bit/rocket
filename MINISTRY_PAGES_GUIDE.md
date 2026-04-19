# Ministry Pages Implementation Guide

## Overview
This guide explains the improved ministry pages with leader information display.

## What's Been Implemented

### 1. **Navigation Updates**
- Added 4 ministry links to the sidebar navigation:
  - Men Ministry (`/ministries/men`)
  - Women Ministry (`/ministries/women`)
  - Youth Ministry (`/ministries/youth`)
  - Music Ministry (`/ministries/music`)

### 2. **New Helper Functions** (`src/lib/supabase/ministry-helpers.ts`)
Created utility functions to:
- Fetch ministry details by name with leader information
- Fetch members belonging to a specific ministry
- Get ministry statistics (total members, active members, etc.)

### 3. **Enhanced Ministry Pages**
Each ministry page now includes:

#### **Leader Information Section**
- Displays the ministry leader's name, photo placeholder, phone, and email
- Color-coded gradient background matching each ministry's theme:
  - Men Ministry: Blue
  - Women Ministry: Pink
  - Youth Ministry: Orange
  - Music Ministry: Purple

#### **Dynamic Meeting Information**
- Pulls meeting day and time from the database
- Falls back to sensible defaults if not set

#### **Real Member Data**
- Fetches actual members assigned to each ministry from the `member_ministries` junction table
- Falls back to filtering all members by relevant criteria if ministry not found

#### **Metrics Dashboard**
- Total members count
- Active members count
- Average age (where applicable)
- Attendance rate

## Database Structure

### Tables Used
1. **ministries** - Stores ministry information
   - `id` - UUID primary key
   - `name` - Ministry name
   - `head_member_id` - Foreign key to members table (the leader)
   - `meeting_day` - Day of the week
   - `meeting_time` - Time of meeting
   - `status` - Active/Inactive/New

2. **members** - Stores member information
   - `id` - UUID primary key
   - `full_name` - Member's full name
   - `phone_number` - Contact phone
   - `email` - Contact email
   - `gender` - Gender
   - `age` - Age
   - `status` - Active/Inactive

3. **member_ministries** - Junction table linking members to ministries
   - `member_id` - Foreign key to members
   - `ministry_id` - Foreign key to ministries

## Setting Up Ministry Leaders

### Option 1: Using the SQL Script
Run the `SETUP_MINISTRY_LEADERS.sql` script to:
1. View all ministries and members
2. Assign leaders to ministries
3. Add members to ministries
4. Verify assignments

### Option 2: Manual Assignment
```sql
-- Find the member you want to assign as leader
SELECT id, full_name FROM members WHERE full_name ILIKE '%John Doe%';

-- Assign them as leader of Men Ministry
UPDATE ministries
SET head_member_id = 'member-uuid-here'
WHERE name = 'Men Ministry';
```

### Option 3: Quick Auto-Assignment
```sql
-- Auto-assign first active male member to Men Ministry
WITH first_male AS (
  SELECT id FROM members 
  WHERE (gender ILIKE 'male' OR gender ILIKE 'm') 
    AND status = 'Active'
  ORDER BY full_name
  LIMIT 1
)
UPDATE ministries
SET head_member_id = (SELECT id FROM first_male)
WHERE name = 'Men Ministry';
```

## Adding Members to Ministries

### Add Individual Member
```sql
INSERT INTO member_ministries (member_id, ministry_id)
SELECT 'member-uuid', id
FROM ministries
WHERE name = 'Men Ministry'
ON CONFLICT DO NOTHING;
```

### Bulk Add Members by Gender
```sql
-- Add all active male members to Men Ministry
INSERT INTO member_ministries (member_id, ministry_id)
SELECT m.id, min.id
FROM members m
CROSS JOIN ministries min
WHERE (m.gender ILIKE 'male' OR m.gender ILIKE 'm')
  AND m.status = 'Active'
  AND min.name = 'Men Ministry'
ON CONFLICT DO NOTHING;
```

## Features by Ministry

### Men's Ministry
- **Color Theme**: Blue
- **Default Meeting**: Saturday, 6:00 AM
- **Focus**: Biblical manhood, leadership development
- **Member Filter**: Male members or members assigned to Men Ministry

### Women's Ministry
- **Color Theme**: Pink
- **Default Meeting**: Sunday, 2:00 PM
- **Focus**: Faith, purpose, and influence
- **Member Filter**: Female members or members assigned to Women Ministry

### Youth Ministry
- **Color Theme**: Orange
- **Default Meeting**: Friday, 6:00 PM
- **Focus**: Identity in Christ, leadership for young people
- **Member Filter**: Ages 13-25 or members assigned to Youth Ministry
- **Special Features**: Upcoming events section

### Music Ministry
- **Color Theme**: Purple
- **Default Meeting**: Thursday, 6:00 PM
- **Focus**: Worship leadership, musical excellence
- **Special Features**: Worship teams section
- **Member Filter**: Members assigned to Music Ministry

## How It Works

### Data Flow
1. Page loads and fetches ministry details by name
2. If ministry found in database:
   - Displays leader information (if assigned)
   - Shows actual meeting day/time from database
   - Fetches members from `member_ministries` junction table
3. If ministry not found:
   - Falls back to filtering all members by relevant criteria
   - Uses default meeting times

### Leader Display Logic
```typescript
// Leader section only shows if ministry has a leader assigned
{ministry?.leader && (
  <div className="leader-card">
    <h3>{ministry.leader.full_name}</h3>
    <p>{ministry.leader.phone_number}</p>
    <p>{ministry.leader.email}</p>
  </div>
)}
```

## Testing the Implementation

### 1. Check Ministry Data
```sql
SELECT id, name, head_member_id, meeting_day, meeting_time
FROM ministries
WHERE name IN ('Men Ministry', 'Women Ministry', 'Youth Ministry', 'Music Ministry');
```

### 2. Verify Leader Assignments
```sql
SELECT 
  m.name AS ministry,
  mem.full_name AS leader,
  mem.phone_number,
  mem.email
FROM ministries m
LEFT JOIN members mem ON m.head_member_id = mem.id
WHERE m.name IN ('Men Ministry', 'Women Ministry', 'Youth Ministry', 'Music Ministry');
```

### 3. Check Member Counts
```sql
SELECT 
  min.name AS ministry,
  COUNT(mm.member_id) AS member_count
FROM ministries min
LEFT JOIN member_ministries mm ON min.id = mm.ministry_id
WHERE min.name IN ('Men Ministry', 'Women Ministry', 'Youth Ministry', 'Music Ministry')
GROUP BY min.id, min.name;
```

## Troubleshooting

### Leader Not Showing
- Check if `head_member_id` is set in the ministries table
- Verify the member ID exists in the members table
- Check browser console for errors

### No Members Showing
- Verify `member_ministries` junction table has entries
- Check if members exist in the database
- Ensure member status is 'Active'

### Wrong Meeting Times
- Update the ministries table with correct times
- Format: 'HH:MM AM/PM' (e.g., '6:00 AM')

## Future Enhancements

Potential improvements:
1. Add ability to assign/remove leaders from the UI
2. Add/remove members from ministries via the page
3. Track attendance by ministry
4. Ministry-specific announcements
5. Photo uploads for leaders
6. Ministry reports and analytics
7. Event scheduling per ministry
8. Resource sharing (documents, videos)

## Files Modified/Created

### New Files
- `src/lib/supabase/ministry-helpers.ts` - Helper functions
- `src/app/ministries/men/page.tsx` - Men's Ministry page
- `src/app/ministries/women/page.tsx` - Women's Ministry page
- `src/app/ministries/youth/page.tsx` - Youth Ministry page
- `src/app/ministries/music/page.tsx` - Music Ministry page
- `SETUP_MINISTRY_LEADERS.sql` - Database setup script
- `MINISTRY_PAGES_GUIDE.md` - This guide

### Modified Files
- `src/components/Sidebar.tsx` - Added ministry navigation links

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify database connections
3. Ensure all migrations have been run
4. Check that RLS policies allow reading ministries and members
