'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  UsersRound, Users, UserRoundCheck, ClipboardList, Search, Filter, X, 
  Calendar, Clock, Edit2, Trash2, Download, PieChart, TrendingUp,
  UserPlus, Activity, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { Ministry, fetchFrontendMinistries, createFrontendMinistry, updateFrontendMinistry, deleteFrontendMinistry } from '@/lib/ministry-adapter';
import { fetchMembers, Member } from '@/lib/supabase/members';

const STATUS_LABELS: Record<Ministry['status'], string> = {
  Active: 'Active',
  Inactive: 'Inactive',
  New: 'New',
};

const MEETING_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

function normalizeTimeForInput(value: string): string {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^\d{2}:\d{2}$/.test(v)) return v;

  // Handle "9:00 AM" / "09:00 pm"
  const m = v.match(/^(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let hours = Number(m[1]);
    const minutes = m[2];
    const meridiem = m[3].toUpperCase();
    if (Number.isNaN(hours)) return '';
    if (meridiem === 'AM') {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return '';
}

export default function MinistriesPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('');
  const [meetingDayFilter, setMeetingDayFilter] = useState<string>('');
  const [selected, setSelected] = useState<Ministry | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [leaderSearch, setLeaderSearch] = useState('');
  const [loadingMinistries, setLoadingMinistries] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'inactive' | 'summary'>('all');
  const [editMode, setEditMode] = useState(false);

  // Fetch ministries from database
  useEffect(() => {
    const loadMinistries = async () => {
      try {
        setLoadingMinistries(true);
        setError(null);
        const ministries = await fetchFrontendMinistries();
        setMinistries(ministries);
      } catch (err) {
        console.error('Failed to load ministries:', err);
        setError('Failed to load ministries. Please try again.');
      } finally {
        setLoadingMinistries(false);
      }
    };
    
    loadMinistries();
  }, []);

  // Fetch members for leader selection
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const fetchedMembers = await fetchMembers();
        setMembers(fetchedMembers);
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoadingMembers(false);
      }
    };
    
    loadMembers();
  }, []);

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  const filteredLeaders = useMemo(() => {
    if (!leaderSearch.trim()) return members;
    const search = leaderSearch.toLowerCase();
    return members.filter(m => 
      m.full_name.toLowerCase().includes(search) ||
      m.member_code.toLowerCase().includes(search)
    );
  }, [members, leaderSearch]);

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return '—';
    const leader = members.find(m => m.id === leaderId);
    return leader ? leader.full_name : '—';
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ministries
      .filter(m => (status ? m.status === status : true))
      .filter(m => (meetingDayFilter ? m.meetingDay === meetingDayFilter : true))
      .filter(m => {
        if (!q) return true;
        return m.name.toLowerCase().includes(q) || (m.leader || '').toLowerCase().includes(q);
      })
      .sort((a, b) => (a.members < b.members ? 1 : -1));
  }, [ministries, query, status, meetingDayFilter]);

  const metrics = useMemo(() => {
    const total = ministries.length;
    const totalMembers = ministries.reduce((sum, m) => sum + m.members, 0);
    const active = ministries.filter(m => m.status === 'Active').length;
    const inactive = ministries.filter(m => m.status === 'Inactive').length;
    const newCount = ministries.filter(m => m.status === 'New').length;
    const avgMembers = total > 0 ? Math.round(totalMembers / total) : 0;
    
    // Meeting day breakdown
    const meetingDayBreakdown = MEETING_DAYS.map(day => ({
      day,
      count: ministries.filter(m => m.meetingDay === day).length,
      members: ministries.filter(m => m.meetingDay === day).reduce((sum, m) => sum + m.members, 0),
    })).filter(item => item.count > 0);
    
    return { total, totalMembers, active, inactive, newCount, avgMembers, meetingDayBreakdown };
  }, [ministries]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  const handleRefresh = async () => {
    try {
      setLoadingMinistries(true);
      setError(null);
      const ministries = await fetchFrontendMinistries();
      setMinistries(ministries);
      toast.success('Ministries refreshed');
    } catch (err) {
      console.error('Failed to refresh ministries:', err);
      toast.error('Failed to refresh ministries');
    } finally {
      setLoadingMinistries(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`Exporting ${filtered.length} ministries as ${format.toUpperCase()}`, { 
      description: 'Download will start shortly.' 
    });
  };

  const clearFilters = () => {
    setQuery('');
    setStatus('');
    setMeetingDayFilter('');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = query || status || meetingDayFilter;

  const getStatusColor = (status: Ministry['status']) => {
    const colors: Record<Ministry['status'], string> = {
      'Active': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Inactive': 'bg-gray-100 text-gray-700 border-gray-300',
      'New': 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusIcon = (status: Ministry['status']) => {
    const icons: Record<Ministry['status'], string> = {
      'Active': '✓',
      'Inactive': '○',
      'New': '★',
    };
    return icons[status] || '○';
  };

  const handleSave = async () => {
    if (!selected) return;
    if (!selected.name.trim()) {
      toast.error('Ministry name is required');
      return;
    }
    if (!selected.meetingDay.trim()) {
      toast.error('Meeting day is required');
      return;
    }
    if (!selected.meetingTime.trim()) {
      toast.error('Meeting time is required');
      return;
    }

    try {
      setSaving(true);
      if (selected.id === 'new') {
        const created = await createFrontendMinistry(selected);
        setMinistries(prev => [created, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Ministry created', { description: `${created.name} has been added.` });
      } else {
        const updated = await updateFrontendMinistry(selected.id, selected);
        setMinistries(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        toast.success('Ministry updated', { description: `${updated.name} has been updated.` });
      }
      setSelected(null);
    } catch (e) {
      console.error('Failed to save ministry:', e);
      toast.error('Failed to save ministry', { description: (e as any)?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || selected.id === 'new') return;
    const ok = window.confirm(`Delete "${selected.name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeleting(true);
      await deleteFrontendMinistry(selected.id);
      setMinistries(prev => prev.filter(m => m.id !== selected.id));
      toast.success('Ministry deleted', { description: `${selected.name} was removed.` });
      setSelected(null);
    } catch (e) {
      console.error('Failed to delete ministry:', e);
      toast.error('Failed to delete ministry', { description: (e as any)?.message || 'Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout currentPath="/ministries">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ministry Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingMinistries 
              ? 'Loading ministries...' 
              : `Manage ministry teams, leaders, and participation with comprehensive tracking. ${ministries.length} total ministries.`
            }
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loadingMinistries}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={() => {
              setSelected({ id: 'new', name: '', leader: '', leaderId: undefined, members: 0, meetingDay: 'Saturday', meetingTime: '16:00', status: 'Active' });
              setLeaderSearch('');
              setEditMode(true);
            }}
            disabled={loadingMinistries}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] transition-all shadow-card disabled:opacity-50"
          >
            <UserPlus size={16} /> Add Ministry
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MetricCard 
          label="Total Ministries" 
          value={metrics.total} 
          subValue="Active teams"
          icon={<UsersRound size={18} />} 
          hero 
        />
        <MetricCard 
          label="Total Participants" 
          value={metrics.totalMembers.toLocaleString()} 
          subValue={`Avg ${metrics.avgMembers} per ministry`}
          icon={<Users size={18} />} 
          iconBg="bg-emerald-500/10"
        />
        <MetricCard 
          label="Active Ministries" 
          value={metrics.active} 
          subValue="Currently operating"
          icon={<UserRoundCheck size={18} />} 
          iconBg="bg-blue-500/10"
        />
        <MetricCard 
          label="Needs Attention" 
          value={metrics.inactive + metrics.newCount} 
          subValue={`${metrics.inactive} inactive, ${metrics.newCount} new`}
          icon={<ClipboardList size={18} />} 
          iconBg="bg-amber-500/10"
          warning={metrics.inactive > 0}
        />
      </div>

      {/* Loading state */}
      {loadingMinistries && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-5 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading ministries...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loadingMinistries && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-5">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loadingMinistries && !error && ministries.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-12 mt-5 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UsersRound className="text-white" size={40} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No ministries yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start organizing your church by creating your first ministry team.
          </p>
          <button
            onClick={() => {
              setSelected({ id: 'new', name: '', leader: '', leaderId: undefined, members: 0, meetingDay: 'Saturday', meetingTime: '16:00', status: 'Active' });
              setLeaderSearch('');
              setEditMode(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md mx-auto"
          >
            <UserPlus size={16} /> Create First Ministry
          </button>
        </div>
      )}

      {/* Main Content - Only show if not loading and has ministries */}
      {!loadingMinistries && !error && ministries.length > 0 && (
        <>
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1 shadow-card">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                All Ministries
              </button>
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'active' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setViewMode('inactive')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'inactive' 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Inactive Only
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'summary' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <PieChart size={16} className="inline mr-1" />
                Summary
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {[query, status, meetingDayFilter].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-blue-200 shadow-lg p-5 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Filter size={16} className="text-blue-600" />
                  Advanced Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <X size={14} /> Clear all filters
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Ministry name or leader..."
                      className="w-full text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="New">New</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Meeting Day</label>
                  <select
                    value={meetingDayFilter}
                    onChange={e => setMeetingDayFilter(e.target.value)}
                    className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All days</option>
                    {MEETING_DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Ministry Table Views */}
          {(viewMode === 'all' || viewMode === 'active' || viewMode === 'inactive') && (
            <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden mt-4">
              <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {filtered.filter(m => viewMode === 'all' || m.status === (viewMode === 'active' ? 'Active' : 'Inactive')).length} Ministries
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {viewMode === 'all' && `Active: ${metrics.active} • Inactive: ${metrics.inactive} • New: ${metrics.newCount}`}
                    {viewMode === 'active' && `${metrics.active} active ministries`}
                    {viewMode === 'inactive' && `${metrics.inactive} inactive ministries`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {viewMode === 'all' && (
                    <>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <UserRoundCheck size={14} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">{metrics.active}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <ClipboardList size={14} className="text-gray-600" />
                        <span className="text-xs font-semibold text-gray-700">{metrics.inactive}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {filtered.filter(m => viewMode === 'all' || m.status === (viewMode === 'active' ? 'Active' : 'Inactive')).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <UsersRound className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">No ministries found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {hasActiveFilters ? 'Try adjusting your filters to see more results' : 'Add your first ministry to get started'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Ministry</th>
                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Leader</th>
                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Meeting</th>
                        <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Members</th>
                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Status</th>
                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.filter(m => viewMode === 'all' || m.status === (viewMode === 'active' ? 'Active' : 'Inactive')).map((m) => (
                        <tr key={m.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {m.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-foreground font-semibold">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{m.leader || '—'}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar size={14} className="text-gray-400" />
                              <span>{m.meetingDay}</span>
                              <Clock size={14} className="text-gray-400" />
                              <span className="font-mono text-[12px]">{m.meetingTime}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="font-mono font-bold tabular-nums text-blue-600 text-[15px]">
                              {m.members.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusColor(m.status)}`}>
                              <span>{getStatusIcon(m.status)}</span>
                              {STATUS_LABELS[m.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelected({ ...m, meetingTime: normalizeTimeForInput(m.meetingTime) || m.meetingTime });
                                  setLeaderSearch('');
                                  setEditMode(false);
                                }}
                                title="View details"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-600 text-gray-400 transition-all"
                              >
                                <Search size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelected({ ...m, meetingTime: normalizeTimeForInput(m.meetingTime) || m.meetingTime });
                                  setLeaderSearch('');
                                  setEditMode(true);
                                }}
                                title="Edit ministry"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-100 hover:text-amber-600 text-gray-400 transition-all"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelected(m);
                                  handleDelete();
                                }}
                                title="Delete ministry"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 hover:text-red-600 text-gray-400 transition-all"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Summary View */}
          {viewMode === 'summary' && (
            <div className="space-y-4 mt-4">
              {/* Ministry Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <UsersRound size={24} />
                    </div>
                    <Activity size={32} className="opacity-20" />
                  </div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Ministries</p>
                  <p className="text-3xl font-bold mb-2">{metrics.total}</p>
                  <p className="text-blue-100 text-xs">{metrics.active} active teams</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Users size={24} />
                    </div>
                    <Target size={32} className="opacity-20" />
                  </div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Total Participants</p>
                  <p className="text-3xl font-bold mb-2">{metrics.totalMembers.toLocaleString()}</p>
                  <p className="text-emerald-100 text-xs">Avg {metrics.avgMembers} per ministry</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <UserRoundCheck size={24} />
                    </div>
                    <TrendingUp size={32} className="opacity-20" />
                  </div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Active Rate</p>
                  <p className="text-3xl font-bold mb-2">{metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}%</p>
                  <p className="text-purple-100 text-xs">{metrics.active} of {metrics.total} ministries</p>
                </div>
              </div>

              {/* Meeting Day Breakdown */}
              <div className="bg-white rounded-xl border border-border shadow-lg p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-white" />
                  </div>
                  Meeting Schedule Breakdown
                </h3>
                <div className="space-y-3">
                  {metrics.meetingDayBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No meeting schedule data</p>
                  ) : (
                    metrics.meetingDayBreakdown.map(item => (
                      <div key={item.day} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
                              {item.day.substring(0, 3)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{item.day}</p>
                              <p className="text-xs text-muted-foreground">{item.count} ministr{item.count !== 1 ? 'ies' : 'y'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold tabular-nums text-blue-600 text-[15px]">{item.members.toLocaleString()}</p>
                            <p className="text-xs font-semibold text-blue-600">members</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${(item.count / metrics.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-purple-600" />
                  Ministry Status Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">Active Ministries</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.active}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}% of total</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Inactive Ministries</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.inactive}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics.total > 0 ? Math.round((metrics.inactive / metrics.total) * 100) : 0}% of total</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-blue-600 mb-1">New Ministries</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.newCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics.total > 0 ? Math.round((metrics.newCount / metrics.total) * 100) : 0}% of total</p>
                  </div>
                </div>
              </div>

              {/* Top Ministries by Size */}
              <div className="bg-white rounded-xl border border-border shadow-lg p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  Largest Ministries
                </h3>
                <div className="space-y-3">
                  {ministries
                    .filter(m => m.status === 'Active')
                    .sort((a, b) => b.members - a.members)
                    .slice(0, 5)
                    .map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.leader || 'No leader'} • {m.meetingDay}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums text-emerald-600 text-lg">{m.members}</p>
                          <p className="text-xs text-muted-foreground">members</p>
                        </div>
                      </div>
                    ))}
                  {ministries.filter(m => m.status === 'Active').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No active ministries</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* End of conditional content wrapper */}
          </>
        )}

      {/* Modal for Add/Edit/View */}
      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setEditMode(false);
        }}
        title={
          selected?.id === 'new' 
            ? 'Add Ministry'
            : editMode 
            ? 'Edit Ministry' 
            : 'Ministry Details'
        }
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {(selected.id === 'new' || editMode) ? (
              // Edit/Add Form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ministry name</label>
                <input
                  value={selected.name}
                  onChange={e => setSelected({ ...selected, name: e.target.value })}
                  placeholder="e.g. Worship Team"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Leader</label>
                <div className="relative mt-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={leaderSearch}
                      onChange={e => setLeaderSearch(e.target.value)}
                      onFocus={() => setLeaderSearch(selected.leader === '—' ? '' : selected.leader)}
                      placeholder="Search for a member..."
                      className="w-full text-sm border border-border rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {leaderSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {loadingMembers ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Loading members...</div>
                      ) : filteredLeaders.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No members found</div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected({ ...selected, leaderId: undefined, leader: '—' });
                              setLeaderSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40 transition-colors border-b border-border"
                          >
                            <span className="text-muted-foreground italic">No leader</span>
                          </button>
                          {filteredLeaders.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                setSelected({ ...selected, leaderId: member.id, leader: member.full_name });
                                setLeaderSearch('');
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40 transition-colors border-b border-border last:border-b-0"
                            >
                              <div className="font-medium text-foreground">{member.full_name}</div>
                              <div className="text-xs text-muted-foreground">{member.member_code} · {member.phone}</div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selected.leaderId ? `Selected: ${selected.leader}` : 'No leader assigned'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Meeting day</label>
                <select
                  value={selected.meetingDay}
                  onChange={e => setSelected({ ...selected, meetingDay: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {(!MEETING_DAYS.includes(selected.meetingDay as any) && selected.meetingDay) ? (
                    <option value={selected.meetingDay}>{selected.meetingDay}</option>
                  ) : null}
                  {MEETING_DAYS.map(d => (
                    <option key={`day-${d}`} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Meeting time</label>
                <input
                  value={selected.meetingTime}
                  onChange={e => setSelected({ ...selected, meetingTime: e.target.value })}
                  type="time"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Use 24-hour format (HH:MM).</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
                <select
                  value={selected.status}
                  onChange={e => setSelected({ ...selected, status: e.target.value as Ministry['status'] })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="New">New</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Members</label>
                <input
                  value={String(selected.members ?? 0)}
                  readOnly
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/30 text-muted-foreground cursor-not-allowed"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-1">
              {selected.id !== 'new' && (
                <button
                  className="mr-auto px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
              <button
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                onClick={() => {
                  setSelected(null);
                  setEditMode(false);
                }}
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={handleSave}
                disabled={saving || deleting}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className={`bg-gradient-to-br ${selected.status === 'Active' ? 'from-emerald-50 to-emerald-100' : 'from-gray-50 to-gray-100'} rounded-xl p-5 border-2 ${selected.status === 'Active' ? 'border-emerald-200' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {selected.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(selected.status)}`}>
                        <span>{getStatusIcon(selected.status)}</span>
                        {STATUS_LABELS[selected.status]}
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">
                      {selected.members}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{selected.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Leader</p>
                    <p className="text-sm font-semibold text-foreground">{selected.leader || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Members</p>
                    <p className="text-sm font-mono font-bold text-foreground">{selected.members.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Meeting Day</p>
                    <p className="text-sm text-foreground">{selected.meetingDay}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Meeting Time</p>
                    <p className="text-sm font-mono text-foreground">{selected.meetingTime}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons for View Mode */}
            {!editMode && selected.id !== 'new' && (
              <div className="flex justify-between gap-2 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100 transition-all shadow-sm hover:shadow"
                >
                  <Trash2 size={14} className="inline mr-1.5" />
                  Delete Ministry
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelected(null);
                      setEditMode(false);
                    }}
                    className="px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow"
                  >
                    <Edit2 size={14} className="inline mr-1.5" />
                    Edit Ministry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
