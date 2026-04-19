import { createClient } from './client';

export interface MinistryActivity {
  id: string;
  type: 'meeting' | 'event' | 'contribution' | 'service';
  title: string;
  description?: string;
  date: string;
  member_count?: number;
  amount?: number;
}

export interface MinistryAttendance {
  session_id: string;
  date: string;
  total_members: number;
  present_count: number;
  attendance_rate: number;
  session_type: string;
}

export interface MinistryContribution {
  id: string;
  member_name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface MinistryEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  expected_attendance: number;
  actual_attendance?: number;
}

export interface CreateMinistryEventInput {
  title: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  expected_attendance?: number;
  status?: 'Scheduled' | 'Draft' | 'Completed' | 'Cancelled';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test((value || '').trim());
}

function inferEventDepartment(ministryNameOrDepartment: string): string {
  const v = (ministryNameOrDepartment || '').trim().toLowerCase();
  if (!v) return 'Church-wide';
  if (v === 'men' || v.includes("men")) return 'Men';
  if (v === 'women' || v.includes('women')) return 'Women';
  if (v === 'youth' || v.includes('youth')) return 'Youth';
  if (v === 'children' || v.includes('children') || v.includes('kids')) return 'Children';
  if (v === 'church-wide' || v.includes('church')) return 'Church-wide';
  return 'Church-wide';
}

export interface MinistryStats {
  totalMembers: number;
  activeMembers: number;
  averageAttendance: number;
  totalContributions: number;
  upcomingEvents: number;
  recentActivities: number;
}

/**
 * Fetch ministry attendance records
 */
export async function fetchMinistryAttendance(
  ministryId: string,
  startDate?: string,
  endDate?: string
): Promise<MinistryAttendance[]> {
  const supabase = createClient() as any;
  
  try {
    // Try ministry-scoped sessions first
    let query = supabase
      .from('attendance_sessions')
      .select('*')
      .eq('ministry_id', ministryId)
      .order('session_date', { ascending: false });

    if (startDate) {
      query = query.gte('session_date', startDate);
    }
    if (endDate) {
      query = query.lte('session_date', endDate);
    }

    let sessions, sessionsError;
    try {
      const result = await query.limit(20);
      sessions = result.data;
      sessionsError = result.error;
    } catch (e: any) {
      // ministry_id column may not exist yet - fallback to all sessions
      console.warn('ministry_id column not found, falling back to all sessions');
      const fallbackQuery = supabase
        .from('attendance_sessions')
        .select('*')
        .order('session_date', { ascending: false })
        .limit(20);
      
      const fallbackResult = await fallbackQuery;
      sessions = fallbackResult.data;
      sessionsError = fallbackResult.error;
    }

    if (sessionsError || !sessions || sessions.length === 0) {
      return [];
    }

    // For each session, count attendance from attendance_records
    const attendanceData: MinistryAttendance[] = [];

    for (const session of sessions) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('member_id, present')
        .eq('session_id', session.id)
        ;

      if (records) {
        const presentCount = records.filter((r: any) => r.present).length;
        const totalMembers = records.length;
        
        attendanceData.push({
          session_id: session.id,
          date: session.session_date,
          total_members: totalMembers,
          present_count: presentCount,
          attendance_rate: totalMembers > 0 ? (presentCount / totalMembers) * 100 : 0,
          session_type: session.session_type || 'Service',
        });
      }
    }

    return attendanceData;
  } catch (err) {
    console.error('Error fetching ministry attendance:', err);
    return [];
  }
}

/**
 * Fetch ministry contributions
 */
