'use client';

import React from 'react';
import { Member } from './memberData';
import StatusBadge from '@/components/ui/StatusBadge';
import AppImage from '@/components/ui/AppImage';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Edit2, MoreHorizontal, Camera } from 'lucide-react';

interface Props {
  members: Member[];
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  allSelected: boolean;
  sortField: keyof Member;
  sortDir: 'asc' | 'desc';
  toggleSort: (field: keyof Member) => void;
  onViewDetail: (m: Member) => void;
  onEditMember: (m: Member) => void;
  onMoreActions: (m: Member) => void;
  onExport: (format: 'pdf' | 'excel') => void;
}

function SortIcon({ field, sortField, sortDir }: { field: keyof Member; sortField: keyof Member; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ArrowUpDown size={12} className="text-muted-foreground/40" />;
  return sortDir === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />;
}

const columns: { key: keyof Member; label: string; sortable: boolean; className?: string }[] = [
  { key: 'name', label: 'Member', sortable: true },
  { key: 'memberId', label: 'ID', sortable: true, className: 'hidden md:table-cell' },
  { key: 'phone', label: 'Phone', sortable: false, className: 'hidden lg:table-cell' },
  { key: 'cellGroup', label: 'Cell Group', sortable: true, className: 'hidden xl:table-cell' },
  { key: 'ministry', label: 'Ministry', sortable: true, className: 'hidden xl:table-cell' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'titheStatus', label: 'Tithe', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'attendanceRate', label: 'Attendance', sortable: true, className: 'hidden lg:table-cell' },
  { key: 'totalGiving', label: 'Total Giving', sortable: true, className: 'hidden xl:table-cell' },
  { key: 'joinDate', label: 'Joined', sortable: true, className: 'hidden 2xl:table-cell' },
];

export default function MemberTable({ members, selectedIds, toggleSelect, toggleSelectAll, allSelected, sortField, sortDir, toggleSort, onViewDetail, onEditMember, onMoreActions }: Props) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">No members match your filters</h3>
        <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria to find the members you are looking for.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b border-border">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                aria-label="Select all members"
              />
            </th>
            {columns.map(col => (
              <th
                key={`col-${col.key}`}
                className={`text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap ${col.className ?? ''} ${col.sortable ? 'cursor-pointer hover:text-foreground transition-colors select-none' : ''}`}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                </div>
              </th>
            ))}
            <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {members.map((member, idx) => (
            <tr
              key={member.id}
              className={`hover:bg-muted/40 transition-colors group ${idx % 2 === 0 ? '' : 'bg-muted/10'} ${selectedIds.has(member.id) ? 'bg-primary/5' : ''}`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(member.id)}
                  onChange={() => toggleSelect(member.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  aria-label={`Select ${member.name}`}
                />
              </td>

              {/* Name + photo */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <AppImage
                      src={member.photo}
                      alt={member.photoAlt}
                      width={36}
                      height={36}
                      className="rounded-full object-cover w-9 h-9 shrink-0 ring-2 ring-border cursor-pointer"
                      onClick={() => onMoreActions(member)}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => onViewDetail(member)}
                      className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors truncate block max-w-[160px]"
                    >
                      {member.name}
                    </button>
                    <p className="text-[11px] text-muted-foreground">{member.gender} · {member.age} yrs</p>
                  </div>
                </div>
              </td>

              {/* ID */}
              <td className="px-3 py-3 hidden md:table-cell">
                <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {member.memberId}
                </span>
              </td>

              {/* Phone */}
              <td className="px-3 py-3 hidden lg:table-cell">
                <span className="text-[12px] text-muted-foreground font-mono">{member.phone}</span>
              </td>

              {/* Cell group */}
              <td className="px-3 py-3 hidden xl:table-cell">
                <span className="text-[12px] text-foreground truncate block max-w-[160px]">{member.cellGroup}</span>
              </td>

              {/* Ministry */}
              <td className="px-3 py-3 hidden xl:table-cell">
                <span
                  className="text-[12px] text-muted-foreground truncate block max-w-[140px]"
                  title={(member.ministries ?? [member.ministry]).filter(n => n !== '—').join(', ') || '—'}
                >
                  {(member.ministries ?? [member.ministry]).filter(n => n !== '—').join(', ') || '—'}
                </span>
              </td>

              {/* Status */}
              <td className="px-3 py-3">
                <StatusBadge status={member.status} />
              </td>

              {/* Tithe */}
              <td className="px-3 py-3 hidden lg:table-cell">
                <StatusBadge status={member.titheStatus} />
              </td>

              {/* Attendance rate */}
              <td className="px-3 py-3 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${member.attendanceRate >= 80 ? 'bg-emerald-500' : member.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${member.attendanceRate}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-mono font-semibold tabular-nums ${member.attendanceRate >= 80 ? 'text-emerald-700' : member.attendanceRate >= 50 ? 'text-amber-700' : 'text-red-600'}`}>
                    {member.attendanceRate}%
                  </span>
                </div>
              </td>

              {/* Total giving */}
              <td className="px-3 py-3 hidden xl:table-cell">
                <span className="text-[12px] font-mono font-semibold tabular-nums">
                  ₵{member.totalGiving.toLocaleString()}
                </span>
              </td>

              {/* Join date */}
              <td className="px-3 py-3 hidden 2xl:table-cell">
                <span className="text-[12px] text-muted-foreground">{member.joinDate}</span>
              </td>

              {/* Actions */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onViewDetail(member)}
                    title="View member profile"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => onEditMember(member)}
                    title="Edit member details"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 hover:text-amber-600 text-muted-foreground transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onMoreActions(member)}
                    title="More actions"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}