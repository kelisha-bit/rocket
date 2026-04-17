import { createClient } from './client';

// Match the actual DB enum — extend if your enum has more values
export type EventStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled';

type DbEventStatus = 'Draft' | 'Scheduled' | 'Completed' | 'Cancelled' | EventStatus;

function toDbStatus(status: EventStatus): DbEventStatus {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function toError(error: any, context: string): Error {
  const message = error?.message || error?.error_description || error?.hint || 'Unknown error';
  const details = error?.details ? ` Details: ${String(error.details)}` : '';
  const code = error?.code ? ` Code: ${String(error.code)}` : '';
  return new Error(`${context}: ${message}${details}${code}`);
}

function fromDbStatus(status: unknown): EventStatus {
  switch (status) {
    case 'Draft':
      return 'draft';
    case 'Scheduled':
      return 'scheduled';
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    case 'draft':
    case 'scheduled':
    case 'completed':
    case 'cancelled':
      return status;
    default:
      return 'draft';
  }
}

// Display labels for the UI
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft:     'Draft',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export interface ChurchEvent {
  id: string;
  title: string;
  description: string | null;  // maps to 'notes' column
  location: string | null;
  date: string;                // DATE as ISO string (YYYY-MM-DD)
  time: string;                // TIME as string (HH:MM)
  status: EventStatus;
  department: string;          // 'Church-wide' | 'Youth' | 'Women' | 'Men' | 'Children'
  expected_attendance: number;
  actual_attendance: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function transformEvent(raw: any): ChurchEvent {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.notes ?? raw.description ?? null,  // notes is the DB column
    location: raw.location ?? null,
    date: raw.date,
    time: raw.time ?? '09:00',
    status: fromDbStatus(raw.status),
    department: raw.department ?? 'Church-wide',
    expected_attendance: raw.expected_attendance ?? 0,
    actual_attendance: raw.actual_attendance ?? null,
    created_by: raw.created_by ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function fetchEvents(): Promise<ChurchEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });
  if (error) { console.error('Error fetching events:', error); throw toError(error, 'Error fetching events'); }
  return (data ?? []).map(transformEvent);
}

export async function fetchEventsByStatus(status: EventStatus): Promise<ChurchEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', toDbStatus(status))
    .order('starts_at', { ascending: true });
  if (error) { console.error('Error fetching events by status:', error); throw toError(error, 'Error fetching events by status'); }
  return (data ?? []).map(transformEvent);
}

export async function fetchEventsByDateRange(startDate: string, endDate: string): Promise<ChurchEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  if (error) { console.error('Error fetching events by date range:', error); throw toError(error, 'Error fetching events by date range'); }
  return (data ?? []).map(transformEvent);
}

export async function fetchEventById(id: string): Promise<ChurchEvent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching event:', error); throw toError(error, 'Error fetching event');
  }
  return data ? transformEvent(data) : null;
}

export async function createEvent(eventData: Partial<ChurchEvent>): Promise<ChurchEvent> {
  const supabase = createClient();
  const dbData = {
    title: eventData.title,
    notes: eventData.description ?? null,  // DB column is 'notes'
    location: eventData.location ?? null,
    date: eventData.date,
    time: eventData.time ?? '09:00',
    status: toDbStatus(eventData.status ?? 'draft'),
    department: eventData.department ?? 'Church-wide',
    expected_attendance: eventData.expected_attendance ?? 0,
    actual_attendance: eventData.actual_attendance ?? null,
    // created_by omitted — requires a valid UUID from auth
  };
  const { data, error } = await supabase.from('events').insert(dbData).select().single();
  if (error) { console.error('Error creating event:', error); throw toError(error, 'Error creating event'); }
  return transformEvent(data);
}

export async function updateEvent(id: string, eventData: Partial<ChurchEvent>): Promise<ChurchEvent> {
  const supabase = createClient();
  const dbData: any = {};
  if (eventData.title      !== undefined) dbData.title       = eventData.title;
  if (eventData.description !== undefined) dbData.notes       = eventData.description;  // DB column is 'notes'
  if (eventData.location   !== undefined) dbData.location    = eventData.location;
  if (eventData.date       !== undefined) dbData.date        = eventData.date;
  if (eventData.time       !== undefined) dbData.time        = eventData.time;
  if (eventData.department !== undefined) dbData.department  = eventData.department;
  if (eventData.expected_attendance !== undefined) dbData.expected_attendance = eventData.expected_attendance;
  if (eventData.actual_attendance   !== undefined) dbData.actual_attendance   = eventData.actual_attendance;
  if (eventData.status     !== undefined) dbData.status      = toDbStatus(eventData.status);
  const { data, error } = await supabase.from('events').update(dbData).eq('id', id).select().single();
  if (error) { console.error('Error updating event:', error); throw toError(error, 'Error updating event'); }
  return transformEvent(data);
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) { console.error('Error deleting event:', error); throw toError(error, 'Error deleting event'); }
}

export async function getUpcomingEvents(limit?: number): Promise<ChurchEvent[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD
  let query = supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .in('status', [toDbStatus('scheduled'), toDbStatus('draft')])
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('Error fetching upcoming events:', error); throw toError(error, 'Error fetching upcoming events'); }
  return (data ?? []).map(transformEvent);
}

export async function getEventStatistics(startDate?: string, endDate?: string) {
  const supabase = createClient();
  let query = supabase.from('events').select('status');
  if (startDate) query = query.gte('date', startDate);
  if (endDate)   query = query.lte('date', endDate);
  const { data, error } = await query;
  if (error) { console.error('Error fetching event statistics:', error); throw toError(error, 'Error fetching event statistics'); }
  const normalized = (data ?? []).map((e: any) => ({ status: fromDbStatus(e.status) }));
  return {
    scheduled:  normalized.filter(e => e.status === 'scheduled').length,
    draft:      normalized.filter(e => e.status === 'draft').length,
    completed:  normalized.filter(e => e.status === 'completed').length,
    cancelled:  normalized.filter(e => e.status === 'cancelled').length,
    total:      normalized.length,
  };
}

// Keep old exports for compatibility
export type { EventStatus as EventDepartment };
