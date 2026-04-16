import { Member as DBMember, fetchMembers, createMember, updateMember, deleteMember, fetchMemberById } from './supabase/members';
import { Member as FrontendMember, MemberStatus, TitheStatus } from '@/app/member-management/components/memberData';
import { fetchFrontendMinistries } from './ministry-adapter';
import { fetchFrontendCellGroups } from './cellGroup-adapter';

function toIsoDateOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v || v === '—') return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const parts = v.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    if (/^\d{1,2}$/.test(dd) && /^\d{1,2}$/.test(mm) && /^\d{4}$/.test(yyyy)) {
      const d = dd.padStart(2, '0');
      const m = mm.padStart(2, '0');
      return `${yyyy}-${m}-${d}`;
    }
  }

  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function calculateAgeFromDob(dob: string | null | undefined): number {
  const iso = toIsoDateOrNull(dob);
  if (!iso) return 0;
  const birth = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

function getSupabaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unknown error';
  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  return [e.message, e.details, e.hint, e.code ? `code=${e.code}` : ''].filter(Boolean).join(' | ') || 'Unknown error';
}

function isDuplicateMemberCodeError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; details?: string };
  const text = `${e.message || ''} ${e.details || ''}`.toLowerCase();
  return e.code === '23505' && text.includes('member_code');
}

