/**
 * Event Adapter
 * Bridges the real DB schema (starts_at / ends_at / description)
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function splitDateTime(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  try {
    const d = new Date(iso);
    const date = d.toISOString().slice(0, 10);
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return { date, time };
  } catch {
    return { date: '', time: '' };
  }
}

function toIso(date: string, time: string): string {
  if (!date) return new Date().toISOString();
  const t = time || '00:00';
  return new Date(`${date}T${t}:00`).toISOString();
}

// ── Transforms ────────────────────────────────────────────────────────────────
function toFrontend(db: DBChurchEvent): FrontendChurchEvent {
  const { date, time } = splitDateTime(db.starts_at);
  const end = splitDateTime(db.ends_at);
  return {
    id: db.id,
    title: db.title,
    date,
    time,
    endDate: end.date || null,
    endTime: end.time || null,
    location: db.location ?? '',
    description: db.description ?? '',
    status: db.status,
  };
}

function toDB(fe: Partial<FrontendChurchEvent>): Partial<DBChurchEvent> {
  const result: Partial<DBChurchEvent> = {};
  if (fe.title       !== undefined) result.title       = fe.title;
  if (fe.description !== undefined) result.description = fe.description || null;
  if (fe.location    !== undefined) result.location    = fe.location || null;
  if (fe.status !== undefined) result.status = fe.status;
  if (fe.date) {
    result.starts_at = toIso(fe.date, fe.time ?? '00:00');
  }
  if (fe.endDate) {
    result.ends_at = toIso(fe.endDate, fe.endTime ?? '00:00');
  } else if (fe.endDate === null) {
    result.ends_at = null;
  }
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
