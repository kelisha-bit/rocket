import { Ministry as DBMinistry, fetchMinistries, createMinistry, updateMinistry, deleteMinistry, fetchMinistryMemberIds } from './supabase/ministries';
import { fetchMembers } from './supabase/members';
import { getSupabaseErrorMessage } from './utils/supabase-errors';

function normalizeTimeForDb(value: string): string | undefined {
  const v = (value || '').trim();
  if (!v) return undefined;
  // If DB column is a TIME type, Postgres happily accepts HH:MM:SS
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  return v;
}

// Frontend Ministry interface (from ministries/page.tsx)
export interface Ministry {
  id: string;
  name: string;
  leader: string;
  leaderId?: string;
  meetingDay: string;
  meetingTime: string;
  members: number;
  status: 'Active' | 'Inactive' | 'New';
  memberNames?: string[];
}

// Transform database ministry to frontend format
export function adaptMinistryToFrontend(dbMinistry: DBMinistry, leaderName?: string): Ministry {
  return {
    id: dbMinistry.id,
    name: dbMinistry.name,
    leader: leaderName || dbMinistry.leader_name || '—',
    leaderId: dbMinistry.head_member_id,
    meetingDay: dbMinistry.meeting_day,
    meetingTime: dbMinistry.meeting_time,
    members: dbMinistry.member_count ?? 0,
    status: dbMinistry.status,
  };
}

// Transform frontend ministry to database format
export function adaptMinistryToDatabase(frontendMinistry: Ministry): Partial<DBMinistry> {
  return {
    name: frontendMinistry.name,
    head_member_id: frontendMinistry.leaderId || undefined,
    meeting_day: frontendMinistry.meetingDay,
    meeting_time: normalizeTimeForDb(frontendMinistry.meetingTime),
    status: frontendMinistry.status,
  };
}

// Fetch ministries and adapt to frontend format
export async function fetchFrontendMinistries(): Promise<Ministry[]> {
  try {
    const dbMinistries = await fetchMinistries();
    return dbMinistries.map(dbMinistry => adaptMinistryToFrontend(dbMinistry, dbMinistry.leader_name));
  } catch (error) {
    console.error('Error fetching frontend ministries:', error);
    throw error;
  }
}

// Create ministry from frontend format
export async function createFrontendMinistry(frontendMinistry: Ministry): Promise<Ministry> {
  try {
    const dbData = adaptMinistryToDatabase(frontendMinistry);
    const createdDbMinistry = await createMinistry(dbData);
    return adaptMinistryToFrontend(createdDbMinistry);
  } catch (error) {
    console.error('Error creating frontend ministry:', error);
    throw new Error(`Create ministry failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Update ministry from frontend format
export async function updateFrontendMinistry(id: string, frontendMinistry: Ministry): Promise<Ministry> {
  try {
    const dbData = adaptMinistryToDatabase(frontendMinistry);
    const updatedDbMinistry = await updateMinistry(id, dbData);
    return adaptMinistryToFrontend(updatedDbMinistry);
  } catch (error) {
    console.error('Error updating frontend ministry:', error);
    throw new Error(`Update ministry failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Delete ministry
export async function deleteFrontendMinistry(id: string): Promise<void> {
  try {
    await deleteMinistry(id);
  } catch (error) {
    console.error('Error deleting frontend ministry:', error);
    throw error;
  }
}

// Fetch member names for a specific ministry
export async function fetchMinistryMemberNames(ministryId: string): Promise<string[]> {
  try {
    const [memberIds, allMembers] = await Promise.all([
      fetchMinistryMemberIds(ministryId),
      fetchMembers(),
    ]);
    const memberMap = new Map(allMembers.map(m => [m.id, m.full_name]));
    return memberIds.map(id => memberMap.get(id) ?? 'Unknown').filter(n => n !== 'Unknown');
  } catch (error) {
    console.error('Error fetching ministry member names:', error);
    throw error;
  }
}
