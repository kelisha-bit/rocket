'use client';

import React from 'react';
import { Calendar, DollarSign, Users, FileText, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface QuickActionsProps {
  onSignOut?: () => void;
}

export default function QuickActions({ onSignOut }: QuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      label: 'View Attendance',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => router.push('/attendance'),
    },
    {
      label: 'Giving History',
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      onClick: () => router.push('/finance'),
    },
    {
      label: 'My Ministries',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => router.push('/ministries'),
    },
    {
      label: 'Reports',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => toast.info('Reports', { description: 'Reports feature coming soon' }),
    },
    {
      label: 'Settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      onClick: () => router.push('/settings'),
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: onSignOut || (() => router.push('/sign-up-login-screen')),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg ${action.bgColor} hover:opacity-80 transition-opacity`}
            >
              <Icon size={24} className={action.color} />
              <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
