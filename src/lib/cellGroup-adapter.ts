import { CellGroup as DBCellGroup, fetchCellGroups, createCellGroup, updateCellGroup, deleteCellGroup } from './supabase/cellGroups';

// Frontend CellGroup interface (from cell-groups/page.tsx)
export interface CellGroup {
  id: string;
  name: string;
  leader: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  members: number;
  status: 'Active' | 'Needs Attention' | 'active' | 'inactive' | 'new' | string;
  description?: string;
  zone: string;
}

// Transform database cell group to frontend format
export function adaptCellGroupToFrontend(dbCellGroup: DBCellGroup): CellGroup {
  return {
    id: dbCellGroup.id,
    name: dbCellGroup.name,
    leader: '—', // Will be populated from members table later
    meetingDay: dbCellGroup.meeting_day,
    meetingTime: dbCellGroup.meeting_time,
    location: dbCellGroup.location,
    members: dbCellGroup.member_count,
    status: dbCellGroup.status,
    description: dbCellGroup.description,
    zone: 'Zone A', // Default zone — DB doesn't have a zone column yet
  };
}

// Transform frontend cell group to database format
export function adaptCellGroupToDatabase(frontendCellGroup: CellGroup): Partial<DBCellGroup> {
  // Map frontend status strings to DB enum values
  const statusMap: Record<string, DBCellGroup['status']> = {
    Active: 'active',
    'Needs Attention': 'active',
    active: 'active',
    inactive: 'inactive',
    new: 'new',
  };
  return {
    name: frontendCellGroup.name,
    description: frontendCellGroup.description,
    meeting_day: frontendCellGroup.meetingDay,
    meeting_time: frontendCellGroup.meetingTime,
    location: frontendCellGroup.location,
    status: statusMap[frontendCellGroup.status] ?? 'active',
    member_count: frontendCellGroup.members,
  };
}

// Fetch cell groups and adapt to frontend format
export async function fetchFrontendCellGroups(): Promise<CellGroup[]> {
  try {
    const dbCellGroups = await fetchCellGroups();
    return dbCellGroups.map(adaptCellGroupToFrontend);
  } catch (error) {
    console.error('Error fetching frontend cell groups:', error);
    throw error;
  }
}

// Create cell group from frontend format
export async function createFrontendCellGroup(frontendCellGroup: CellGroup): Promise<CellGroup> {
  try {
    const dbData = adaptCellGroupToDatabase(frontendCellGroup);
    const createdDbCellGroup = await createCellGroup(dbData);
    return adaptCellGroupToFrontend(createdDbCellGroup);
  } catch (error) {
    console.error('Error creating frontend cell group:', error);
    throw error;
  }
}

// Update cell group from frontend format
export async function updateFrontendCellGroup(id: string, frontendCellGroup: CellGroup): Promise<CellGroup> {
  try {
    const dbData = adaptCellGroupToDatabase(frontendCellGroup);
    const updatedDbCellGroup = await updateCellGroup(id, dbData);
    return adaptCellGroupToFrontend(updatedDbCellGroup);
  } catch (error) {
    console.error('Error updating frontend cell group:', error);
    throw error;
  }
}

// Delete cell group
export async function deleteFrontendCellGroup(id: string): Promise<void> {
  try {
    await deleteCellGroup(id);
  } catch (error) {
    console.error('Error deleting frontend cell group:', error);
    throw error;
  }
}
