'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchFrontendMembers } from '@/lib/member-adapter';
import { fetchFrontendTransactions } from '@/lib/transaction-adapter';
import { fetchFrontendAttendanceRecords } from '@/lib/attendance-adapter';
import { getFrontendUpcomingEvents } from '@/lib/event-adapter';
import { fetchFrontendMinistries } from '@/lib/ministry-adapter';
import type { Member } from '@/app/member-management/components/memberData';
import type { FrontendTransaction } from '@/lib/transaction-adapter';
import type { FrontendAttendanceRecord } from '@/lib/attendance-adapter';
import type { FrontendChurchEvent } from '@/lib/event-adapter';
import type { Ministry } from '@/lib/ministry-adapter';

export interface DashboardData {
  members: Member[];
  transactions: FrontendTransaction[];
  attendance: FrontendAttendanceRecord[];
  upcomingEvents: FrontendChurchEvent[];
  ministries: Ministry[];
}

export interface DashboardStats {
  totalActiveMembers: number;
  totalMembers: number;
  newMembersThisMonth: number;
  lastSundayAttendance: number;
  lastSundayAttendanceRate: number;
  tithesThisMonth: number;
  offeringsThisMonth: number;
  totalGivingThisMonth: number;
  upcomingEventsCount: number;
  birthdaysThisWeek: Member[];
  faithfulTithers: number;
  cellGroupParticipation: number;
}

function getMonthRange(monthsAgo = 0): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - monthsAgo;
  const d = new Date(year, month, 1);
  const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
  return { start, end };
}

function isBirthdayThisWeek(dob: string): boolean {
  if (!dob) return false;
  try {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    // Parse DD/MM/YYYY or YYYY-MM-DD
    let month: number, day: number;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const parts = dob.split('-');
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      const parts = dob.split('/');
      if (parts.length !== 3) return false;
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
    }

    // Check this year and next year (for year boundary)
    for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
      const bday = new Date(year, month, day);
      if (bday >= today && bday <= weekEnd) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function computeStats(data: DashboardData): DashboardStats {
  const { members, transactions, attendance, upcomingEvents } = data;
  const thisMonth = getMonthRange(0);

  const activeMembers = members.filter(m => m.status === 'active');
  const newThisMonth = members.filter(m => {
    if (!m.joinDate) return false;
    try {
      let iso: string;
      if (/^\d{4}-\d{2}-\d{2}$/.test(m.joinDate)) {
        iso = m.joinDate;
      } else {
        const parts = m.joinDate.split('/');
        if (parts.length !== 3) return false;
        iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return iso >= thisMonth.start && iso <= thisMonth.end;
    } catch { return false; }
  });

  // Attendance: last Sunday Service record
  const sundayRecords = attendance
    .filter(r => r.service === 'Sunday Service')
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastSunday = sundayRecords[0];
  const lastSundayTotal = lastSunday?.total ?? 0;
  const lastSundayRate = activeMembers.length > 0
    ? Math.round((lastSundayTotal / activeMembers.length) * 100)
    : 0;

  // Giving this month
  const monthlyTx = transactions.filter(
    t => t.type === 'income' && t.date >= thisMonth.start && t.date <= thisMonth.end
  );
  const tithesThisMonth = monthlyTx
    .filter(t => t.category === 'Tithe')
    .reduce((s, t) => s + t.amount, 0);
  const offeringsThisMonth = monthlyTx
    .filter(t => t.category === 'Offering')
    .reduce((s, t) => s + t.amount, 0);
  const totalGivingThisMonth = monthlyTx.reduce((s, t) => s + t.amount, 0);

  // Birthdays this week
  const birthdaysThisWeek = members.filter(m => isBirthdayThisWeek(m.dob));

  // Faithful tithers
  const faithfulTithers = members.filter(m => m.titheStatus === 'tithe-faithful').length;

  // Cell group participation (members with a cell group assigned)
  const withCellGroup = members.filter(m => m.cellGroup && m.cellGroup !== '—').length;
  const cellGroupParticipation = members.length > 0
    ? Math.round((withCellGroup / members.length) * 100)
    : 0;

  return {
    totalActiveMembers: activeMembers.length,
    totalMembers: members.length,
    newMembersThisMonth: newThisMonth.length,
    lastSundayAttendance: lastSundayTotal,
    lastSundayAttendanceRate: lastSundayRate,
    tithesThisMonth,
    offeringsThisMonth,
    totalGivingThisMonth,
    upcomingEventsCount: upcomingEvents.length,
    birthdaysThisWeek,
    faithfulTithers,
    cellGroupParticipation,
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    members: [],
    transactions: [],
    attendance: [],
    upcomingEvents: [],
    ministries: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [members, transactions, attendance, upcomingEvents, ministries] = await Promise.allSettled([
        fetchFrontendMembers(),
        fetchFrontendTransactions(),
        fetchFrontendAttendanceRecords(),
        getFrontendUpcomingEvents(10),
        fetchFrontendMinistries(),
      ]);

      setData({
        members: members.status === 'fulfilled' ? members.value : [],
        transactions: transactions.status === 'fulfilled' ? transactions.value : [],
        attendance: attendance.status === 'fulfilled' ? attendance.value : [],
        upcomingEvents: upcomingEvents.status === 'fulfilled' ? upcomingEvents.value : [],
        ministries: ministries.status === 'fulfilled' ? ministries.value : [],
      });
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard data load failed:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load, lastRefreshed };
}
