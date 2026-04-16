'use client';

import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import Link from 'next/link';
import {
  Users, BookOpen, HandCoins, Gift, Home,
  Cake, CalendarDays, UserPlus, Target, TrendingUp,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function DashboardBentoGrid() {
  const { data, stats, loading } = useDashboard();

  const fmt = (n: number) => n.toLocaleString();
  const fmtCurrency = (n: number) =>
    n >= 1000 ? `₵${(n / 1000).toFixed(1)}k` : `₵${n.toLocaleString()}`;

  const attendanceSubValue = stats.totalActiveMembers > 0
    ? `${fmt(stats.lastSundayAttendance)} of ${fmt(stats.totalActiveMembers)} members`
    : 'No attendance data yet';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
      {/* Hero: Total Active Members */}
      <div className="sm:col-span-2 lg:col-span-2">
        <Link href="/member-management" className="block">
          <MetricCard
            label="Total Active Members"
            value={loading ? '—' : fmt(stats.totalActiveMembers)}
            subValue={loading ? 'Loading...' : `${fmt(stats.totalMembers)} total registered`}
            icon={<Users size={22} className="text-primary" />}
            iconBg="bg-primary/10"
            hero
          />
        </Link>
      </div>

      {/* Sunday Attendance Rate */}
      <Link href="/attendance" className="block">
        <MetricCard
          label="Sunday Attendance"
          value={loading ? '—' : `${stats.lastSundayAttendanceRate}%`}
          subValue={loading ? 'Loading...' : attendanceSubValue}
          icon={<BookOpen size={20} className="text-orange-600" />}
          iconBg="bg-orange-50"
          warning={stats.lastSundayAttendanceRate < 70}
        />
      </Link>

      {/* Monthly Tithes */}
      <Link href="/finance" className="block">
        <MetricCard
          label="Tithes This Month"
          value={loading ? '—' : fmtCurrency(stats.tithesThisMonth)}
          subValue="Income category: Tithe"
          icon={<HandCoins size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </Link>

      {/* Offerings */}
      <Link href="/finance" className="block">
        <MetricCard
          label="Offerings This Month"
          value={loading ? '—' : fmtCurrency(stats.offeringsThisMonth)}
          subValue="Sunday + midweek combined"
          icon={<Gift size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </Link>

      {/* Cell Group Participation */}
      <Link href="/cell-groups" className="block">
        <MetricCard
          label="Cell Group Participation"
          value={loading ? '—' : `${stats.cellGroupParticipation}%`}
          subValue={loading ? 'Loading...' : `${fmt(stats.totalMembers)} total members`}
          icon={<Home size={20} className="text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </Link>

      {/* Upcoming Birthdays */}
      <MetricCard
        label="Birthdays This Week"
        value={loading ? '—' : fmt(stats.birthdaysThisWeek.length)}
        subValue={loading ? 'Loading...' : `Next 7 days`}
        icon={<Cake size={20} className="text-pink-600" />}
        iconBg="bg-pink-50"
      />

      {/* Events */}
      <Link href="/events" className="block">
        <MetricCard
          label="Upcoming Events"
          value={loading ? '—' : fmt(stats.upcomingEventsCount)}
          subValue="Scheduled ahead"
          icon={<CalendarDays size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </Link>

      {/* New Members */}
      <Link href="/member-management" className="block">
        <MetricCard
          label="New Members"
          value={loading ? '—' : fmt(stats.newMembersThisMonth)}
          subValue="Registered this month"
          icon={<UserPlus size={20} className="text-teal-600" />}
          iconBg="bg-teal-50"
        />
      </Link>

      {/* Faithful Tithers */}
      <MetricCard
        label="Faithful Tithers"
        value={loading ? '—' : fmt(stats.faithfulTithers)}
        subValue={loading ? 'Loading...' : `of ${fmt(stats.totalMembers)} members`}
        icon={<Target size={20} className="text-indigo-600" />}
        iconBg="bg-indigo-50"
      />

      {/* Total Giving This Month */}
      <Link href="/finance" className="block">
        <MetricCard
          label="Total Giving"
          value={loading ? '—' : fmtCurrency(stats.totalGivingThisMonth)}
          subValue="All income this month"
          icon={<TrendingUp size={20} className="text-green-600" />}
          iconBg="bg-green-50"
        />
      </Link>
    </div>
  );
}
