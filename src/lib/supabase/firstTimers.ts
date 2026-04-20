import { createClient } from './client';
import { createMember, type Member } from './members';

export type FirstTimerStatus = 'New' | 'Contacted' | 'Connected' | 'Converted' | 'Not Interested';

export interface FirstTimer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  gender: 'Male' | 'Female' | null;
  address: string | null;
  preferred_contact_method: string | null;
  first_visit_date: string;
  service_type: string | null;
  event_id: string | null;
  notes: string | null;
  invited_by_name: string | null;
  invited_by_member_id: string | null;
  status: FirstTimerStatus;
  converted_member_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export function transformFirstTimer(raw: any): FirstTimer {
  return {
    id: raw.id,
    full_name: raw.full_name,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    gender: raw.gender ?? null,
    address: raw.address ?? null,
    preferred_contact_method: raw.preferred_contact_method ?? null,
    first_visit_date: raw.first_visit_date,
    service_type: raw.service_type ?? null,
    event_id: raw.event_id ?? null,
    notes: raw.notes ?? null,
    invited_by_name: raw.invited_by_name ?? null,
    invited_by_member_id: raw.invited_by_member_id ?? null,
    status: raw.status,
    converted_member_id: raw.converted_member_id ?? null,
    created_by: raw.created_by ?? null,
    assigned_to: raw.assigned_to ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function fetchFirstTimers(): Promise<FirstTimer[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('first_timers')
    .select('*')
    .order('first_visit_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching first timers:', error);
    throw error;
  }

  return (data ?? []).map(transformFirstTimer);
}

export async function createFirstTimer(firstTimerData: Partial<FirstTimer>): Promise<FirstTimer> {
  const supabase = createClient();

  const dbData = {
    full_name: firstTimerData.full_name,
    phone: firstTimerData.phone ?? null,
    email: firstTimerData.email ?? null,
    gender: firstTimerData.gender ?? null,
    address: firstTimerData.address ?? null,
    preferred_contact_method: firstTimerData.preferred_contact_method ?? null,
    first_visit_date: firstTimerData.first_visit_date ?? null,
    service_type: firstTimerData.service_type ?? null,
    event_id: firstTimerData.event_id ?? null,
    notes: firstTimerData.notes ?? null,
    invited_by_name: firstTimerData.invited_by_name ?? null,
    invited_by_member_id: firstTimerData.invited_by_member_id ?? null,
    status: firstTimerData.status ?? 'New',
  };

  const { data, error } = await (supabase as any)
    .from('first_timers')
    .insert(dbData as any)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating first timer:', error);
    throw error;
  }

  return transformFirstTimer(data);
}

export async function updateFirstTimer(id: string, firstTimerData: Partial<FirstTimer>): Promise<FirstTimer> {
  const supabase = createClient();

  const dbData: any = {};
  if (firstTimerData.full_name !== undefined) dbData.full_name = firstTimerData.full_name;
  if (firstTimerData.phone !== undefined) dbData.phone = firstTimerData.phone;
  if (firstTimerData.email !== undefined) dbData.email = firstTimerData.email;
  if (firstTimerData.gender !== undefined) dbData.gender = firstTimerData.gender;
  if (firstTimerData.address !== undefined) dbData.address = firstTimerData.address;
  if (firstTimerData.preferred_contact_method !== undefined) dbData.preferred_contact_method = firstTimerData.preferred_contact_method;
  if (firstTimerData.first_visit_date !== undefined) dbData.first_visit_date = firstTimerData.first_visit_date;
  if (firstTimerData.service_type !== undefined) dbData.service_type = firstTimerData.service_type;
  if (firstTimerData.event_id !== undefined) dbData.event_id = firstTimerData.event_id;
  if (firstTimerData.notes !== undefined) dbData.notes = firstTimerData.notes;
  if (firstTimerData.invited_by_name !== undefined) dbData.invited_by_name = firstTimerData.invited_by_name;
  if (firstTimerData.invited_by_member_id !== undefined) dbData.invited_by_member_id = firstTimerData.invited_by_member_id;
  if (firstTimerData.status !== undefined) dbData.status = firstTimerData.status;
  if (firstTimerData.assigned_to !== undefined) dbData.assigned_to = firstTimerData.assigned_to;
  if (firstTimerData.converted_member_id !== undefined) dbData.converted_member_id = firstTimerData.converted_member_id;

  const { data, error } = await (supabase as any)
    .from('first_timers')
    .update(dbData as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating first timer:', error);
    throw error;
  }

  return transformFirstTimer(data);
}

export async function deleteFirstTimer(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await (supabase as any).from('first_timers').delete().eq('id', id);

  if (error) {
    console.error('Error deleting first timer:', error);
    throw error;
  }
}

export async function convertFirstTimerToMember(firstTimer: FirstTimer): Promise<{ member: Member; firstTimer: FirstTimer }> {
  const member = await createMember({
    full_name: firstTimer.full_name,
    phone: firstTimer.phone ?? undefined,
    email: firstTimer.email ?? undefined,
    gender: (firstTimer.gender ?? undefined) as any,
    address: firstTimer.address ?? undefined,
    join_date: firstTimer.first_visit_date,
    status: 'new',
  });

  const updated = await updateFirstTimer(firstTimer.id, {
    status: 'Converted',
    converted_member_id: member.id,
  });

  return { member, firstTimer: updated };
}
