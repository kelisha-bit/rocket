# Ministry Analytics & Tracking Guide

## Overview
This guide explains the enhanced ministry pages with comprehensive tracking for activities, attendance, contributions, and events.

## New Features

### 1. **Tabbed Interface**
Each ministry page now includes 5 tabs:
- **Overview**: Ministry information, leader details, and recent members
- **Attendance**: Visual charts showing meeting attendance trends
- **Contributions**: Financial contributions from ministry members
- **Events**: Calendar of upcoming and past ministry events
- **Activities**: Timeline of all ministry activities

### 2. **Analytics Functions** (`src/lib/supabase/ministry-analytics.ts`)

#### `fetchMinistryAttendance(ministryId, startDate?, endDate?)`
Fetches attendance records for ministry members across all church services.

**Returns:**
```typescript
{
  session_id: string;
  date: string;
  total_members: number;
  present_count: number;
  attendance_rate: number;
  session_type: string;
}[]
```

**How it works:**
1. Gets all members in the ministry from `member_ministries` table
2. Fetches attendance sessions from `attendance_sessions`
3. Counts how many ministry members attended each session
4. Calculates attendance rate percentage

#### `fetchMinistryContributions(ministryId, startDate?, endDate?)`
Fetches financial contributions from ministry members.

**Returns:**
```typescript
{
  id: string;
  member_name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}[]
```

**How it works:**
1. Gets all members in the ministry
2. Fetches their giving transactions from `giving_transactions`
3. Joins with member names for display

#### `fetchMinistryEvents(ministryName, upcoming?)`
Fetches events associated with the ministry.

**Returns:**
```typescript
{
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  expected_attendance: number;
  actual_attendance?: number;
}[]
```

**How it works:**
- Searches `events` table for events with ministry name in department field
- Filters by date if `upcoming` is true

#### `fetchMinistryActivities(ministryId, ministryName, limit?)`
Combines all activities into a unified timeline.

**Returns:**
```typescript
{
  id: string;
  type: 'meeting' | 'event' | 'contribution' | 'service';
  title: string;
  description?: string;
  date: string;
  member_count?: number;
  amount?: number;
}[]
```

**How it works:**
- Fetches recent attendance, contributions, and events
- Combines them into a single array
- Sorts by date (most recent first)

#### `getMinistryAnalytics(ministryId, ministryName)`
Provides comprehensive statistics for the ministry.

**Returns:**
```typescript
{
  totalMembers: number;
  activeMembers: number;
  averageAttendance: number;
  totalContributions: number;
  upcomingEvents: number;
  recentActivities: number;
}
```

### 3. **UI Components**

#### `ActivityTimeline` (`src/components/ministry/ActivityTimeline.tsx`)
Displays a chronological timeline of ministry activities with:
- Color-coded icons for different activity types
- Relative date formatting ("2 days ago", "1 week ago")
- Member counts and contribution amounts
- Loading and empty states

#### `EventsCalendar` (`src/components/ministry/EventsCalendar.tsx`)
Shows upcoming and past events with:
- Event status badges (scheduled, completed, cancelled)
- Date, time, and location information
- Expected vs actual attendance
- Visual date cards for upcoming events
- Highlighted upcoming events

#### `ContributionsTable` (`src/components/ministry/ContributionsTable.tsx`)
Lists financial contributions with:
- Summary cards showing total and average contributions
- Member names and contribution details
- Currency formatting
- Date formatting
- Category labels

#### `AttendanceChart` (`src/components/ministry/AttendanceChart.tsx`)
Visualizes attendance trends with:
- Horizontal bar charts showing attendance per session
- Trend indicators (up/down arrows)
- Percentage calculations
- Average attendance rate summary
- Session type labels

## Implementation Example

### Men's Ministry Page Structure

```typescript
// State management
const [activeTab, setActiveTab] = useState<TabType>('overview');
const [attendance, setAttendance] = useState<MinistryAttendance[]>([]);
const [contributions, setContributions] = useState<MinistryContribution[]>([]);
const [events, setEvents] = useState<MinistryEvent[]>([]);
const [activities, setActivities] = useState<MinistryActivity[]>([]);

// Load analytics data
const loadAnalyticsData = async (ministryId: string, ministryName: string) => {
  const [attendanceData, contributionsData, eventsData, activitiesData] = await Promise.all([
    fetchMinistryAttendance(ministryId),
    fetchMinistryContributions(ministryId),
    fetchMinistryEvents(ministryName),
    fetchMinistryActivities(ministryId, ministryName),
  ]);
  
  setAttendance(attendanceData);
  setContributions(contributionsData);
  setEvents(eventsData);
  setActivities(activitiesData);
};

// Render tabs
<nav>
  {tabs.map((tab) => (
    <button onClick={() => setActiveTab(tab.id)}>
      {tab.label}
    </button>
  ))}
</nav>

// Render tab content
{activeTab === 'attendance' && (
  <AttendanceChart attendance={attendance} loading={loadingAnalytics} />
)}
```

