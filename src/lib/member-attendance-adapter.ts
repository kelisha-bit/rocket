/**
 * Member Attendance Adapter
 *
 * Transforms between the database layer and frontend format for
 * per-member attendance tracking.
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
} from './supabase/memberAttendance';
import type { ServiceType } from './supabase/attendance';

export type { ServiceType };

export interface FrontendMemberAttendance {
  id: string;
  memberId: string;
  attendanceId?: string | null;
  date: string;
  service: ServiceType;
  present: boolean;
  notes?: string;
  recordedBy?: string;
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
    id: db.id,
    memberId: db.member_id,
    attendanceId: db.attendance_id,
    date: db.date,
    service: db.service,
    present: db.present,
    notes: db.notes,
    recordedBy: db.recorded_by,
    fullName: db.full_name,
    memberCode: db.member_code,
    photoUrl: db.photo_url,
    gender: db.gender,
    memberStatus: db.member_status,
  };
}

function summaryToFrontend(db: MemberAttendanceSummary): FrontendMemberAttendanceSummary {
  return {
    memberId: db.member_id,
    fullName: db.full_name,
    memberCode: db.member_code,
    photoUrl: db.photo_url,
    memberStatus: db.member_status,
    totalSessions: db.total_sessions,
    sessionsAttended: db.sessions_attended,
    attendanceRate: db.attendance_rate,
    lastAttended: db.last_attended,
  };
}

// Fetch all member attendance records with optional filters
export async function fetchFrontendMemberAttendance(
  filters: { memberId?: string; dateFrom?: string; dateTo?: string; service?: ServiceType } = {}
): Promise<FrontendMemberAttendance[]> {
  const records = await fetchMemberAttendanceRecords(filters);
  return records.map(toFrontend);
}

// Fetch all records for a specific session (date + service)
export async function fetchFrontendSessionAttendance(
  date: string,
  service: ServiceType
): Promise<FrontendMemberAttendance[]> {
  const records = await fetchSessionAttendance(date, service);
  return records.map(toFrontend);
}

// Save (upsert) a single member attendance record
export async function saveFrontendMemberAttendance(
  record: Omit<FrontendMemberAttendance, 'id' | 'fullName' | 'memberCode' | 'photoUrl' | 'gender' | 'memberStatus'>
): Promise<void> {
  await upsertMemberAttendance({
    member_id: record.memberId,
    attendance_id: record.attendanceId ?? null,
    date: record.date,
    service: record.service,
    present: record.present,
    notes: record.notes,
    recorded_by: record.recordedBy,
  });
}

// Bulk save attendance for a whole session
export async function bulkSaveFrontendMemberAttendance(
  records: Omit<FrontendMemberAttendance, 'id' | 'fullName' | 'memberCode' | 'photoUrl' | 'gender' | 'memberStatus'>[]
): Promise<void> {
  await bulkUpsertMemberAttendance(
    records.map(r => ({
      member_id: r.memberId,
      attendance_id: r.attendanceId ?? null,
      date: r.date,
      service: r.service,
      present: r.present,
      notes: r.notes,
      recorded_by: r.recordedBy,
    }))
  );
}

// Delete a member attendance record
export async function deleteFrontendMemberAttendance(id: string): Promise<void> {
  await deleteMemberAttendanceRecord(id);
}

// Get per-member attendance summary (rate, total sessions, last attended)
export async function fetchFrontendMemberAttendanceSummaries(): Promise<FrontendMemberAttendanceSummary[]> {
  const summaries = await fetchMemberAttendanceSummaries();
  return summaries.map(summaryToFrontend);
}