function generateMemberCode(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GWC-${y}${m}${d}-${rand}`;
}

// Transform database member to frontend member format
export function adaptMemberToFrontend(dbMember: DBMember, ministryName?: string, cellGroupName?: string): FrontendMember {
  return {
    id: dbMember.id,
    memberId: dbMember.member_code,
    name: dbMember.full_name,
    photo: dbMember.photo_url,
    photoAlt: dbMember.photo_alt,
    phone: dbMember.phone,
    email: dbMember.email,
    gender: dbMember.gender,
    dob: dbMember.date_of_birth,
    age: calculateAgeFromDob(dbMember.date_of_birth),
    status: dbMember.status as MemberStatus,
    titheStatus: dbMember.tithe_status as TitheStatus,
    cellGroup: cellGroupName || '—',
    ministry: ministryName || '—',
    joinDate: dbMember.join_date,
    lastAttendance: dbMember.last_attendance_date || '—',
    attendanceRate: dbMember.attendance_rate,
    totalGiving: dbMember.total_giving,
    address: dbMember.address,
    maritalStatus: dbMember.marital_status,
    occupation: dbMember.occupation,
    emergencyContact: dbMember.emergency_contact,
    baptised: dbMember.baptised,
    attendanceHistory: [], // Will be populated from attendance_records table later
    recentGiving: [],      // Will be populated from giving_transactions table later
  };
}

// Transform frontend member to database member format
export function adaptMemberToDatabase(frontendMember: FrontendMember, ministryId?: string, cellGroupId?: string): Partial<DBMember> {
  return {
    member_code: frontendMember.memberId,
    full_name: frontendMember.name,
    photo_url: frontendMember.photo,
    photo_alt: frontendMember.photoAlt,
    phone: frontendMember.phone,
    email: frontendMember.email,
    gender: frontendMember.gender,
    date_of_birth: toIsoDateOrNull(frontendMember.dob) ?? undefined,
    status: frontendMember.status,
    tithe_status: frontendMember.titheStatus,
    join_date: toIsoDateOrNull(frontendMember.joinDate) ?? undefined,
    last_attendance_date: toIsoDateOrNull(frontendMember.lastAttendance),
    attendance_rate: frontendMember.attendanceRate,
    total_giving: frontendMember.totalGiving,
    address: frontendMember.address,
    marital_status: frontendMember.maritalStatus,
    occupation: frontendMember.occupation,
    emergency_contact: frontendMember.emergencyContact,
    baptised: frontendMember.baptised,
    primary_ministry_id: ministryId,
    primary_cell_group_id: cellGroupId,
  };
}

// Fetch members and adapt to frontend format
export async function fetchFrontendMembers(): Promise<FrontendMember[]> {
  try {
    const [dbMembers, ministries, cellGroups] = await Promise.all([
      fetchMembers(),
      fetchFrontendMinistries(),
      fetchFrontendCellGroups(),
    ]);

    // Create lookup maps for efficient ministry and cell group name resolution
    const ministryMap = new Map(ministries.map(m => [m.id, m.name]));
    const cellGroupMap = new Map(cellGroups.map(cg => [cg.id, cg.name]));

    return dbMembers.map(dbMember => {
      const ministryName = dbMember.primary_ministry_id 
        ? ministryMap.get(dbMember.primary_ministry_id) 
        : undefined;
      const cellGroupName = dbMember.primary_cell_group_id 
        ? cellGroupMap.get(dbMember.primary_cell_group_id) 
        : undefined;
      
      return adaptMemberToFrontend(dbMember, ministryName, cellGroupName);
    });
  } catch (error) {
    console.error('Error fetching frontend members:', error);
    throw error;
  }
}

// Create member from frontend format
export async function createFrontendMember(frontendMember: FrontendMember): Promise<FrontendMember> {
  let candidate = { ...frontendMember };
  const maxAttempts = 5;

  // Fetch ministries and cell groups to resolve IDs
  const [ministries, cellGroups] = await Promise.all([
    fetchFrontendMinistries(),
    fetchFrontendCellGroups(),
  ]);

  // Find ministry ID by name
  const ministryId = frontendMember.ministry && frontendMember.ministry !== '—'
    ? ministries.find(m => m.name === frontendMember.ministry)?.id
    : undefined;

  // Find cell group ID by name
  const cellGroupId = frontendMember.cellGroup && frontendMember.cellGroup !== '—'
    ? cellGroups.find(cg => cg.name === frontendMember.cellGroup)?.id
    : undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const dbData = adaptMemberToDatabase(candidate, ministryId, cellGroupId);
      const createdDbMember = await createMember(dbData);
      return adaptMemberToFrontend(createdDbMember, frontendMember.ministry, frontendMember.cellGroup);
    } catch (error) {
      if (isDuplicateMemberCodeError(error) && attempt < maxAttempts) {
        candidate = { ...candidate, memberId: generateMemberCode() };
        continue;
      }
      console.error('Error creating frontend member:', error);
      throw new Error(`Create member failed: ${getSupabaseErrorMessage(error)}`);
    }
  }

  throw new Error('Create member failed: unable to generate a unique member code');
}

// Update member from frontend format
export async function updateFrontendMember(id: string, frontendMember: FrontendMember): Promise<FrontendMember> {
  try {
    // Fetch ministries and cell groups to resolve IDs
    const [ministries, cellGroups] = await Promise.all([
      fetchFrontendMinistries(),
      fetchFrontendCellGroups(),
    ]);

    // Find ministry ID by name
    const ministryId = frontendMember.ministry && frontendMember.ministry !== '—'
      ? ministries.find(m => m.name === frontendMember.ministry)?.id
      : undefined;

    // Find cell group ID by name
    const cellGroupId = frontendMember.cellGroup && frontendMember.cellGroup !== '—'
      ? cellGroups.find(cg => cg.name === frontendMember.cellGroup)?.id
      : undefined;

    const dbData = adaptMemberToDatabase(frontendMember, ministryId, cellGroupId);
    const updatedDbMember = await updateMember(id, dbData);
    return adaptMemberToFrontend(updatedDbMember, frontendMember.ministry, frontendMember.cellGroup);
  } catch (error) {
    console.error('Error updating frontend member:', error);
    throw new Error(`Update member failed: ${getSupabaseErrorMessage(error)}`);
  }
}

// Fetch single member by ID and adapt to frontend format
export async function fetchFrontendMemberById(id: string): Promise<FrontendMember | null> {
  try {
    const [dbMember, ministries, cellGroups] = await Promise.all([
      fetchMemberById(id),
      fetchFrontendMinistries(),
      fetchFrontendCellGroups(),
    ]);

    if (!dbMember) return null;

    // Create lookup maps
    const ministryMap = new Map(ministries.map(m => [m.id, m.name]));
    const cellGroupMap = new Map(cellGroups.map(cg => [cg.id, cg.name]));

    const ministryName = dbMember.primary_ministry_id 
      ? ministryMap.get(dbMember.primary_ministry_id) 
      : undefined;
    const cellGroupName = dbMember.primary_cell_group_id 
      ? cellGroupMap.get(dbMember.primary_cell_group_id) 
      : undefined;

    return adaptMemberToFrontend(dbMember, ministryName, cellGroupName);
  } catch (error) {
    console.error('Error fetching frontend member by ID:', error);
    throw error;
  }
}

// Delete member
export async function deleteFrontendMember(id: string): Promise<void> {
  try {
    await deleteMember(id);
  } catch (error) {
    console.error('Error deleting frontend member:', error);
    throw error;
  }
}
