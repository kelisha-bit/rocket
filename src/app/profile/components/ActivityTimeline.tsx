'use client';

import React from 'react';
import { Calendar, DollarSign, Users, Award } from 'lucide-react';

interface Activity {
  id: string;
  type: 'attendance' | 'giving' | 'ministry' | 'achievement';
  title: string;
  description: string;
  date: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface ActivityTimelineProps {
  activities?: Activity[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  // Mock activities if none provided
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'attendance',
      title: 'Attended Sunday Service',
      description: 'Main sanctuary worship service',
      date: '2026-04-13',
    },
    {
      id: '2',
      type: 'giving',
      title: 'Tithe Contribution',
      description: 'Monthly tithe - GH₵ 850',
      date: '2026-04-13',
    },
    {
      id: '3',
      type: 'ministry',
      title: 'Worship Team Practice',
      description: 'Weekly rehearsal session',
      date: '2026-04-10',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Completed Bible Study',
      description: 'Book of Romans study series',
      date: '2026-04-05',
    },
    {
      id: '5',
      type: 'attendance',
      title: 'Cell Group Meeting',
      description: 'Bethel Cell - Dansoman',
      date: '2026-04-03',
    },
  ];

  const displayActivities = activities || defaultActivities;

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
      <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
        View All Activity
      </button>
    </div>
  );
}
