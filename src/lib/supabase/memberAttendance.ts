import { createClient } from './client';
import type { ServiceType } from './attendance';

export interface MemberAttendanceRecord {
  id: string;
  member_id: string;
  attendance_id?: string | null;
  date: string;
  service: ServiceType;
  present: boolean;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
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

function transformRecord(row: any): MemberAttendanceRecord {
  return {
    id: row.id,
    member_id: row.member_id,
    attendance_id: row.attendance_id ?? null,
    date: row.date,
    service: row.service,
    present: row.present ?? true,
    notes: row.notes ?? undefined,
    recorded_by: row.recorded_by ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function transformWithDetails(row: any): MemberAttendanceWithDetails {
  return {
    ...transformRecord(row),
    full_name: row.full_name,
    member_code: row.member_code,
    photo_url: row.photo_url || 'https://i.pravatar.cc/48?img=12',
    gender: row.gender,
    member_status: row.member_status,
  };
}

// Fetch all member attendance records (with member details joined)
export async function fetchMemberAttendanceRecords(
  filters: { memberId?: string; dateFrom?: string; dateTo?: string; service?: ServiceType } = {}
): Promise<MemberAttendanceWithDetails[]> {
  const supabase = createClient();

  let query = supabase
    .from('member_attendance')
    .select(`
      *,
      members!member_attendance_member_id_fkey (
        full_name, member_code, photo_url, gender, status
      )
    `)
    .order('date', { ascending: false });

  if (filters.memberId) query = query.eq('member_id', filters.memberId);
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('date', filters.dateTo);
  if (filters.service) query = query.eq('service', filters.service);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching member attendance records:', error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    ...transformRecord(row),
    full_name: row.members?.full_name ?? '',
    member_code: row.members?.member_code ?? '',
    photo_url: row.members?.photo_url || 'https://i.pravatar.cc/48?img=12',
    gender: row.members?.gender ?? 'Male',
    member_status: row.members?.status ?? 'active',
  }));
}

// Fetch attendance records for a specific service session (date + service type)
export async function fetchSessionAttendance(
  date: string,
  service: ServiceType
): Promise<MemberAttendanceWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_attendance')
    .select(`
      *,
      members!member_attendance_member_id_fkey (
        full_name, member_code, photo_url, gender, status
      )
    `)
    .eq('date', date)
    .eq('service', service)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching session attendance:', error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    ...transformRecord(row),
    full_name: row.members?.full_name ?? '',
    member_code: row.members?.member_code ?? '',
    photo_url: row.members?.photo_url || 'https://i.pravatar.cc/48?img=12',
    gender: row.members?.gender ?? 'Male',
    member_status: row.members?.status ?? 'active',
  }));
}

// Upsert a single member attendance record (insert or update on conflict)
export async function upsertMemberAttendance(
  record: Omit<MemberAttendanceRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<MemberAttendanceRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_attendance')
    .upsert(
      {
        member_id: record.member_id,
        attendance_id: record.attendance_id ?? null,
        date: record.date,
        service: record.service,
        present: record.present,
        notes: record.notes ?? null,
        recorded_by: record.recorded_by ?? null,
      },
      { onConflict: 'member_id,date,service' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting member attendance:', error);
    throw error;
  }

  return transformRecord(data);
}

// Bulk upsert — mark multiple members present/absent for a session
export async function bulkUpsertMemberAttendance(
  records: Omit<MemberAttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]
): Promise<MemberAttendanceRecord[]> {
  if (records.length === 0) return [];
  const supabase = createClient();

  const rows = records.map(r => ({
    member_id: r.member_id,
    attendance_id: r.attendance_id ?? null,
    date: r.date,
    service: r.service,
    present: r.present,
    notes: r.notes ?? null,
    recorded_by: r.recorded_by ?? null,
  }));

  const { data, error } = await supabase
    .from('member_attendance')
    .upsert(rows, { onConflict: 'member_id,date,service' })
    .select();

  if (error) {
    console.error('Error bulk upserting member attendance:', error);
    throw error;
  }

  return (data ?? []).map(transformRecord);
}

// Delete a member attendance record
export async function deleteMemberAttendanceRecord(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('member_attendance').delete().eq('id', id);
  if (error) {
    console.error('Error deleting member attendance record:', error);
    throw error;
  }
}

// Get attendance summary per member
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

  // Fetch all member attendance
  const { data: attendance, error: attendanceError } = await supabase
    .from('member_attendance')
    .select('member_id, present, date');

  if (attendanceError) {
    console.error('Error fetching attendance for summary:', attendanceError);
    throw attendanceError;
  }

  // Compute summary client-side
  const attendanceByMember: Record<string, { total: number; attended: number; lastDate: string | null }> = {};
  for (const row of attendance ?? []) {
    if (!attendanceByMember[row.member_id]) {
      attendanceByMember[row.member_id] = { total: 0, attended: 0, lastDate: null };
    }
    attendanceByMember[row.member_id].total += 1;
    if (row.present) {
      attendanceByMember[row.member_id].attended += 1;
      const current = attendanceByMember[row.member_id].lastDate;
      if (!current || row.date > current) {
        attendanceByMember[row.member_id].lastDate = row.date;
      }
    }
  }

  return (members ?? []).map((m: any) => {
    const stats = attendanceByMember[m.id] ?? { total: 0, attended: 0, lastDate: null };
    return {
      member_id: m.id,
      full_name: m.full_name,
      member_code: m.member_code,
      photo_url: m.photo_url || 'https://i.pravatar.cc/48?img=12',
      member_status: m.status,
      total_sessions: stats.total,
      sessions_attended: stats.attended,
      attendance_rate: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
      last_attended: stats.lastDate,
    };
  });
}
