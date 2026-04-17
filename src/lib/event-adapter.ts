/**
 * Event Adapter
 * Bridges the real DB schema (date / time / notes)
 * to the frontend format used by the events page and dashboard.
 */

import {
  fetchEvents,
  fetchEventsByStatus,
  fetchEventsByDateRange,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventStatistics,
  type ChurchEvent as DBChurchEvent,
  type EventStatus,
} from './supabase/events';

// ── Frontend shape ────────────────────────────────────────────────────────────
export interface FrontendChurchEvent {
  id: string;
  title: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** HH:MM 24-hour */
  time: string;
  /** ISO date string for end, or null */
  endDate: string | null;
  endTime: string | null;
  location: string;
  description: string;
  status: EventStatus;
  /** Department/category label (e.g. 'Church-wide', 'Youth') */
  department: string;
  /** Expected headcount for the event */
  expectedAttendance: number;
}

export type { EventStatus };
// Keep EventDepartment alias so existing imports don't break
export type EventDepartment = 'Church-wide' | 'Youth' | 'Women' | 'Men' | 'Children';

const STATUSES: EventStatus[] = ['scheduled', 'draft', 'completed', 'cancelled'];

const STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: 'Scheduled',
  draft:     'Draft',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ── Helpers ─────────────────────────────────────────────────────────────────--
// No longer needed - DB now has separate date/time columns

// ── Transforms ────────────────────────────────────────────────────────────────
function toFrontend(db: DBChurchEvent): FrontendChurchEvent {
  return {
    id: db.id,
    title: db.title,
    date: db.date,
    time: db.time ?? '09:00',
    endDate: null,  // DB doesn't have end date/time
    endTime: null,
    location: db.location ?? '',
    description: db.description ?? '',
    status: db.status,
    department: db.department ?? 'Church-wide',
    expectedAttendance: db.expected_attendance ?? 0,
  };
}

function toDB(fe: Partial<FrontendChurchEvent>): Partial<DBChurchEvent> {
  const result: Partial<DBChurchEvent> = {};
  if (fe.title       !== undefined) result.title       = fe.title;
  if (fe.description !== undefined) result.description = fe.description || null;
  if (fe.location    !== undefined) result.location    = fe.location || null;
  if (fe.status      !== undefined) result.status      = fe.status;
  if (fe.date        !== undefined) result.date        = fe.date;
  if (fe.time        !== undefined) result.time        = fe.time;
  if (fe.department  !== undefined) result.department  = fe.department;
  if (fe.expectedAttendance !== undefined) result.expected_attendance = fe.expectedAttendance;
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchFrontendEvents(): Promise<FrontendChurchEvent[]> {
  return (await fetchEvents()).map(toFrontend);
}

export async function fetchFrontendEventsByStatus(status: EventStatus): Promise<FrontendChurchEvent[]> {
  return (await fetchEventsByStatus(status)).map(toFrontend);
}

export async function fetchFrontendEventsByDateRange(start: string, end: string): Promise<FrontendChurchEvent[]> {
  return (await fetchEventsByDateRange(start, end)).map(toFrontend);
}

export async function fetchFrontendEventById(id: string): Promise<FrontendChurchEvent | null> {
  const ev = await fetchEventById(id);
  return ev ? toFrontend(ev) : null;
}

export async function createFrontendEvent(fe: Partial<FrontendChurchEvent>): Promise<FrontendChurchEvent> {
  return toFrontend(await createEvent(toDB(fe)));
}

export async function updateFrontendEvent(id: string, fe: Partial<FrontendChurchEvent>): Promise<FrontendChurchEvent> {
  return toFrontend(await updateEvent(id, toDB(fe)));
}

export async function deleteFrontendEvent(id: string): Promise<void> {
  await deleteEvent(id);
}

export async function getFrontendUpcomingEvents(limit?: number): Promise<FrontendChurchEvent[]> {
  return (await getUpcomingEvents(limit)).map(toFrontend);
}

export async function getFrontendEventStatistics(startDate?: string, endDate?: string) {
  return getEventStatistics(startDate, endDate);
}
