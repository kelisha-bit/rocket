import { createClient } from './client';
import { Ministry, fetchMinistries } from './ministries';
import { fetchMembers, Member } from './members';

export interface MinistryWithLeader extends Ministry {
  leader?: Member;
}

/**
 * Fetch a specific ministry by name and include leader details
 */
export async function fetchMinistryByName(ministryName: string): Promise<MinistryWithLeader | null> {
  const supabase = createClient();
  
  try {
    // Fetch ministry with leader join
    const { data, error } = await supabase
      .from('ministries')
      .select(`
        *,
        head:head_member_id(*)
      `)
      .ilike('name', ministryName)
      .single();

    if (error) {
      console.error('Error fetching ministry:', error);
      return null;
    }

    if (!data) return null;

    // Count members in this ministry
    const { data: memberCount } = await supabase
      .from('member_ministries')
      .select('member_id', { count: 'exact', head: true })
      .eq('ministry_id', data.id);

    return {
      id: data.id,
      name: data.name,
      head_member_id: data.head_member_id,
      leader_name: data.head?.full_name,
      meeting_day: data.meeting_day || 'Sunday',
      meeting_time: data.meeting_time || '9:00 AM',
      status: data.status || 'Active',
      member_count: memberCount?.length || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      leader: data.head || undefined,
    };
  } catch (err) {
    console.error('Error in fetchMinistryByName:', err);
    return null;
  }
}

/**
 * Fetch members who belong to a specific ministry
 */
export async function fetchMinistryMembers(ministryId: string): Promise<Member[]> {
  const supabase = createClient();
  
  try {
    // Get member IDs from junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('member_ministries')
      .select('member_id')
      .eq('ministry_id', ministryId);

    if (junctionError || !junctionData || junctionData.length === 0) {
      return [];
    }

    const memberIds = junctionData.map(row => row.member_id).filter(Boolean);
    if (memberIds.length === 0) return [];

    // Fetch full member details
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .in('id', memberIds)
      .order('full_name', { ascending: true });

    if (membersError || !members) {
      return [];
    }

    return members;
  } catch (err) {
    console.error('Error fetching ministry members:', err);
    return [];
  }
}

/**
 * Get ministry statistics
 */
export async function getMinistryStats(ministryId: string) {
  const supabase = createClient();
  
  try {
    // Get total members
    const { data: allMembers } = await supabase
      .from('member_ministries')
      .select('member_id')
      .eq('ministry_id', ministryId);

    const totalMembers = allMembers?.length || 0;

    // Get active members (need to join with members table)
    const { data: activeData } = await supabase
      .from('member_ministries')
      .select('member_id, members!inner(status)')
      .eq('ministry_id', ministryId)
      .eq('members.status', 'Active');

    const activeMembers = activeData?.length || 0;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
    };
  } catch (err) {
    console.error('Error fetching ministry stats:', err);
    return {
      totalMembers: 0,
      activeMembers: 0,
      inactiveMembers: 0,
    };
  }
}
