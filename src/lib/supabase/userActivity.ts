import { createClient } from './client';

export interface UserActivity {
  id: string;
  type: 'attendance' | 'giving' | 'ministry' | 'achievement';
  title: string;
  description: string;
  date: string;
  amount?: number;
  metadata?: Record<string, any>;
}

/**
 * Fetch user activity timeline combining attendance, giving, and ministry data
 */
export async function fetchUserActivity(userId: string, memberId?: string): Promise<UserActivity[]> {
  const supabase = createClient();
  const activities: UserActivity[] = [];

  try {
    // 1. Fetch attendance records for this user
    if (memberId) {
      try {
        // Get attendance sessions first
        const { data: sessions } = await supabase
          .from('attendance_sessions')
          .select('id, session_type, session_date')
          .order('session_date', { ascending: false })
          .limit(20);

        if (sessions && sessions.length > 0) {
          const sessionIds = sessions.map(s => s.id);
          
          // Get attendance records for these sessions
          const { data: attendanceRecords } = await supabase
            .from('attendance_records')
            .select('session_id, present, checked_in_at')
            .eq('member_id', memberId)
            .in('session_id', sessionIds);

          if (attendanceRecords) {
            const sessionMap = new Map(sessions.map(s => [s.id, s]));
            
            attendanceRecords
              .filter(r => r.present)
              .forEach(record => {
                const session = sessionMap.get(record.session_id);
                if (session) {
                  activities.push({
                    id: `attendance-${record.session_id}`,
                    type: 'attendance',
                    title: `Attended ${session.session_type}`,
                    description: 'Service attendance recorded',
                    date: session.session_date,
                    metadata: {
                      service: session.session_type,
                      checked_in_at: record.checked_in_at
                    }
                  });
                }
              });
          }
        }
      } catch (err) {
        console.warn('Could not fetch attendance activity:', err);
      }
    }

    // 2. Fetch giving transactions
    try {
      let query = supabase
        .from('giving_transactions')
        .select('id, date, category, amount, description, created_at')
        .eq('type', 'income')
        .order('date', { ascending: false })
        .limit(10);

      // If we have member_id, filter by it, otherwise skip
      if (memberId) {
        query = query.eq('member_id', memberId);
      }

      const { data: transactions } = await query;

      if (transactions) {
        transactions.forEach(t => {
          activities.push({
            id: `giving-${t.id}`,
            type: 'giving',
            title: `${t.category} Contribution`,
            description: t.description || t.category,
            date: t.date,
            amount: t.amount,
            metadata: {
              category: t.category
            }
          });
        });
      }
    } catch (err) {
      console.warn('Could not fetch giving activity:', err);
    }

    // 3. Fetch ministry involvement with join dates
    try {
      const { data: memberMinistries } = await supabase
        .from('member_ministries')
        .select('ministry_id, joined_at, ministries(name)')
        .eq('member_id', userId)
        .order('joined_at', { ascending: false });

      if (memberMinistries) {
        memberMinistries.forEach((mm: any) => {
          if (mm.joined_at && mm.ministries?.name) {
            activities.push({
              id: `ministry-${mm.ministry_id}`,
              type: 'ministry',
              title: `Joined ${mm.ministries.name}`,
              description: 'Ministry involvement started',
              date: mm.joined_at,
              metadata: {
                ministry_id: mm.ministry_id
              }
            });
          }
        });
      }
    } catch (err) {
      console.warn('Could not fetch ministry activity:', err);
    }

    // Sort by date descending and return top 10
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
}

/**
 * Fetch user achievements/badges
 */
export async function fetchUserAchievements(memberId?: string): Promise<UserActivity[]> {
  const achievements: UserActivity[] = [];
  
  if (!memberId) return achievements;

  try {
    const supabase = createClient();

    // Check for consistent attendance achievement (4+ weeks)
    const { data: attendanceCount } = await supabase
      .from('attendance_records')
      .select('id', { count: 'exact' })
      .eq('member_id', memberId)
      .eq('present', true);

    if (attendanceCount && attendanceCount.length >= 4) {
      achievements.push({
        id: 'achievement-faithful',
        type: 'achievement',
        title: 'Faithful Attendee',
        description: `Attended ${attendanceCount.length} services`,
        date: new Date().toISOString(),
      });
    }

    // Check for giving achievement
    const { data: givingTotal } = await supabase
      .from('giving_transactions')
      .select('amount')
      .eq('member_id', memberId)
      .eq('type', 'income');

    const totalGiving = givingTotal?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    
    if (totalGiving > 0) {
      achievements.push({
        id: 'achievement-giver',
        type: 'achievement',
        title: 'Generous Giver',
        description: `Contributed GH₵ ${totalGiving.toLocaleString()}`,
        date: new Date().toISOString(),
      });
    }

    return achievements;
  } catch (err) {
    console.warn('Could not fetch achievements:', err);
    return [];
  }
}
