'use client';

import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Member } from './memberData';

interface MemberStatsProps {
  members: Member[];
}

export default function MemberStats({ members }: MemberStatsProps) {
  const stats = React.useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const inactive = members.filter(m => m.status === 'inactive').length;
    const newMembers = members.filter(m => m.status === 'new').length;
    const faithfulTithers = members.filter(m => m.titheStatus === 'tithe-faithful').length;
    const totalGiving = members.reduce((sum, m) => sum + (m.totalGiving || 0), 0);
    const avgAttendance = members.length > 0
      ? members.reduce((sum, m) => sum + (m.attendanceRate || 0), 0) / members.length
      : 0;

    return {
      total,
      active,
      inactive,
      newMembers,
      faithfulTithers,
      totalGiving,
      avgAttendance,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0',
      titherPercentage: total > 0 ? ((faithfulTithers / total) * 100).toFixed(1) : '0',
    };
  }, [members]);

  const statCards = [
    {
      label: 'Total Members',
      value: stats.total.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: `${stats.activePercentage}% active`,
    },
    {
      label: 'Active Members',
      value: stats.active.toLocaleString(),
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: `${stats.inactive} inactive`,
    },
    {
      label: 'New This Month',
      value: stats.newMembers.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'Recent additions',
    },
    {
      label: 'Faithful Tithers',
      value: stats.faithfulTithers.toLocaleString(),
      icon: DollarSign,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      subtitle: `${stats.titherPercentage}% of members`,
    },
    {
      label: 'Total Giving',
      value: `GH₵ ${stats.totalGiving.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      subtitle: 'All time',
    },
    {
      label: 'Avg Attendance',
      value: `${stats.avgAttendance.toFixed(1)}%`,
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      subtitle: 'Attendance rate',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-border shadow-card p-4 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon size={20} className={stat.textColor} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
