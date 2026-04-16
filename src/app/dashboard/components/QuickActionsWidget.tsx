'use client';

import React from 'react';
import { 
  UserPlus, 
  CalendarPlus, 
  MessageSquare, 
  FileText, 
  Bell,
  Phone,
  Mail,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const quickActions = [
  {
    id: 'add-member',
    label: 'Add Member',
    icon: <UserPlus size={16} />,
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    href: '/member-management?action=add'
  },
  {
    id: 'create-event',
    label: 'Create Event',
    icon: <CalendarPlus size={16} />,
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    href: '/events?action=create'
  },
  {
    id: 'send-announcement',
    label: 'Send Announcement',
    icon: <MessageSquare size={16} />,
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    action: () => toast.info('Announcement feature', { description: 'Opening message composer...' })
  },
  {
    id: 'generate-report',
    label: 'Generate Report',
    icon: <FileText size={16} />,
    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    action: () => toast.info('Report generator', { description: 'Opening report builder...' })
  },
  {
    id: 'send-notification',
    label: 'Send Notification',
    icon: <Bell size={16} />,
    color: 'bg-red-50 text-red-600 hover:bg-red-100',
    action: () => toast.info('Notification center', { description: 'Opening notification panel...' })
  },
  {
    id: 'bulk-sms',
    label: 'Bulk SMS',
    icon: <Phone size={16} />,
    color: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    action: () => toast.info('SMS service', { description: 'Opening SMS composer...' })
  },
  {
    id: 'email-campaign',
    label: 'Email Campaign',
    icon: <Mail size={16} />,
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    action: () => toast.info('Email campaign', { description: 'Opening email builder...' })
  },
  {
    id: 'system-settings',
    label: 'Settings',
    icon: <Settings size={16} />,
    color: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    href: '/settings'
  }
];

export default function QuickActionsWidget() {
  const router = useRouter();

  const handleAction = (action: any) => {
    if (action.href) {
      router.push(action.href);
    } else if (action.action) {
      action.action();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Common tasks and shortcuts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${action.color} group`}
          >
            <div className="flex items-center justify-center">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}