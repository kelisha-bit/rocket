'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Users, Award, Loader2 } from 'lucide-react';
import { fetchUserActivity, fetchUserAchievements, UserActivity } from '@/lib/supabase/userActivity';

interface Activity {
  id: string;
  type: 'attendance' | 'giving' | 'ministry' | 'achievement';
  title: string;
  description: string;
  date: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface ActivityTimelineProps {
  userId?: string;
  memberId?: string;
}

export default function ActivityTimeline({ userId, memberId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadActivities = async () => {
      try {
        setLoading(true);
        const [userActivities, achievements] = await Promise.all([
          fetchUserActivity(userId, memberId),
          fetchUserAchievements(memberId)
        ]);

        // Combine and format activities
        const allActivities: Activity[] = [
          ...userActivities.map(ua => ({
            id: ua.id,
            type: ua.type,
            title: ua.title,
            description: ua.amount 
              ? `${ua.description} - GH₵ ${ua.amount.toLocaleString()}`
              : ua.description,
            date: ua.date,
          })),
          ...achievements.map(a => ({
            id: a.id,
            type: a.type as 'achievement',
            title: a.title,
            description: a.description,
            date: a.date,
          }))
        ];

        // Sort by date descending
        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setActivities(allActivities.slice(0, 10));
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId, memberId]);

  // Default fallback activities if no data
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'attendance',
      title: 'Welcome to Greater Works',
      description: 'Your activity will appear here as you participate',
      date: new Date().toISOString().split('T')[0],
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'attendance':
        return Calendar;
      case 'giving':
        return DollarSign;
      case 'ministry':
        return Users;
      case 'achievement':
        return Award;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'attendance':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'giving':
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'ministry':
        return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
      case 'achievement':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
      <div className="space-y-4">
        {displayActivities.map((activity, index) => {
          const Icon = activity.icon || getActivityIcon(activity.type);
          const colors = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={colors.text} />
                </div>
                {index < displayActivities.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                )}
              </div>

              {/* Activity content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
        View All Activity
      </button>
    </div>
  );
}
