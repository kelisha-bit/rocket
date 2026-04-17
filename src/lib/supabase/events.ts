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
  description: string | null;
  location: string | null;
  starts_at: string;          // timestamptz ISO string
  ends_at: string | null;     // timestamptz ISO string
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function transformEvent(raw: any): ChurchEvent {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? null,
    location: raw.location ?? null,
    starts_at: raw.starts_at,
    ends_at: raw.ends_at ?? null,
    status: fromDbStatus(raw.status),
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
    .gte('starts_at', startDate)
    .lte('starts_at', endDate)
    .order('starts_at', { ascending: true });
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
    description: eventData.description ?? null,
    location: eventData.location ?? null,
    starts_at: eventData.starts_at,
    ends_at: eventData.ends_at ?? null,
    status: toDbStatus(eventData.status ?? 'draft'),
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
  if (eventData.description !== undefined) dbData.description = eventData.description;
  if (eventData.location   !== undefined) dbData.location    = eventData.location;
  if (eventData.starts_at  !== undefined) dbData.starts_at   = eventData.starts_at;
  if (eventData.ends_at    !== undefined) dbData.ends_at     = eventData.ends_at;
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
  const now = new Date().toISOString();
  let query = supabase
    .from('events')
    .select('*')
    .gte('starts_at', now)
    .in('status', [toDbStatus('scheduled'), toDbStatus('draft')])
    .order('starts_at', { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('Error fetching upcoming events:', error); throw toError(error, 'Error fetching upcoming events'); }
  return (data ?? []).map(transformEvent);
}

export async function getEventStatistics(startDate?: string, endDate?: string) {
  const supabase = createClient();
  let query = supabase.from('events').select('status');
  if (startDate) query = query.gte('starts_at', startDate);
  if (endDate)   query = query.lte('starts_at', endDate);
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
