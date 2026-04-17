import { createClient } from './client';

// ─── Types matching the actual DB schema ─────────────────────────────────────

export type ServiceType =
  | 'Sunday Service'
  | 'Midweek Service'
  | 'Cell Group'
  | 'Special Event'
  | 'Prayer Meeting';

export interface AttendanceSession {
  id: string;
  title: string;
  session_type: string;
  session_date: string; // DATE as ISO string
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  session_id: string;
  member_id: string;
  present: boolean;
  checked_in_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface MemberAttendanceRecord {
  // Composite key — no standalone id
  session_id: string;
  member_id: string;
  date: string;        // from session.session_date
  service: string;     // from session.session_type
  present: boolean;
  notes?: string | null;
  checked_in_at?: string | null;
  created_at: string;
}

export interface MemberAttendanceWithDetails extends MemberAttendanceRecord {
  full_name: string;
  member_code: string;
  photo_url: string;
  gender: 'Male' | 'Female';
  member_status: string;
}

export interface MemberAttendanceSummary {
  member_id: string;
  full_name: string;
  member_code: string;
  photo_url: string;
  member_status: string;
  total_sessions: number;
  sessions_attended: number;
  attendance_rate: number;
  last_attended: string | null;
}

// ─── Session helpers ──────────────────────────────────────────────────────────

// Find or create a session for a given date + service type
export async function findOrCreateSession(
  date: string,
  serviceType: string
): Promise<AttendanceSession> {
  const supabase = createClient();

  // Try to find existing session
  const { data: existing, error: findError } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('session_type', serviceType)
    .eq('session_date', date)
    .maybeSingle();

  if (findError) {
    console.error('Error finding session:', findError);
    throw findError;
  }

  if (existing) return existing as AttendanceSession;

  // Create new session
  const { data: created, error: createError } = await supabase
    .from('attendance_sessions')
    .insert({
      title: `${serviceType} — ${date}`,
      session_type: serviceType,
      session_date: date,
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating session:', createError);
    throw createError;
  }

  return created as AttendanceSession;
}

// ─── Fetch records ────────────────────────────────────────────────────────────

// Fetch all member attendance records with optional filters
export async function fetchMemberAttendanceRecords(
  filters: {
    memberId?: string;
    dateFrom?: string;
    dateTo?: string;
    service?: string;
  } = {}
): Promise<MemberAttendanceWithDetails[]> {
  const supabase = createClient();

  // Step 1: fetch attendance_sessions first (to avoid join issues)
  let sessionsQuery = supabase
    .from('attendance_sessions')
    .select('id, session_type, session_date')
    .order('session_date', { ascending: false });

  const { data: sessions, error: sessionsError } = await sessionsQuery;
  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    throw sessionsError;
  }

  const sessionMap = new Map((sessions ?? []).map((s: any) => [s.id, s]));

  // Step 2: fetch attendance_records (no join - just raw records)
  let recordsQuery = supabase
    .from('attendance_records')
    .select('session_id, member_id, present, checked_in_at, notes, created_at')
    .order('created_at', { ascending: false });

  if (filters.memberId) recordsQuery = recordsQuery.eq('member_id', filters.memberId);

  const { data: records, error } = await recordsQuery;
  if (error) {
    console.error('Error fetching member attendance records:', error);
    throw error;
  }

  let results = (records ?? []).map((r: any) => {
    const session = sessionMap.get(r.session_id);
    return {
      session_id: r.session_id,
      member_id: r.member_id,
      date: session?.session_date ?? '',
      service: session?.session_type ?? '',
      present: r.present ?? true,
      notes: r.notes ?? null,
      checked_in_at: r.checked_in_at ?? null,
      created_at: r.created_at,
      // member fields filled in below
      full_name: '',
      member_code: '',
      photo_url: 'https://i.pravatar.cc/48?img=12',
      gender: 'Male' as const,
      member_status: 'active',
    };
  });

  // Apply date/service filters
  if (filters.service) results = results.filter(r => r.service === filters.service);
  if (filters.dateFrom) results = results.filter(r => r.date >= filters.dateFrom!);
  if (filters.dateTo) results = results.filter(r => r.date <= filters.dateTo!);

  if (results.length === 0) return results;

  // Step 3: fetch member details separately and merge
  const memberIds = [...new Set(results.map(r => r.member_id))];
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, full_name, member_code, photo_url, gender, status')
    .in('id', memberIds);

  if (membersError) {
    console.warn('Could not fetch member details for attendance records:', membersError.message);
    // Return records without member details rather than throwing
    return results;
  }

  const memberMap = new Map((members ?? []).map((m: any) => [m.id, m]));

  return results.map(r => {
    const m = memberMap.get(r.member_id);
    return {
      ...r,
      full_name: m?.full_name ?? '',
      member_code: m?.member_code ?? '',
      photo_url: m?.photo_url || 'https://i.pravatar.cc/48?img=12',
      gender: (m?.gender ?? 'Male') as 'Male' | 'Female',
      member_status: m?.status ?? 'active',
    };
  });
}

// Fetch attendance records for a specific session (date + service type)
export async function fetchSessionAttendance(
  date: string,
  service: string
): Promise<MemberAttendanceWithDetails[]> {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select('id, session_type, session_date')
    .eq('session_type', service)
    .eq('session_date', date)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session) return []; // No session yet for this date/service