## Database Requirements

### Tables Used
1. **ministries** - Ministry information
2. **members** - Member information
3. **member_ministries** - Junction table linking members to ministries
4. **attendance_sessions** - Church service sessions
5. **member_attendance** - Individual attendance records
6. **giving_transactions** - Financial contributions
7. **events** - Ministry events

### Required Relationships
- `member_ministries.ministry_id` → `ministries.id`
- `member_ministries.member_id` → `members.id`
- `member_attendance.session_id` → `attendance_sessions.id`
- `member_attendance.member_id` → `members.id`
- `giving_transactions.member_id` → `members.id`

## Metrics Displayed

### Overview Tab
- Total Members
- Active Members
- Average Age
- Attendance Rate (calculated from attendance data)

### Attendance Tab
- Average attendance rate across all sessions
- Total number of sessions tracked
- Bar chart showing attendance per session
- Trend indicators (improving/declining)

### Contributions Tab
- Total contributions amount
- Average contribution amount
- List of recent contributions with member names
- Date and category information

### Events Tab
- Upcoming events with countdown
- Past events with actual attendance
- Event status (scheduled, completed, cancelled)
- Location and time details

### Activities Tab
- Combined timeline of all activities
- Meetings, contributions, and events in one view
- Chronological ordering
- Activity type indicators

## Applying to Other Ministries

To add these features to other ministry pages (Women, Youth, Music):

1. **Copy the enhanced Men's Ministry page structure**
2. **Update the ministry name** in `fetchMinistryByName()` call
3. **Adjust color themes**:
   - Women: Pink (`pink-600`, `pink-100`, etc.)
   - Youth: Orange (`orange-600`, `orange-100`, etc.)
   - Music: Purple (`purple-600`, `purple-100`, etc.)
4. **Update ministry-specific content** (mission statement, meeting info)

### Quick Template
```typescript
// Change this line for each ministry
const ministryData = await fetchMinistryByName('Women Ministry'); // or 'Youth Ministry', 'Music Ministry'

// Update color classes
className="bg-pink-600" // Women
className="bg-orange-600" // Youth
className="bg-purple-600" // Music
```

## Performance Considerations

### Data Loading
- All analytics data loads in parallel using `Promise.all()`
- Loading states prevent UI blocking
- Error handling for failed requests

### Optimization Tips
1. **Limit data ranges**: Use `startDate` and `endDate` parameters
2. **Pagination**: Show only recent records (last 20 sessions, 50 contributions)
3. **Caching**: Consider caching analytics data for 5-10 minutes
4. **Lazy loading**: Load tab data only when tab is activated

## Future Enhancements

Potential improvements:
1. **Export functionality**: Download reports as PDF/Excel
2. **Date range filters**: Custom date ranges for all tabs
3. **Comparison views**: Compare months or years
4. **Member drill-down**: Click member to see their individual stats
5. **Goal tracking**: Set and track ministry goals
6. **Notifications**: Alert leaders about low attendance or milestones
7. **Mobile optimization**: Swipeable tabs for mobile devices
8. **Real-time updates**: WebSocket integration for live data
9. **Advanced charts**: Line graphs, pie charts, heat maps
10. **Predictive analytics**: Forecast attendance and contributions

## Troubleshooting

### No Data Showing
1. Check if ministry exists in database
2. Verify members are assigned to ministry in `member_ministries`
3. Ensure attendance sessions exist
4. Check RLS policies allow reading data

### Slow Loading
1. Add database indexes on frequently queried columns
2. Reduce date range for queries
3. Implement pagination
4. Cache results

### Incorrect Calculations
1. Verify member_ministries junction table is populated
2. Check date formats are consistent
3. Ensure status values match ('active' vs 'Active')

## Files Created

### Analytics
- `src/lib/supabase/ministry-analytics.ts` - Core analytics functions

### Components
- `src/components/ministry/ActivityTimeline.tsx` - Activity timeline
- `src/components/ministry/EventsCalendar.tsx` - Events calendar
- `src/components/ministry/ContributionsTable.tsx` - Contributions list
- `src/components/ministry/AttendanceChart.tsx` - Attendance visualization

### Pages
- `src/app/ministries/men/page.tsx` - Enhanced Men's Ministry page (example)

### Documentation
- `MINISTRY_ANALYTICS_GUIDE.md` - This guide

## Support

For questions or issues:
1. Check browser console for errors
2. Verify database schema matches requirements
3. Test queries directly in Supabase dashboard
4. Check RLS policies for data access
