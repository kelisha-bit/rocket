import { createClient } from './client';

export type MinistryStatus = 'Active' | 'Inactive' | 'New';

export interface Ministry {
  id: string;
  name: string;
  head_member_id?: string;
  leader_name?: string;
  meeting_day: string;
  meeting_time: string;
  status: MinistryStatus;
  created_at: string;
  updated_at: string;
}

// Transform database record to frontend format
export function transformMinistry(dbMinistry: any): Ministry {
  return {
    id: dbMinistry.id,
    name: dbMinistry.name,
    head_member_id: dbMinistry.head_member_id,
    leader_name: dbMinistry.head?.full_name,
    meeting_day: dbMinistry.meeting_day || 'Sunday',
    meeting_time: dbMinistry.meeting_time || '9:00 AM',
    status: dbMinistry.status || 'Active',
    created_at: dbMinistry.created_at,
    updated_at: dbMinistry.updated_at,
  };
}

// Fetch all ministries
export async function fetchMinistries(): Promise<Ministry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ministries')
    .select(`
      *,
      head:head_member_id(id, full_name)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching ministries:', error);
    throw error;
  }

  return data ? data.map(transformMinistry) : [];
}

// Fetch a single ministry by ID
export async function fetchMinistryById(id: string): Promise<Ministry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching ministry:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data ? transformMinistry(data) : null;
}

// Create a new ministry
export async function createMinistry(ministryData: Partial<Ministry>): Promise<Ministry> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    name: ministryData.name,
    head_member_id: ministryData.head_member_id,
    meeting_day: ministryData.meeting_day,
    meeting_time: ministryData.meeting_time,
    status: ministryData.status,
  };

  const { data, error } = await supabase
    .from('ministries')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error creating ministry:', error);
    throw error;
  }

  return transformMinistry(data);
}

// Update an existing ministry
export async function updateMinistry(id: string, ministryData: Partial<Ministry>): Promise<Ministry> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    name: ministryData.name,
    head_member_id: ministryData.head_member_id,
    meeting_day: ministryData.meeting_day,
    meeting_time: ministryData.meeting_time,
    status: ministryData.status,
  };

  const { data, error } = await supabase
    .from('ministries')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ministry:', error);
    throw error;
  }

  return transformMinistry(data);
}

// Delete a ministry
export async function deleteMinistry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('ministries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ministry:', error);
    throw error;
  }
}

// Search ministries by name or location
export async function searchMinistries(query: string): Promise<Ministry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .or(`name.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching ministries:', error);
    throw error;
  }

  return data ? data.map(transformMinistry) : [];
}
