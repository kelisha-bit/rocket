import { createClient } from './client';

export type CellGroupStatus = 'active' | 'inactive' | 'new';

export interface CellGroup {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  leader_name?: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status: CellGroupStatus;
  member_count: number;
  zone?: string;
  created_at: string;
  updated_at: string;
}

// Transform database record to frontend format
export function transformCellGroup(dbCellGroup: any): CellGroup {
  return {
    id: dbCellGroup.id,
    name: dbCellGroup.name,
    description: dbCellGroup.description || '',
    leader_id: dbCellGroup.leader_id,
    leader_name: dbCellGroup.leader_name,
    meeting_day: dbCellGroup.meeting_day || 'Sunday',
    meeting_time: dbCellGroup.meeting_time || '5:00 PM',
    location: dbCellGroup.location || '',
    status: dbCellGroup.status || 'active',
    member_count: dbCellGroup.member_count || 0,
    zone: dbCellGroup.zone || 'Zone A',
    created_at: dbCellGroup.created_at,
    updated_at: dbCellGroup.updated_at,
  };
}

// Fetch all cell groups
export async function fetchCellGroups(): Promise<CellGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cell_groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching cell groups:', error);
    throw error;
  }

  return data ? data.map(transformCellGroup) : [];
}

// Fetch a single cell group by ID
export async function fetchCellGroupById(id: string): Promise<CellGroup | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cell_groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching cell group:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data ? transformCellGroup(data) : null;
}

// Create a new cell group
export async function createCellGroup(cellGroupData: Partial<CellGroup>): Promise<CellGroup> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    name: cellGroupData.name,
    description: cellGroupData.description,
    leader_id: cellGroupData.leader_id,
    meeting_day: cellGroupData.meeting_day,
    meeting_time: cellGroupData.meeting_time,
    location: cellGroupData.location,
    status: cellGroupData.status,
    member_count: cellGroupData.member_count,
  };

  const { data, error } = await supabase
    .from('cell_groups')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error creating cell group:', error);
    throw error;
  }

  return transformCellGroup(data);
}

// Update an existing cell group
export async function updateCellGroup(id: string, cellGroupData: Partial<CellGroup>): Promise<CellGroup> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    name: cellGroupData.name,
    description: cellGroupData.description,
    leader_id: cellGroupData.leader_id,
    meeting_day: cellGroupData.meeting_day,
    meeting_time: cellGroupData.meeting_time,
    location: cellGroupData.location,
    status: cellGroupData.status,
    member_count: cellGroupData.member_count,
  };

  const { data, error } = await supabase
    .from('cell_groups')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cell group:', error);
    throw error;
  }

  return transformCellGroup(data);
}

// Delete a cell group
export async function deleteCellGroup(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('cell_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cell group:', error);
    throw error;
  }
}

// Search cell groups by name or location
export async function searchCellGroups(query: string): Promise<CellGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cell_groups')
    .select('*')
    .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching cell groups:', error);
    throw error;
  }

  return data ? data.map(transformCellGroup) : [];
}
