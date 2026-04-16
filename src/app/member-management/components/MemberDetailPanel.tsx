'use client';

import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Users, HandCoins, BookOpen, Calendar, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { Member } from './memberData';
import StatusBadge from '@/components/ui/StatusBadge';
import AppImage from '@/components/ui/AppImage';
import MemberPhotoModal from './MemberPhotoModal';
import { toast } from 'sonner';

interface Props {
  member: Member;
  onClose: () => void;
  onPhotoUpdate?: (memberId: string, photoUrl: string, photoAlt: string) => void;
}

const tabs = ['Overview', 'Attendance', 'Giving'] as const;
type Tab = typeof tabs[number];

export default function MemberDetailPanel({ member, onClose, onPhotoUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-modal z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">Member Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close member panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile hero */}
        <div className="px-5 py-4 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <AppImage
                src={member.photo}
                alt={member.photoAlt}
                width={64}
                height={64}
                className="rounded-2xl object-cover w-16 h-16 ring-2 ring-border"
              />
              {onPhotoUpdate && (
                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  title="Update photo"
                >
                  <Camera size={12} className="text-white" />
                </button>
              )}
              {member.baptised && (
                <span
                  className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold"
                  title="Baptised member"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-foreground leading-tight">{member.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{member.memberId}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={member.status} />
                <StatusBadge status={member.titheStatus} />
                {member.baptised && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
                    Baptised
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Attendance', value: `${member.attendanceRate}%`, color: member.attendanceRate >= 80 ? 'text-emerald-700' : member.attendanceRate >= 50 ? 'text-amber-700' : 'text-red-600' },
              { label: 'Total Giving', value: `₵${member.totalGiving.toLocaleString()}`, color: 'text-amber-700' },
              { label: 'Member Since', value: member.joinDate.split('/')[2], color: 'text-primary' },
            ].map(stat => (
              <div key={`stat-panel-${stat.label}`} className="bg-white rounded-xl p-3 border border-border text-center">
                <p className="text-base font-bold tabular-nums" style={{ color: 'inherit' }}>
                  <span className={stat.color}>{stat.value}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 px-5">
          {tabs.map(tab => (
            <button
              key={`detail-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              {/* Contact */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Contact Details</p>
                <div className="space-y-2">
                  {[
                    { icon: <Phone size={14} />, label: 'Phone', value: member.phone },
                    { icon: <Mail size={14} />, label: 'Email', value: member.email },
                    { icon: <MapPin size={14} />, label: 'Address', value: member.address },
                  ].map(item => (
                    <div key={`contact-${item.label}`} className="flex items-start gap-3">
                      <span className="text-muted-foreground mt-0.5 shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-[13px] text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Personal */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Personal Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Date of Birth', value: member.dob },
                    { label: 'Age', value: `${member.age} years` },
                    { label: 'Gender', value: member.gender },
                    { label: 'Marital Status', value: member.maritalStatus },
                    { label: 'Occupation', value: member.occupation },
                    { label: 'Emergency Contact', value: member.emergencyContact },
                  ].map(item => (
                    <div key={`personal-${item.label}`} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
                      <p className="text-[12px] font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Church info */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Church Involvement</p>
                <div className="space-y-2">
                  {[
                    { icon: <Users size={14} />, label: 'Cell Group', value: member.cellGroup },
                    { icon: <BookOpen size={14} />, label: 'Ministry', value: member.ministry },
                    { icon: <Calendar size={14} />, label: 'Last Attendance', value: member.lastAttendance },
                    { icon: <HandCoins size={14} />, label: 'Tithe Status', value: member.titheStatus.replace('tithe-', '').replace('-', ' ') },
                  ].map(item => (
                    <div key={`church-${item.label}`} className="flex items-start gap-3">
                      <span className="text-muted-foreground mt-0.5 shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-[13px] text-foreground capitalize">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Recent Sundays</p>
                <span className={`text-sm font-bold tabular-nums ${member.attendanceRate >= 80 ? 'text-emerald-600' : member.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {member.attendanceRate}% rate
                </span>
              </div>

              {/* Attendance dots */}
              <div className="flex gap-2 flex-wrap">
                {member.attendanceHistory.map((rec, i) => (
                  <div key={`att-${member.id}-${rec.week}-${i}`} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.present ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                      {rec.present
                        ? <CheckCircle2 size={18} className="text-emerald-600" />
                        : <XCircle size={18} className="text-red-400" />
                      }
                    </div>
                    <p className="text-[10px] text-muted-foreground">{rec.week}</p>
                  </div>
                ))}
              </div>

              <div className="bg-muted/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Attendance Summary</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Sundays Present', value: `${member.attendanceHistory.filter(r => r.present).length} of ${member.attendanceHistory.length}` },
                    { label: 'Last Attended', value: member.lastAttendance },
                    { label: 'Overall Rate', value: `${member.attendanceRate}%` },
                    { label: 'Cell Group', value: member.cellGroup },
                  ].map(item => (
                    <div key={`att-summary-${item.label}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground text-[12px]">{item.label}</span>
                      <span className="font-medium text-[12px]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Giving' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Giving History</p>
                <span className="text-sm font-bold text-amber-700 tabular-nums">
                  ₵{member.totalGiving.toLocaleString()} total
                </span>
              </div>

              <div className="space-y-2">
                {member.recentGiving.map((g, i) => (
                  <div key={`giving-${member.id}-${g.date}-${i}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        g.type === 'Tithe' ? 'bg-amber-50' : g.type === 'Offering' ? 'bg-blue-50' : 'bg-purple-50'
                      }`}>
                        {g.type === 'Tithe' ? '🙏' : g.type === 'Offering' ? '🎁' : '🤝'}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{g.type}</p>
                        <p className="text-[11px] text-muted-foreground">{g.date}</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-[13px] text-foreground">
                      ₵{g.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <HandCoins size={16} className="text-amber-600" />
                  <p className="text-sm font-semibold text-amber-800">Tithe Status</p>
                </div>
                <p className="text-xs text-amber-700 capitalize">
                  {member.titheStatus === 'tithe-faithful' ?'This member is a consistent tither — giving recorded monthly.'
                    : member.titheStatus === 'tithe-irregular' ?'Tithe giving has been irregular — pastoral follow-up recommended.' :'No tithe records found for this member. Consider a pastoral conversation.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border px-5 py-4 flex items-center gap-3 shrink-0 bg-white">
          <button
            onClick={() => toast.info('Edit profile', { description: 'Member editing is available from the Member Management table.' })}
            className="flex-1 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-[#163f6f] active:scale-[0.99] transition-all"
          >
            Edit Profile
          </button>
          <button
            onClick={() => toast.success('Message queued', { description: `A message will be sent to ${member.name}.` })}
            className="flex-1 bg-white border border-border text-sm font-medium rounded-lg py-2.5 hover:bg-muted transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Photo Modal */}
      {photoModalOpen && onPhotoUpdate && (
        <MemberPhotoModal
          member={member}
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          onPhotoUpdate={onPhotoUpdate}
        />
      )}
    </>
  );
}