'use client';

import React, { useState } from 'react';
import { Cake, Phone, MessageSquare, Gift, Loader2 } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';
import type { Member } from '@/app/member-management/components/memberData';

function getDaysUntilBirthday(dob: string): number {
  if (!dob) return 999;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let month: number, day: number;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const parts = dob.split('-');
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      const parts = dob.split('/');
      if (parts.length !== 3) return 999;
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
    }

    let bday = new Date(today.getFullYear(), month, day);
    if (bday < today) bday = new Date(today.getFullYear() + 1, month, day);
    return Math.round((bday.getTime() - today.getTime()) / 86400000);
  } catch {
    return 999;
  }
}

function formatBirthdayDate(dob: string, daysLeft: number): string {
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  try {
    let month: number, day: number;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const parts = dob.split('-');
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      const parts = dob.split('/');
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
    }
    const d = new Date(new Date().getFullYear(), month, day);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return '—';
  }
}

export default function BirthdayWidget() {
  const { stats, loading } = useDashboard();

  const birthdayMembers = stats.birthdaysThisWeek
    .map(m => ({ ...m, daysLeft: getDaysUntilBirthday(m.dob) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const todaysBirthdays = birthdayMembers.filter(b => b.daysLeft === 0);
  const upcomingBirthdays = birthdayMembers.filter(b => b.daysLeft > 0);

  const handleCall = (member: Member) =>
    toast.success('Calling member', { description: `Calling ${member.name}...` });
  const handleSMS = (member: Member) =>
    toast.info('SMS sent', { description: `Birthday message sent to ${member.name}` });
  const handleGift = (member: Member) =>
    toast.info('Gift reminder', { description: `Gift reminder set for ${member.name}` });

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
            <Cake size={16} className="text-pink-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Upcoming Birthdays</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : `Next 7 days · ${todaysBirthdays.length} today`}
            </p>
          </div>
        </div>
        {!loading && (
          <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 rounded-lg px-2 py-0.5 font-medium">
            {birthdayMembers.length} members
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading birthdays...</span>
        </div>
      ) : birthdayMembers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <div>
            <Cake size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No birthdays this week</p>
          </div>
        </div>
      ) : (
        <>
          {todaysBirthdays.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-pink-600 mb-2 uppercase tracking-wide">Today 🎉</h4>
              <div className="space-y-1">
                {todaysBirthdays.map(m => (
                  <BirthdayCard key={m.id} member={m} daysLeft={0} isToday onCall={handleCall} onSMS={handleSMS} onGift={handleGift} />
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 -mr-1 pr-1">
            {upcomingBirthdays.length > 0 && (
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide sticky top-0 bg-white">
                This Week
              </h4>
            )}
            {upcomingBirthdays.map(m => (
              <BirthdayCard key={m.id} member={m} daysLeft={m.daysLeft} isToday={false} onCall={handleCall} onSMS={handleSMS} onGift={handleGift} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BirthdayCard({
  member, daysLeft, isToday, onCall, onSMS, onGift,
}: {
  member: Member;
  daysLeft: number;
  isToday: boolean;
  onCall: (m: Member) => void;
  onSMS: (m: Member) => void;
  onGift: (m: Member) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const dateLabel = formatBirthdayDate(member.dob, daysLeft);

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer group relative ${
        isToday ? 'bg-pink-50/80 border border-pink-200' : 'hover:bg-muted/50'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative shrink-0">
        <AppImage
          src={member.photo}
          alt={`${member.name} profile`}
          width={36}
          height={36}
          className="rounded-full object-cover w-9 h-9"
        />
        {isToday && <span className="absolute -top-1 -right-1 text-base">🎂</span>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
          {isToday && member.age > 0 && (
            <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-medium">
              {member.age}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{member.cellGroup}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-xs font-semibold ${isToday ? 'text-pink-600' : 'text-muted-foreground'}`}>
          {dateLabel}
        </p>
        {showActions && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={e => { e.stopPropagation(); onCall(member); }} className="p-1 hover:bg-white/80 rounded" title="Call">
              <Phone size={10} className="text-green-600" />
            </button>
            <button onClick={e => { e.stopPropagation(); onSMS(member); }} className="p-1 hover:bg-white/80 rounded" title="SMS">
              <MessageSquare size={10} className="text-blue-600" />
            </button>
            <button onClick={e => { e.stopPropagation(); onGift(member); }} className="p-1 hover:bg-white/80 rounded" title="Gift">
              <Gift size={10} className="text-purple-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
