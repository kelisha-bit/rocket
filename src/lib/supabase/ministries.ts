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
  member_count: number;
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
    member_count: Number(dbMinistry._member_count ?? 0),
    created_at: dbMinistry.created_at,
    updated_at: dbMinistry.updated_at,
  };
}

// Fetch all ministries
export async function fetchMinistries(): Promise<Ministry[]> {
  const supabase = createClient();

  // Try fetching with leader join first; fall back to plain select if the FK doesn't exist
  let data: any[] | null = null;

  const { data: joinData, error: joinError } = await supabase
    .from('ministries')
    .select(`
      *,
      head:head_member_id(id, full_name)
    `)
    .order('name', { ascending: true });

  if (joinError) {
    // FK join failed — fall back to a plain select without the join
    console.warn('Ministry head join failed, falling back to plain select:', joinError.message);
    const { data: plainData, error: plainError } = await supabase
      .from('ministries')
      .select('*')
      .order('name', { ascending: true });

    if (plainError) {
      console.error('Error fetching ministries:', plainError);
      throw new Error(`DB error (${plainError.code}): ${plainError.message}${plainError.hint ? ' — ' + plainError.hint : ''}`);
    }
    data = plainData;
  } else {
    data = joinData;
  }

  if (!data || data.length === 0) return [];

  // Count members per ministry using the member_ministries junction table
  // so members in multiple ministries are counted in each one
  let countMap: Record<string, number> = {};
  try {
    const { data: junctionRows } = await supabase
      .from('member_ministries')
      .select('ministry_id');
    if (junctionRows) {
      for (const row of junctionRows) {
        if (row.ministry_id) {
          countMap[row.ministry_id] = (countMap[row.ministry_id] || 0) + 1;
        }
      }
    }
  } catch {
    // fallback: counts stay 0
  }

  return data.map(m => transformMinistry({ ...m, _member_count: countMap[m.id] ?? 0 }));
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

// Fetch member IDs for a specific ministry from the junction table
export async function fetchMinistryMemberIds(ministryId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('member_ministries')
    .select('member_id')
    .eq('ministry_id', ministryId);

  if (error) {
    console.error('Error fetching ministry members:', error);
    throw error;
  }

  return data ? data.map((r: { member_id: string }) => r.member_id) : [];
}

// Fetch ministries for a specific member (via member_ministries junction table)
export async function fetchMemberMinistries(memberId: string): Promise<Ministry[]> {
  const supabase = createClient();

  // Try the implicit join first (requires FK relationship in schema)
  const { data, error } = await supabase
    .from('member_ministries')
    .select('ministry_id, ministries(*)')
    .eq('member_id', memberId);

  if (!error) {
    if (!data || data.length === 0) return [];
    return data
      .filter((r: any) => r.ministries)
      .map((r: any) => transformMinistry(r.ministries));
  }

  // Fallback: FK relationship not available, do manual two-step query
  console.warn('FK join failed, using fallback query:', error.message);

  // Step 1: Get ministry IDs from junction table
  const { data: junctionData, error: junctionError } = await supabase
    .from('member_ministries')
    .select('ministry_id')
    .eq('member_id', memberId);

  if (junctionError) {
    console.error('Error fetching member ministry IDs:', JSON.stringify(junctionError, null, 2));
    return []; // Graceful fallback - return empty array
  }

  if (!junctionData || junctionData.length === 0) return [];

  const ministryIds = junctionData.map((r: any) => r.ministry_id).filter(Boolean);
  if (ministryIds.length === 0) return [];

  // Step 2: Fetch ministry details
  const { data: ministriesData, error: ministriesError } = await supabase
    .from('ministries')
    .select('*')
    .in('id', ministryIds);

  if (ministriesError) {
    console.error('Error fetching ministry details:', JSON.stringify(ministriesError, null, 2));
    return [];
  }

  if (!ministriesData) return [];

  // Get member counts
  let countMap: Record<string, number> = {};
  try {
    const { data: countRows } = await supabase
      .from('member_ministries')
      .select('ministry_id');
    if (countRows) {
      for (const row of countRows) {
        if (row.ministry_id) {
          countMap[row.ministry_id] = (countMap[row.ministry_id] || 0) + 1;
        }
      }
    }
  } catch {
    // counts stay 0
  }

  return ministriesData.map(m => transformMinistry({ ...m, _member_count: countMap[m.id] ?? 0 }));
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