  // Step 1: fetch attendance records for this session (no members join)
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('session_id, member_id, present, checked_in_at, notes, created_at')
    .eq('session_id', session.id);

  if (recordsError) throw recordsError;
  if (!records || records.length === 0) return [];

  // Step 2: fetch member details separately and merge
  const memberIds = [...new Set(records.map((r: any) => r.member_id))];
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, full_name, member_code, photo_url, gender, status')
    .in('id', memberIds);

  if (membersError) {
    console.warn('Could not fetch member details for session attendance:', membersError.message);
  }

  const memberMap = new Map((members ?? []).map((m: any) => [m.id, m]));

  return records.map((r: any) => {
    const m = memberMap.get(r.member_id);
    return {
      session_id: r.session_id,
      member_id: r.member_id,
      date: session.session_date,
      service: session.session_type,
      present: r.present ?? true,
      notes: r.notes ?? null,
      checked_in_at: r.checked_in_at ?? null,
      created_at: r.created_at,
      full_name: m?.full_name ?? '',
      member_code: m?.member_code ?? '',
      photo_url: m?.photo_url || 'https://i.pravatar.cc/48?img=12',
      gender: (m?.gender ?? 'Male') as 'Male' | 'Female',
      member_status: m?.status ?? 'active',
    };
  });
}

// ─── Upsert records ───────────────────────────────────────────────────────────

// Upsert a single member attendance record
export async function upsertMemberAttendance(record: {
  member_id: string;
  date: string;
  service: string;
  present: boolean;
  notes?: string | null;
}): Promise<void> {
  const session = await findOrCreateSession(record.date, record.service);
  const supabase = createClient();

  const { error } = await supabase
    .from('attendance_records')
    .upsert(
      {
        session_id: session.id,
        member_id: record.member_id,
        present: record.present,
        notes: record.notes ?? null,
        checked_in_at: record.present ? new Date().toISOString() : null,
      },
      { onConflict: 'session_id,member_id' }
    );

  if (error) {
    console.error('Error upserting member attendance:', error);
    throw error;
  }
}

// Bulk upsert — mark multiple members present/absent for a session
export async function bulkUpsertMemberAttendance(
  records: {
    member_id: string;
    date: string;
    service: string;
    present: boolean;
    notes?: string | null;
  }[]
): Promise<void> {
  if (records.length === 0) return;

  // All records share the same date+service
  const { date, service } = records[0];
  const session = await findOrCreateSession(date, service);
  const supabase = createClient();

  const rows = records.map(r => ({
    session_id: session.id,
    member_id: r.member_id,
    present: r.present,
    notes: r.notes ?? null,
    checked_in_at: r.present ? new Date().toISOString() : null,
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(rows, { onConflict: 'session_id,member_id' });

  if (error) {
    console.error('Error bulk upserting member attendance:', error);
    throw error;
  }
}

// Delete a member attendance record
export async function deleteMemberAttendanceRecord(
  session_id: string,
  member_id: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('session_id', session_id)
    .eq('member_id', member_id);

  if (error) {
    console.error('Error deleting member attendance record:', error);
    throw error;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function fetchMemberAttendanceSummaries(): Promise<MemberAttendanceSummary[]> {
  const supabase = createClient();

  // Fetch all members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, full_name, member_code, photo_url, status')
    .order('full_name');

  if (membersError) {
    console.error('Error fetching members for summary:', membersError);
    throw membersError;
  }

  // Fetch all attendance records (just the fields we need for aggregation)
  let attendance: { member_id: string; present: boolean; session_date: string }[] = [];

  // First fetch sessions to avoid join issues
  const { data: sessions, error: sessionsError } = await supabase
    .from('attendance_sessions')
    .select('id, session_date');

  if (sessionsError) {
    console.warn('Could not fetch attendance_sessions:', sessionsError.message);
  }

  const sessionMap = new Map((sessions ?? []).map((s: any) => [s.id, s]));

  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('session_id, member_id, present');

  if (recordsError) {
    console.warn('Could not fetch attendance_records:', recordsError.message);
    // Don't throw — show members with zero stats
  } else {
    attendance = (records ?? []).map((r: any) => {
      const session = sessionMap.get(r.session_id);
      return {
        member_id: r.member_id,
        present: r.present,
        session_date: session?.session_date ?? '',
      };
    });
  }

  // Aggregate client-side
  const statsMap: Record<string, { total: number; attended: number; lastDate: string | null }> = {};

  for (const row of attendance) {
    if (!statsMap[row.member_id]) {
      statsMap[row.member_id] = { total: 0, attended: 0, lastDate: null };
    }
    statsMap[row.member_id].total += 1;
    if (row.present) {
      statsMap[row.member_id].attended += 1;
      const cur = statsMap[row.member_id].lastDate;
      if (!cur || row.session_date > cur) {
        statsMap[row.member_id].lastDate = row.session_date;
      }
    }
  }

  return (members ?? []).map((m: any) => {
    const stats = statsMap[m.id] ?? { total: 0, attended: 0, lastDate: null };
    return {
      member_id: m.id,
      full_name: m.full_name,
      member_code: m.member_code,
      photo_url: m.photo_url || 'https://i.pravatar.cc/48?img=12',
      member_status: m.status,
      total_sessions: stats.total,
      sessions_attended: stats.attended,
      attendance_rate:
        stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
      last_attended: stats.lastDate,
    };
  });
}
