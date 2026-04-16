import { createClient } from './client';

export type MemberStatus = 'active' | 'inactive' | 'new' | 'transferred';
export type TitheStatus = 'tithe-faithful' | 'tithe-irregular' | 'tithe-none';

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  photo_url: string;
  photo_alt: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  status: MemberStatus;
  tithe_status: TitheStatus;
  join_date: string;
  last_attendance_date: string;
  attendance_rate: number;
  total_giving: number;
  address: string;
  marital_status: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  occupation: string;
  emergency_contact: string;
  baptised: boolean;
  primary_cell_group_id?: string;
  primary_ministry_id?: string;
  created_at: string;
  updated_at: string;
}

// Transform database record to frontend format
export function transformMember(dbMember: any): Member {
  return {
    id: dbMember.id,
    member_code: dbMember.member_code,
    full_name: dbMember.full_name,
    photo_url: dbMember.photo_url || 'https://i.pravatar.cc/48?img=12',
    photo_alt: dbMember.photo_alt || `${dbMember.full_name} profile photo`,
    phone: dbMember.phone || '',
    email: dbMember.email || '',
    gender: dbMember.gender || 'Male',
    date_of_birth: dbMember.date_of_birth || '',
    status: dbMember.status || 'new',
    tithe_status: dbMember.tithe_status || 'tithe-none',
    join_date: dbMember.join_date || '',
    last_attendance_date: dbMember.last_attendance_date || '',
    attendance_rate: dbMember.attendance_rate || 0,
    total_giving: dbMember.total_giving || 0,
    address: dbMember.address || '',
    marital_status: dbMember.marital_status || 'Single',
    occupation: dbMember.occupation || '',
    emergency_contact: dbMember.emergency_contact || '',
    baptised: dbMember.baptised || false,
    primary_cell_group_id: dbMember.primary_cell_group_id,
    primary_ministry_id: dbMember.primary_ministry_id,
    created_at: dbMember.created_at,
    updated_at: dbMember.updated_at,
  };
}

// Fetch all members, with total_giving computed from giving_transactions
export async function fetchMembers(): Promise<Member[]> {
  const supabase = createClient();

  // Run both queries in parallel
  const [membersResult, txResult] = await Promise.all([
    supabase.from('members').select('*').order('created_at', { ascending: false }),
    supabase
      .from('giving_transactions')
      .select('member_id, amount')
      .eq('type', 'income')
      .not('member_id', 'is', null),
  ]);

  if (membersResult.error) {
    console.error('Error fetching members:', membersResult.error);
    throw membersResult.error;
  }

  // Build a map of member_id → total giving from transactions
  const givingMap = new Map<string, number>();
  if (txResult.data) {
    for (const tx of txResult.data) {
      if (tx.member_id) {
        givingMap.set(tx.member_id, (givingMap.get(tx.member_id) ?? 0) + (tx.amount ?? 0));
      }
    }
  }

  return (membersResult.data ?? []).map(dbMember => {
    const computed = givingMap.get(dbMember.id);
    // Prefer live-computed total; fall back to stored value if no transactions linked
    const total_giving = computed !== undefined ? computed : (dbMember.total_giving ?? 0);
    return transformMember({ ...dbMember, total_giving });
  });
}

// Fetch a single member by ID, with total_giving computed from giving_transactions
export async function fetchMemberById(id: string): Promise<Member | null> {
  const supabase = createClient();

  const [memberResult, txResult] = await Promise.all([
    supabase.from('members').select('*').eq('id', id).single(),
    supabase
      .from('giving_transactions')
      .select('amount')
      .eq('member_id', id)
      .eq('type', 'income'),
  ]);

  if (memberResult.error) {
    console.error('Error fetching member:', memberResult.error);
    if (memberResult.error.code === 'PGRST116') return null;
    throw memberResult.error;
  }

  if (!memberResult.data) return null;

  const computedTotal = txResult.data
    ? txResult.data.reduce((sum, tx) => sum + (tx.amount ?? 0), 0)
    : memberResult.data.total_giving ?? 0;

  return transformMember({ ...memberResult.data, total_giving: computedTotal });
}

// Create a new member
export async function createMember(memberData: Partial<Member>): Promise<Member> {
  const supabase = createClient();
  
  // Prepare data for database (remove frontend-only fields)
  const dbData = {
    member_code: memberData.member_code,
    full_name: memberData.full_name,
    photo_url: memberData.photo_url,
    photo_alt: memberData.photo_alt,
    phone: memberData.phone,
    email: memberData.email,
    gender: memberData.gender,
    date_of_birth: memberData.date_of_birth,
    status: memberData.status,
    tithe_status: memberData.tithe_status,
    join_date: memberData.join_date,
    last_attendance_date: memberData.last_attendance_date,
    attendance_rate: memberData.attendance_rate,
    total_giving: memberData.total_giving,
    address: memberData.address,
    marital_status: memberData.marital_status,
    occupation: memberData.occupation,
    emergency_contact: memberData.emergency_contact,
    baptised: memberData.baptised,
    primary_cell_group_id: memberData.primary_cell_group_id,
    primary_ministry_id: memberData.primary_ministry_id,
  };

  const { data, error } = await supabase
    .from('members')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error creating member:', error);
    throw error;
  }

  return transformMember(data);
}

// Update an existing member
export async function updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    member_code: memberData.member_code,
    full_name: memberData.full_name,
    photo_url: memberData.photo_url,
    photo_alt: memberData.photo_alt,
    phone: memberData.phone,
    email: memberData.email,
    gender: memberData.gender,
    date_of_birth: memberData.date_of_birth,
    status: memberData.status,
    tithe_status: memberData.tithe_status,
    join_date: memberData.join_date,
    last_attendance_date: memberData.last_attendance_date,
    attendance_rate: memberData.attendance_rate,
    total_giving: memberData.total_giving,
    address: memberData.address,
    marital_status: memberData.marital_status,
    occupation: memberData.occupation,
    emergency_contact: memberData.emergency_contact,
    baptised: memberData.baptised,
    primary_cell_group_id: memberData.primary_cell_group_id,
    primary_ministry_id: memberData.primary_ministry_id,
  };

  const { data, error } = await supabase
    .from('members')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating member:', error);
    throw error;
  }

  return transformMember(data);
}

// Delete a member
export async function deleteMember(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// Search members by name, phone, or member code
export async function searchMembers(query: string): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,member_code.ilike.%${query}%`)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error searching members:', error);
    throw error;
  }

  return data ? data.map(transformMember) : [];
}
