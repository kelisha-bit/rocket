'use client';

import React from 'react';
import { Member } from './memberData';
import AppImage from '@/components/ui/AppImage';
import { Phone, Mail, MapPin, Calendar, TrendingUp, DollarSign, MoreVertical, Camera } from 'lucide-react';

interface MemberCardViewProps {
  members: Member[];
  onViewDetail: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onMoreActions: (member: Member) => void;
}

export default function MemberCardView({
  members,
  onViewDetail,
  onEditMember,
  onMoreActions,
}: MemberCardViewProps) {
  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'transferred': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTitheStatusIcon = (status: Member['titheStatus']) => {
    switch (status) {
      case 'tithe-faithful': return '✓';
      case 'tithe-irregular': return '~';
      case 'tithe-none': return '✗';
      default: return '—';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {members.map(member => (
        <div
          key={member.id}
          className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden group"
        >
          {/* Card Header */}
          <div className="relative h-24 bg-gradient-to-br from-primary to-primary/70">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => onMoreActions(member)}
                className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <MoreVertical size={16} className="text-white" />
              </button>
            </div>
            <div className="absolute -bottom-10 left-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-muted">
                  <AppImage
                    src={member.photo}
                    alt={member.photoAlt}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Photo update overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreActions(member);
                  }}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Update photo"
                >
                  <Camera size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="pt-12 px-4 pb-4">
            {/* Name and Status */}
            <div className="mb-3">
              <h3 className="text-base font-semibold text-foreground mb-1 truncate">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(member.status)}`}>
                  {member.status.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {member.memberId}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} className="shrink-0" />
                <span className="truncate">{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{member.cellGroup}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={12} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground">{member.attendanceRate}%</p>
                </div>
                <p className="text-[10px] text-muted-foreground">Attendance</p>
              </div>
              <div className="text-center border-x border-border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign size={12} className="text-amber-600" />
                  <p className="text-xs font-semibold text-foreground">
                    {member.totalGiving > 1000 ? `${(member.totalGiving / 1000).toFixed(1)}k` : member.totalGiving}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">Giving</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-xs font-semibold text-foreground">
                    {getTitheStatusIcon(member.titheStatus)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Tithe</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewDetail(member)}
                className="flex-1 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onEditMember(member)}
                className="flex-1 px-3 py-2 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No members found</p>
        </div>
      )}
    </div>
  );
}
