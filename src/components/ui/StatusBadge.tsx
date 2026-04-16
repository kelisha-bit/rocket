import React from 'react';

type StatusType =
  | 'active' | 'inactive' | 'new' | 'transferred' | 'deceased' |'tithe-faithful'| 'tithe-irregular' | 'tithe-none' |'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  | 'present' | 'absent';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  new: { label: 'New Member', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  transferred: { label: 'Transferred', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  deceased: { label: 'Deceased', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  'tithe-faithful': { label: 'Faithful', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'tithe-irregular': { label: 'Irregular', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  'tithe-none': { label: 'Non-tither', className: 'bg-red-50 text-red-600 border-red-200' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ongoing: { label: 'Ongoing', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600 border-red-200' },
  present: { label: 'Present', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent: { label: 'Absent', className: 'bg-red-50 text-red-600 border-red-200' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}