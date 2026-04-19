'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users, UserCheck, UserX, Search, X,
  Calendar, CheckCircle2, XCircle, Clock,
  BarChart3, List, Save, RefreshCw, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchFrontendMemberAttendanceSummaries,
  fetchFrontendSessionAttendance,
  bulkSaveFrontendMemberAttendance,
  fetchFrontendMemberAttendance,
  type FrontendMemberAttendanceSummary,
  type FrontendMemberAttendance,
  type ServiceType,
} from '@/lib/member-attendance-adapter';
import type { Member } from '@/app/member-management/components/memberData';

type ViewMode = 'summary' | 'session' | 'history';

const SERVICE_TYPES: ServiceType[] = [
  'Sunday Service',
  'Midweek Service',
  'Cell Group',
  'Special Event',
  'Prayer Meeting',
];

const SERVICE_COLORS: Record<ServiceType, string> = {
  'Sunday Service': 'bg-blue-100 text-blue-700 border-blue-300',
  'Midweek Service': 'bg-purple-100 text-purple-700 border-purple-300',
  'Cell Group': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Special Event': 'bg-amber-100 text-amber-700 border-amber-300',
  'Prayer Meeting': 'bg-pink-100 text-pink-700 border-pink-300',
};

const SERVICE_ICONS: Record<ServiceType, string> = {
  'Sunday Service': '⛪',
  'Midweek Service': '📖',
  'Cell Group': '👥',
  'Special Event': '🎉',
  'Prayer Meeting': '🙏',
};

function AttendanceRateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? 'bg-emerald-100 text-emerald-700' :
    rate >= 50 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {rate}%
    </span>
  );
}

function AttendanceBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate}%` }} />
    </div>
  );
}

export default function MemberAttendancePage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>('summary');

  // Summary view state
  const [summaries, setSummaries] = useState<FrontendMemberAttendanceSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [summaryQuery, setSummaryQuery] = useState('');
  const [summaryStatusFilter, setSummaryStatusFilter] = useState('');

  // Session view state
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionService, setSessionService] = useState<ServiceType>('Sunday Service');
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [sessionAttendance, setSessionAttendance] = useState<Record<string, boolean>>({});
  const [loadingSession, setLoadingSession] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionQuery, setSessionQuery] = useState('');

  // History view state
  const [historyRecords, setHistoryRecords] = useState<FrontendMemberAttendance[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyService, setHistoryService] = useState<ServiceType | ''>('');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');

  // Auth guard
  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  const loadSummaries = useCallback(async () => {
    try {
      setLoadingSummaries(true);
      const data = await fetchFrontendMemberAttendanceSummaries();
      setSummaries(data);
    } catch (err: any) {
      console.error('loadSummaries error:', err);
      toast.error('Failed to load members', {
        description: err?.message ?? 'Check the browser console for details',
      });
    } finally {
      setLoadingSummaries(false);
    }
  }, []);

  const loadAllMembers = useCallback(async () => {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data, error } = await supabase
        .from('members')
        .select('id, member_code, full_name, photo_url, status')
        .in('status', ['active', 'new'])
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Map to the minimal shape the session view needs
      const members = (data ?? []).map((m: any) => ({
        id: m.id,
        memberId: m.member_code,
        name: m.full_name,
        photo: m.photo_url || 'https://i.pravatar.cc/48?img=12',
        status: m.status,
        // Unused fields required by the Member type
        photoAlt: '', phone: '', email: '', gender: 'Male' as const,
        dob: '', age: 0, titheStatus: 'tithe-none' as const,
        cellGroup: '—', ministry: '—', ministries: ['—'],
        joinDate: '', lastAttendance: '—', attendanceRate: 0,
        totalGiving: 0, address: '', maritalStatus: 'Single' as const,
        occupation: '', emergencyContact: '', baptised: false,
        attendanceHistory: [], recentGiving: [],
      }));
      setAllMembers(members);
    } catch {
      toast.error('Failed to load members');
    }
  }, []);

  // Load summaries on mount
  useEffect(() => {
    if (useSupabaseAuth && (loading || !session)) return;
    loadSummaries();
    loadAllMembers();
  }, [useSupabaseAuth, loading, session, loadSummaries, loadAllMembers]);

  const loadSessionAttendance = useCallback(async () => {
    if (!sessionDate || !sessionService) return;
    try {
      setLoadingSession(true);
      const records = await fetchFrontendSessionAttendance(sessionDate, sessionService);
      const map: Record<string, boolean> = {};
      // Default all members to absent
      allMembers.forEach(m => { map[m.id] = false; });
      // Override with saved records
      records.forEach(r => { map[r.memberId] = r.present; });
      setSessionAttendance(map);
    } catch {
      toast.error('Failed to load session attendance');
    } finally {
      setLoadingSession(false);
    }
  }, [sessionDate, sessionService, allMembers]);

  useEffect(() => {
    if (viewMode === 'session' && allMembers.length > 0) {
      loadSessionAttendance();
    }
  }, [viewMode, sessionDate, sessionService, allMembers.length, loadSessionAttendance]);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const records = await fetchFrontendMemberAttendance({
        service: historyService || undefined,
        dateFrom: historyDateFrom || undefined,
        dateTo: historyDateTo || undefined,
      });
      setHistoryRecords(records);
    } catch (err: any) {
      console.error('loadHistory error:', err?.message, err?.details, err?.hint, err);
      toast.error('Failed to load attendance history', {
        description: err?.message ?? 'Check the browser console for details',
      });
    } finally {
      setLoadingHistory(false);
    }
  }, [historyService, historyDateFrom, historyDateTo]);

  useEffect(() => {
    if (viewMode === 'history') loadHistory();
  }, [viewMode, loadHistory]);

  const toggleMemberPresent = (memberId: string) => {
    setSessionAttendance(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const markAll = (present: boolean) => {
    const map: Record<string, boolean> = {};
    filteredSessionMembers.forEach(m => { map[m.id] = present; });
    setSessionAttendance(prev => ({ ...prev, ...map }));
  };

  const saveSession = async () => {
    const records = allMembers.map(m => ({
      memberId: m.id,
      date: sessionDate,
      service: sessionService,
      present: sessionAttendance[m.id] ?? false,
    }));

    try {
      setSavingSession(true);
      await bulkSaveFrontendMemberAttendance(records);
      const presentCount = records.filter(r => r.present).length;
      toast.success('Session saved', { description: `${presentCount} of ${records.length} members marked present` });
      // Refresh summaries in background
      loadSummaries();
    } catch (err) {
      console.error('Failed to save session attendance:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to save session attendance', { description: message });
    } finally {
      setSavingSession(false);
    }
  };

  // Filtered data
  const filteredSummaries = useMemo(() => {
    const q = summaryQuery.trim().toLowerCase();
    return summaries
      .filter(s => !summaryStatusFilter || s.memberStatus === summaryStatusFilter)
      .filter(s => {
        if (!q) return true;
        const name = (s.fullName ?? '').toLowerCase();
        const code = (s.memberCode ?? '').toLowerCase();
        return name.includes(q) || code.includes(q);
      });
  }, [summaries, summaryQuery, summaryStatusFilter]);

  const filteredSessionMembers = useMemo(() => {
    const q = sessionQuery.trim().toLowerCase();
    if (!q) return allMembers;
    return allMembers.filter(m =>
      (m.name ?? '').toLowerCase().includes(q) ||
      (m.memberId ?? '').toLowerCase().includes(q)
    );
  }, [allMembers, sessionQuery]);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return historyRecords;
    return historyRecords.filter(r =>
      (r.fullName ?? '').toLowerCase().includes(q) ||
      (r.memberCode ?? '').toLowerCase().includes(q) ||
      (r.date ?? '').includes(q)
    );
  }, [historyRecords, historyQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = summaries.length;
    const highAttendance = summaries.filter(s => s.attendanceRate >= 80).length;
    const lowAttendance = summaries.filter(s => s.totalSessions > 0 && s.attendanceRate < 50).length;
    const neverRecorded = summaries.filter(s => s.totalSessions === 0).length;
    const avgRate = total > 0
      ? Math.round(summaries.filter(s => s.totalSessions > 0).reduce((sum, s) => sum + s.attendanceRate, 0) / Math.max(1, summaries.filter(s => s.totalSessions > 0).length))
      : 0;
    return { total, highAttendance, lowAttendance, neverRecorded, avgRate };
  }, [summaries]);

  const sessionPresentCount = useMemo(
    () => allMembers.filter(m => sessionAttendance[m.id]).length,
    [allMembers, sessionAttendance]
  );

  if (useSupabaseAuth && (loading || !session)) return null;

  return (
    <AppLayout currentPath="/member-attendance">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track individual member attendance across all services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadSummaries(); loadAllMembers(); }}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MetricCard
          label="Total Members"
          value={metrics.total.toLocaleString()}
          subValue="Being tracked"
          icon={<Users size={18} />}
          hero
        />
        <MetricCard
          label="Avg Attendance Rate"
          value={`${metrics.avgRate}%`}
          subValue="Across all members"
          icon={<TrendingUp size={18} />}
          iconBg="bg-blue-500/10"
        />
        <MetricCard
          label="Faithful Attenders"
          value={metrics.highAttendance.toLocaleString()}
          subValue="80%+ attendance rate"
          icon={<UserCheck size={18} />}
          iconBg="bg-emerald-500/10"
        />
        <MetricCard
          label="Needs Follow-up"
          value={metrics.lowAttendance.toLocaleString()}
          subValue="Below 50% attendance"
          icon={<UserX size={18} />}
          iconBg="bg-red-500/10"
        />
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1 shadow-card mt-5 w-fit">
        {([
          { id: 'summary', label: 'Member Summary', icon: <BarChart3 size={15} /> },
          { id: 'session', label: 'Take Attendance', icon: <UserCheck size={15} /> },
          { id: 'history', label: 'History', icon: <List size={15} /> },
        ] as { id: ViewMode; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── SUMMARY VIEW ── */}
      {viewMode === 'summary' && (
        <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden mt-4">
          <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={summaryQuery}
                onChange={e => setSummaryQuery(e.target.value)}
                placeholder="Search by name or member ID..."
                className="w-full text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={summaryStatusFilter}
              onChange={e => setSummaryStatusFilter(e.target.value)}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="new">New</option>
              <option value="inactive">Inactive</option>
              <option value="transferred">Transferred</option>
            </select>
            {(summaryQuery || summaryStatusFilter) && (
              <button
                onClick={() => { setSummaryQuery(''); setSummaryStatusFilter(''); }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {loadingSummaries ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading member summaries...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-blue-500" size={32} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No members found</h3>
              <p className="text-xs text-muted-foreground">
                {summaryQuery || summaryStatusFilter
                  ? 'Try adjusting your filters'
                  : 'Start by taking attendance in the "Take Attendance" tab'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4">Member</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 hidden md:table-cell">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3">Sessions</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3">Attended</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 w-40">Rate</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 hidden lg:table-cell">Last Attended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSummaries.map(s => (
                    <tr key={s.memberId} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.photoUrl}
                            alt={s.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-[13px]">{s.fullName}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{s.memberCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          s.memberStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          s.memberStatus === 'new' ? 'bg-blue-100 text-blue-700' :
                          s.memberStatus === 'inactive' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {s.memberStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-gray-700 text-[13px]">
                        {s.totalSessions}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-600 text-[13px]">
                        {s.sessionsAttended}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <AttendanceBar rate={s.attendanceRate} />
                          <AttendanceRateBadge rate={s.attendanceRate} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground font-mono hidden lg:table-cell">
                        {s.lastAttended ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SESSION / TAKE ATTENDANCE VIEW ── */}
      {viewMode === 'session' && (
        <div className="space-y-4 mt-4">
          {/* Session selector */}
          <div className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              Select Service Session
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Type</label>
                <select
                  value={sessionService}
                  onChange={e => setSessionService(e.target.value as ServiceType)}
                  className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SERVICE_TYPES.map(s => (
                    <option key={s} value={s}>{SERVICE_ICONS[s]} {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendance sheet */}
          <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {sessionService} — {sessionDate}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {loadingSession
                      ? 'Loading...'
                      : `${sessionPresentCount} / ${allMembers.length} present${sessionQuery ? ` (showing ${filteredSessionMembers.length} filtered)` : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={sessionQuery}
                      onChange={e => setSessionQuery(e.target.value)}
                      placeholder="Search members..."
                      className="text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                    />
                  </div>
                  <button
                    onClick={() => markAll(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Mark All Present
                  </button>
                  <button
                    onClick={() => markAll(false)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={14} /> Mark All Absent
                  </button>
                  <button
                    onClick={saveSession}
                    disabled={savingSession || loadingSession}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={15} />
                    {savingSession ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {!loadingSession && allMembers.length > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${(sessionPresentCount / allMembers.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {loadingSession ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading session data...</p>
              </div>
            ) : allMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="text-blue-500" size={32} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No active members found</h3>
                <p className="text-xs text-muted-foreground">Add members in the Members section first</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSessionMembers.map(member => {
                  const present = sessionAttendance[member.id] ?? false;
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMemberPresent(member.id)}
                      className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors select-none ${
                        present ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        present ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'
                      }`}>
                        {present && <CheckCircle2 size={18} className="text-white" />}
                      </div>
                      <img
                        src={member.photo || 'https://i.pravatar.cc/48?img=12'}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${present ? 'text-emerald-800' : 'text-foreground'}`}>
                          {member.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">{member.memberId}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          present ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {present ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {viewMode === 'history' && (
        <div className="space-y-4 mt-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search Member</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={historyQuery}
                    onChange={e => setHistoryQuery(e.target.value)}
                    placeholder="Name or member ID..."
                    className="w-full text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Type</label>
                <select
                  value={historyService}
                  onChange={e => setHistoryService(e.target.value as ServiceType | '')}
                  className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All services</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {(historyQuery || historyService || historyDateFrom || historyDateTo) && (
              <button
                onClick={() => { setHistoryQuery(''); setHistoryService(''); setHistoryDateFrom(''); setHistoryDateTo(''); }}
                className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>

          {/* History table */}
          <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white">
              <p className="text-sm font-bold text-foreground">{filteredHistory.length} Records</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredHistory.filter(r => r.present).length} present · {filteredHistory.filter(r => !r.present).length} absent
              </p>
            </div>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="text-blue-500" size={32} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No records found</h3>
                <p className="text-xs text-muted-foreground">
                  {historyQuery || historyService || historyDateFrom || historyDateTo
                    ? 'Try adjusting your filters'
                    : 'Take attendance in the "Take Attendance" tab to see history here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4">Member</th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3">Date</th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3">Service</th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3">Status</th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 hidden md:table-cell">Checked In At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.map(r => (
                      <tr key={`${r.sessionId}-${r.memberId}`} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={r.photoUrl}
                              alt={r.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-foreground text-[13px]">{r.fullName}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{r.memberCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-[12px] text-gray-600">{r.date}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${SERVICE_COLORS[r.service as ServiceType] ?? 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                            {SERVICE_ICONS[r.service as ServiceType] ?? '📋'} {r.service}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {r.present ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                              <CheckCircle2 size={14} /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600">
                              <XCircle size={14} /> Absent
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-muted-foreground hidden md:table-cell">
                          {r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