export async function fetchMinistryContributions(
  ministryId: string,
  startDate?: string,
  endDate?: string
): Promise<MinistryContribution[]> {
  const supabase = createClient() as any;
  
  try {
    // Try ministry-scoped query first
    let data, error;
    try {
      let query = supabase
        .from('giving_transactions')
        .select(`
          id,
          member_id,
          amount,
          date,
          category,
          description,
          members!inner(full_name)
        `)
        .eq('ministry_id', ministryId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const result = await query.limit(50);
      data = result.data;
      error = result.error;
    } catch (e: any) {
      // ministry_id column may not exist yet - fallback
      console.warn('ministry_id column not found in giving_transactions, returning empty');
      return [];
    }

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      member_name: item.members?.full_name || 'Unknown',
      amount: item.amount || 0,
      date: item.date,
      category: item.category || 'General',
      description: item.description,
    }));
  } catch (err) {
    console.error('Error fetching ministry contributions:', err);
    return [];
  }
}

/**
 * Fetch ministry events
 */
export async function fetchMinistryEvents(
  ministryName: string,
  upcoming: boolean = true
): Promise<MinistryEvent[]> {
  const supabase = createClient() as any;
  
  try {
    const department = inferEventDepartment(ministryName);
    let data, error;
    
    // Try ministry-scoped query first (if UUID provided)
    if (isUuid(ministryName)) {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('ministry_id', ministryName)
          .order('date', { ascending: true });

        if (upcoming) {
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('date', today);
        }

        const result = await query.limit(10);
        data = result.data;
        error = result.error;
      } catch (e: any) {
        // ministry_id column not found, fall back to department filtering
        console.warn('ministry_id column not found in events, using department filter');
        let query = supabase
          .from('events')
          .select('*')
          .eq('department', department)
          .order('date', { ascending: true });

        if (upcoming) {
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('date', today);
        }

        const result = await query.limit(10);
        data = result.data;
        error = result.error;
      }
    } else {
      // Not a UUID, use department filter
      let query = supabase
        .from('events')
        .select('*')
        .eq('department', department)
        .order('date', { ascending: true });

      if (upcoming) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date', today);
      }

      const result = await query.limit(10);
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return [];
    }

    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time || '9:00 AM',
      location: event.location || 'TBD',
      status: event.status || 'scheduled',
      expected_attendance: event.expected_attendance || 0,
      actual_attendance: event.actual_attendance,
    }));
  } catch (err) {
    console.error('Error fetching ministry events:', err);
    return [];
  }
}

/**
 * Create a new ministry event (persisted in the `events` table)
 */
export async function createMinistryEvent(
  ministryNameOrDepartment: string,
  input: CreateMinistryEventInput,
  createdBy?: string
): Promise<MinistryEvent> {
  const supabase = createClient() as any;

  const department = inferEventDepartment(ministryNameOrDepartment);
  const isMinistryId = isUuid(ministryNameOrDepartment);
  
  // Build payload - try with ministry_id, fall back without if column doesn't exist
  let payload: any = {
    title: input.title,
    date: input.date,
    time: input.time,
    location: input.location,
    department,
    status: input.status || 'Scheduled',
    expected_attendance: input.expected_attendance ?? 0,
    notes: input.notes ?? null,
    created_by: createdBy ?? null,
  };
  
  if (isMinistryId) {
    payload.ministry_id = ministryNameOrDepartment;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      // If ministry_id column doesn't exist, try without it
      if (error.message?.includes('ministry_id') || error.code === '42703') {
        console.warn('ministry_id column not found, creating event without ministry_id');
        delete payload.ministry_id;
        
        const fallbackResult = await supabase
          .from('events')
          .insert(payload)
          .select('*')
          .single();
          
        if (fallbackResult.error || !fallbackResult.data) {
          throw new Error(fallbackResult.error?.message || 'Failed to create event');
        }
        
        return {
          id: fallbackResult.data.id,
          title: fallbackResult.data.title,
          date: fallbackResult.data.date,
          time: fallbackResult.data.time || '9:00 AM',
          location: fallbackResult.data.location || 'TBD',
          status: fallbackResult.data.status || 'Scheduled',
          expected_attendance: fallbackResult.data.expected_attendance || 0,
          actual_attendance: fallbackResult.data.actual_attendance,
        };
      }
      throw new Error(error.message || 'Failed to create event');
    }

    if (!data) {
      throw new Error('Failed to create event');
    }

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time || '9:00 AM',
      location: data.location || 'TBD',
      status: data.status || 'Scheduled',
      expected_attendance: data.expected_attendance || 0,
      actual_attendance: data.actual_attendance,
    };
  } catch (err: any) {
    console.error('Error creating ministry event:', err);
    throw new Error(err?.message || 'Failed to create event');
  }
}

