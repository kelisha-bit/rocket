'use client';

import React from 'react';
import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';

interface ProfileStatsProps {
  memberSince: string;
  attendanceRate?: number;
  totalGiving?: number;
  ministriesCount?: number;
}

export default function ProfileStats({
  memberSince,
  attendanceRate = 0,
  totalGiving = 0,
  ministriesCount = 0,
}: ProfileStatsProps) {
  const yearsSince = new Date().getFullYear() - new Date(memberSince).getFullYear();

  const stats = [
    {
      label: 'Years Active',
      value: yearsSince.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: 'Member since ' + new Date(memberSince).getFullYear(),
    },
    {
      label: 'Attendance',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: 'Average rate',
    },
    {
      label: 'Total Giving',
      value: `GH₵ ${totalGiving.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      subtitle: 'All time',
    },
    {
      label: 'Ministries',
      value: ministriesCount.toString(),
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'Active involvement',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
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
