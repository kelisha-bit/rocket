'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  category: 'attendance' | 'finance' | 'events' | 'members';
  actionRequired?: boolean;
}

const alertIcons = {
  warning: <AlertTriangle size={16} className="text-amber-600" />,
  info: <Info size={16} className="text-blue-600" />,
  success: <CheckCircle size={16} className="text-green-600" />,
  error: <AlertTriangle size={16} className="text-red-600" />,
};

const alertColors = {
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
};

const categoryIcons = {
  attendance: <Users size={14} />,
  finance: <DollarSign size={14} />,
  events: <Calendar size={14} />,
  members: <Users size={14} />,
};

export default function AlertsWidget() {
  const { stats, data, loading } = useDashboard();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo<Alert[]>(() => {
    if (loading) return [];
    const result: Alert[] = [];

    // Attendance alert
    if (stats.lastSundayAttendanceRate > 0 && stats.lastSundayAttendanceRate < 70) {
      result.push({
        id: 'att-low',
        type: 'warning',
        title: 'Low Sunday Attendance',
        message: `Last Sunday attendance was ${stats.lastSundayAttendanceRate}% (${stats.lastSundayAttendance.toLocaleString()} members). Consider follow-up outreach.`,
        category: 'attendance',
        actionRequired: true,
      });
    } else if (stats.lastSundayAttendanceRate >= 85) {
      result.push({
        id: 'att-high',
        type: 'success',
        title: 'Strong Attendance',
        message: `Sunday attendance is at ${stats.lastSundayAttendanceRate}% — great turnout this week!`,
        category: 'attendance',
      });
    }

    // Finance alert — tithe progress
    if (stats.tithesThisMonth > 0) {
      const target = 55000; // configurable target
      const pct = Math.round((stats.tithesThisMonth / target) * 100);
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const dayOfMonth = new Date().getDate();
      const daysLeft = daysInMonth - dayOfMonth;
      result.push({
        id: 'finance-tithe',
        type: pct >= 100 ? 'success' : 'info',
        title: pct >= 100 ? 'Tithe Target Reached!' : 'Tithe Goal Progress',
        message: `Monthly tithe at ₵${stats.tithesThisMonth.toLocaleString()} (${pct}% of ₵${target.toLocaleString()} target) with ${daysLeft} days remaining.`,
        category: 'finance',
        actionRequired: pct < 50 && daysLeft < 10,
      });
    }

    // Upcoming events near capacity
    const nearCapacityEvents = data.upcomingEvents.filter(
      e => (e.expectedAttendance ?? 0) > 0 && (e.expectedAttendance ?? 0) >= 250
    );
    if (nearCapacityEvents.length > 0) {
      const evt = nearCapacityEvents[0];
      result.push({
        id: `evt-cap-${evt.id}`,
        type: 'warning',
        title: 'Event Capacity Alert',
        message: `"${evt.title}" has ${(evt.expectedAttendance ?? 0).toLocaleString()} expected attendees. Confirm venue capacity.`,
        category: 'events',
        actionRequired: true,
      });
    }

    // New members milestone
    if (stats.newMembersThisMonth > 0) {
      result.push({
        id: 'members-new',
        type: 'success',
        title: 'New Members This Month',
        message: `${stats.newMembersThisMonth} new member${stats.newMembersThisMonth !== 1 ? 's' : ''} joined this month. Total active: ${stats.totalActiveMembers.toLocaleString()}.`,
        category: 'members',
      });
    }

    // Birthdays today
    const todayBirthdays = stats.birthdaysThisWeek.filter(m => {
      const dob = m.dob;
      if (!dob) return false;
      try {
        let month: number, day: number;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
          const p = dob.split('-'); month = parseInt(p[1]) - 1; day = parseInt(p[2]);
        } else {
          const p = dob.split('/'); day = parseInt(p[0]); month = parseInt(p[1]) - 1;
        }
        const today = new Date();
        return today.getMonth() === month && today.getDate() === day;
      } catch { return false; }
    });
    if (todayBirthdays.length > 0) {
      result.push({
        id: 'bday-today',
        type: 'info',
        title: `${todayBirthdays.length} Birthday${todayBirthdays.length !== 1 ? 's' : ''} Today`,
        message: `${todayBirthdays.map(m => m.name).join(', ')} ${todayBirthdays.length === 1 ? 'is' : 'are'} celebrating today. Send a message!`,
        category: 'members',
      });
    }

    return result;
  }, [stats, data, loading]);

  const visible = alerts.filter(a => !dismissed.has(a.id));

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">System Alerts</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `${visible.length} active · ${visible.filter(a => a.actionRequired).length} require action`}
          </p>
        </div>
        {visible.filter(a => a.actionRequired).length > 0 && (
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-1 font-medium">
            {visible.filter(a => a.actionRequired).length} action needed
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Loading alerts...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs">No active alerts at the moment.</p>
          </div>
        ) : (
          visible.map(alert => (
            <div key={alert.id} className={`border rounded-lg p-3 ${alertColors[alert.type]} relative group`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{alertIcons[alert.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <span className="text-muted-foreground">{categoryIcons[alert.category]}</span>
                    {alert.actionRequired && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                </div>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