/**
 * Get comprehensive ministry statistics
 */
export async function getMinistryAnalytics(
  ministryId: string,
  ministryName: string
): Promise<MinistryStats> {
  const supabase = createClient() as any;
  
  try {
    // Get member counts
    const { data: allMembers } = await supabase
      .from('member_ministries')
      .select('member_id, members!inner(status)')
      .eq('ministry_id', ministryId);

    const totalMembers = allMembers?.length || 0;
    const activeMembers = allMembers?.filter((m: any) => m.members?.status === 'active').length || 0;

    // Get recent attendance
    const attendanceRecords = await fetchMinistryAttendance(ministryId);
    const averageAttendance = attendanceRecords.length > 0
      ? attendanceRecords.reduce((sum, a) => sum + a.attendance_rate, 0) / attendanceRecords.length
      : 0;

    // Get total contributions
    const contributions = await fetchMinistryContributions(ministryId);
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Get upcoming events
    const events = await fetchMinistryEvents(ministryName, true);
    const upcomingEvents = events.length;

    return {
      totalMembers,
      activeMembers,
      averageAttendance: Math.round(averageAttendance),
      totalContributions,
      upcomingEvents,
      recentActivities: attendanceRecords.length + contributions.length + events.length,
    };
  } catch (err) {
    console.error('Error fetching ministry analytics:', err);
    return {
      totalMembers: 0,
      activeMembers: 0,
      averageAttendance: 0,
      totalContributions: 0,
      upcomingEvents: 0,
      recentActivities: 0,
    };
  }
}

/**
 * Get recent ministry activities (combined view)
 */
export async function fetchMinistryActivities(
  ministryId: string,
  ministryName: string,
  limit: number = 10
): Promise<MinistryActivity[]> {
  const supabase = createClient() as any;
  const activities: MinistryActivity[] = [];

  try {
    // Prefer explicit ministry activities if table exists / is populated
    const { data: ministryActivities, error: ministryActivitiesError } = await supabase
      .from('ministry_activities')
      .select('id, type, title, description, activity_date, amount')
      .eq('ministry_id', ministryId)
      .order('activity_date', { ascending: false })
      .limit(limit);

    if (!ministryActivitiesError && ministryActivities && ministryActivities.length > 0) {
      return ministryActivities.map((a: any) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description || undefined,
        date: a.activity_date,
        amount: a.amount ?? undefined,
      }));
    }

    // Get recent attendance sessions
    const attendance = await fetchMinistryAttendance(ministryId);
    attendance.slice(0, 3).forEach(a => {
      activities.push({
        id: a.session_id,
        type: 'meeting',
        title: `${a.session_type} Meeting`,
        description: `${a.present_count} of ${a.total_members} members attended (${Math.round(a.attendance_rate)}%)`,
        date: a.date,
        member_count: a.present_count,
      });
    });

    // Get recent contributions
    const contributions = await fetchMinistryContributions(ministryId);
    contributions.slice(0, 3).forEach(c => {
      activities.push({
        id: c.id,
        type: 'contribution',
        title: `Contribution from ${c.member_name}`,
        description: c.description || c.category,
        date: c.date,
        amount: c.amount,
      });
    });

    // Get recent events
    const events = await fetchMinistryEvents(ministryName, false);
    events.slice(0, 3).forEach(e => {
      activities.push({
        id: e.id,
        type: 'event',
        title: e.title,
        description: `${e.location} - ${e.status}`,
        date: e.date,
        member_count: e.actual_attendance || e.expected_attendance,
      });
    });

    // Sort by date (most recent first) and limit
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching ministry activities:', err);
    return [];
  }
}
