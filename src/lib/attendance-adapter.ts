/**
 * Attendance Adapter
 * 
 * This adapter transforms between the database layer and frontend format.
 * It provides a clean interface for the frontend to interact with attendance data.
 */

import {
  fetchAttendanceRecords,
  fetchAttendanceByService,
  fetchAttendanceByDateRange,
  fetchAttendanceById,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceSummary,
  getServiceBreakdown,
  getLatestAttendance,
  getAttendanceTrend,
  type AttendanceRecord as DBAttendanceRecord,
  type ServiceType,
} from './supabase/attendance';

// Frontend format for attendance records
export interface FrontendAttendanceRecord {
  id: string;
  date: string;
  service: ServiceType;
  location: string;
  total: number;
  men: number;
  women: number;
  children: number;
  firstTimers: number;
  visitors: number;
  notes?: string;
  recordedBy?: string;
}

export type { ServiceType };

// Transform database format to frontend format
function toFrontendFormat(dbRecord: DBAttendanceRecord): FrontendAttendanceRecord {
  return {
    id: dbRecord.id,
    date: dbRecord.date,
    service: dbRecord.service,
    location: dbRecord.location,
    total: dbRecord.total,
    men: dbRecord.men,
    women: dbRecord.women,
    children: dbRecord.children,
    firstTimers: dbRecord.first_timers,
    visitors: dbRecord.visitors,
    notes: dbRecord.notes,
    recordedBy: dbRecord.recorded_by,
  };
}

// Transform frontend format to database format
function toDBFormat(frontendRecord: Partial<FrontendAttendanceRecord>): Partial<DBAttendanceRecord> {
  return {
    id: frontendRecord.id,
    date: frontendRecord.date,
    service: frontendRecord.service,
    location: frontendRecord.location,
    total: frontendRecord.total,
    men: frontendRecord.men,
    women: frontendRecord.women,
    children: frontendRecord.children,
    first_timers: frontendRecord.firstTimers,
    visitors: frontendRecord.visitors,
    notes: frontendRecord.notes,
    recorded_by: frontendRecord.recordedBy,
  } as Partial<DBAttendanceRecord>;
}

// Fetch all attendance records
export async function fetchFrontendAttendanceRecords(): Promise<FrontendAttendanceRecord[]> {
  const records = await fetchAttendanceRecords();
  return records.map(toFrontendFormat);
}

// Fetch attendance records by service type
export async function fetchFrontendAttendanceByService(service: ServiceType): Promise<FrontendAttendanceRecord[]> {
  const records = await fetchAttendanceByService(service);
  return records.map(toFrontendFormat);
}

// Fetch attendance records by date range
export async function fetchFrontendAttendanceByDateRange(
  startDate: string,
  endDate: string
): Promise<FrontendAttendanceRecord[]> {
  const records = await fetchAttendanceByDateRange(startDate, endDate);
  return records.map(toFrontendFormat);
}

// Fetch a single attendance record by ID
export async function fetchFrontendAttendanceById(id: string): Promise<FrontendAttendanceRecord | null> {
  const record = await fetchAttendanceById(id);
  return record ? toFrontendFormat(record) : null;
}

// Create a new attendance record
export async function createFrontendAttendanceRecord(
  recordData: Partial<FrontendAttendanceRecord>
): Promise<FrontendAttendanceRecord> {
  const dbData = toDBFormat(recordData);
  const created = await createAttendanceRecord(dbData);
  return toFrontendFormat(created);
}

// Update an existing attendance record
export async function updateFrontendAttendanceRecord(
  id: string,
  recordData: Partial<FrontendAttendanceRecord>
): Promise<FrontendAttendanceRecord> {
  const dbData = toDBFormat(recordData);
  const updated = await updateAttendanceRecord(id, dbData);
  return toFrontendFormat(updated);
}

// Delete an attendance record
export async function deleteFrontendAttendanceRecord(id: string): Promise<void> {
  await deleteAttendanceRecord(id);
}

// Get attendance summary
export async function getFrontendAttendanceSummary(startDate?: string, endDate?: string) {
  return await getAttendanceSummary(startDate, endDate);
}

// Get service breakdown
export async function getFrontendServiceBreakdown(startDate?: string, endDate?: string) {
  return await getServiceBreakdown(startDate, endDate);
}

// Get latest attendance record
export async function getFrontendLatestAttendance(): Promise<FrontendAttendanceRecord | null> {
  const record = await getLatestAttendance();
  return record ? toFrontendFormat(record) : null;
}

// Get attendance trend
export async function getFrontendAttendanceTrend(
  currentStartDate: string,
  currentEndDate: string,
  previousStartDate: string,
  previousEndDate: string
) {
  return await getAttendanceTrend(currentStartDate, currentEndDate, previousStartDate, previousEndDate);
}
