/**
 * Member Attendance Adapter
 *
 * Transforms between the DB layer (attendance_sessions + attendance_records)
 * and the frontend camelCase format.
 */

import {
  fetchMemberAttendanceRecords,
  fetchSessionAttendance,
  upsertMemberAttendance,
  bulkUpsertMemberAttendance,
  deleteMemberAttendanceRecord,
  fetchMemberAttendanceSummaries,
  type MemberAttendanceWithDetails,
  type MemberAttendanceSummary,
  type ServiceType,
} from './supabase/memberAttendance';

export type { ServiceType };

export interface FrontendMemberAttendance {
  sessionId: string;
  memberId: string;
  date: string;
  service: string;
  present: boolean;
  notes?: string | null;
  checkedInAt?: string | null;
  // Joined member fields
  fullName: string;
  memberCode: string;
  photoUrl: string;
  gender: 'Male' | 'Female';
  memberStatus: string;
}

export interface FrontendMemberAttendanceSummary {
  memberId: string;
  fullName: string;
  memberCode: string;
  photoUrl: string;
  memberStatus: string;
  totalSessions: number;
  sessionsAttended: number;
  attendanceRate: number;
  lastAttended: string | null;
}

function toFrontend(db: MemberAttendanceWithDetails): FrontendMemberAttendance {
  return {
    sessionId: db.session_id,
    memberId: db.member_id,
    date: db.date,
    service: db.service,
    present: db.present,
    notes: db.notes,
    checkedInAt: db.checked_in_at,
    fullName: db.full_name ?? '',
    memberCode: db.member_code ?? '',
    photoUrl: db.photo_url || 'https://i.pravatar.cc/48?img=12',
    gender: db.gender,
    memberStatus: db.member_status ?? '',
  };
}

function summaryToFrontend(db: MemberAttendanceSummary): FrontendMemberAttendanceSummary {
  return {
    memberId: db.member_id,
    fullName: db.full_name ?? '',
    memberCode: db.member_code ?? '',
    photoUrl: db.photo_url || 'https://i.pravatar.cc/48?img=12',
    memberStatus: db.member_status ?? '',
    totalSessions: db.total_sessions,
    sessionsAttended: db.sessions_attended,
    attendanceRate: db.attendance_rate,
    lastAttended: db.last_attended,
  };
}

export async function fetchFrontendMemberAttendance(
  filters: { memberId?: string; dateFrom?: string; dateTo?: string; service?: ServiceType } = {}
): Promise<FrontendMemberAttendance[]> {
  const records = await fetchMemberAttendanceRecords(filters);
  return records.map(toFrontend);
}

export async function fetchFrontendSessionAttendance(
  date: string,
  service: ServiceType
): Promise<FrontendMemberAttendance[]> {
  const records = await fetchSessionAttendance(date, service);
  return records.map(toFrontend);
}

export async function saveFrontendMemberAttendance(record: {
  memberId: string;
  date: string;
  service: string;
  present: boolean;
  notes?: string | null;
}): Promise<void> {
  await upsertMemberAttendance({
    member_id: record.memberId,
    date: record.date,
    service: record.service,
    present: record.present,
    notes: record.notes,
  });
}

export async function bulkSaveFrontendMemberAttendance(
  records: {
    memberId: string;
    date: string;
    service: string;
    present: boolean;
    notes?: string | null;
  }[]
): Promise<void> {
  await bulkUpsertMemberAttendance(
    records.map(r => ({
      member_id: r.memberId,
      date: r.date,
      service: r.service,
      present: r.present,
      notes: r.notes,
    }))
  );
}

export async function deleteFrontendMemberAttendance(
  sessionId: string,
  memberId: string
): Promise<void> {
  await deleteMemberAttendanceRecord(sessionId, memberId);
}

export async function fetchFrontendMemberAttendanceSummaries(): Promise<FrontendMemberAttendanceSummary[]> {
  const summaries = await fetchMemberAttendanceSummaries();
  return summaries.map(summaryToFrontend);
}
