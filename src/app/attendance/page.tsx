'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Users, CalendarDays, TrendingUp, TrendingDown, 
  UserPlus, Download, Edit2, Trash2, Search, Filter, X,
  BarChart3, PieChart, Calendar, Clock, MapPin, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchFrontendAttendanceRecords,
  createFrontendAttendanceRecord,
  updateFrontendAttendanceRecord,
  deleteFrontendAttendanceRecord,
  type FrontendAttendanceRecord as AttendanceRecord,
  type ServiceType,
} from '@/lib/attendance-adapter';

export default function AttendancePage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  // Fetch attendance records from database
  useEffect(() => {
    if (useSupabaseAuth && (loading || !session)) return;
    loadRecords();
  }, [useSupabaseAuth, loading, session]);

  const loadRecords = async () => {
    try {
      setLoadingRecords(true);
      const fetchedRecords = await fetchFrontendAttendanceRecords();
      setRecords(fetchedRecords);
    } catch (error) {
      console.error('Failed to load attendance records:', error);
      toast.error('Failed to load attendance records', { description: 'Please check your connection and try again.' });
    } finally {
      setLoadingRecords(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter(r => (serviceFilter ? r.service === serviceFilter : true))
      .filter(r => {
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo && r.date > dateTo) return false;
        return true;
      })
      .filter(r => {
        if (!q) return true;
        return r.date.includes(q) || r.location.toLowerCase().includes(q) || r.service.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records, query, serviceFilter, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    const totalAttendance = filtered.reduce((sum, r) => sum + r.total, 0);
    const totalFirstTimers = filtered.reduce((sum, r) => sum + r.firstTimers, 0);
    const totalVisitors = filtered.reduce((sum, r) => sum + r.visitors, 0);
    const avgAttendance = filtered.length > 0 ? Math.round(totalAttendance / filtered.length) : 0;
    
    const sundayRecords = filtered.filter(r => r.service === 'Sunday Service');
    const avgSunday = sundayRecords.length > 0 ? Math.round(sundayRecords.reduce((sum, r) => sum + r.total, 0) / sundayRecords.length) : 0;
    
    const midweekRecords = filtered.filter(r => r.service === 'Midweek Service');
    const avgMidweek = midweekRecords.length > 0 ? Math.round(midweekRecords.reduce((sum, r) => sum + r.total, 0) / midweekRecords.length) : 0;
    
    const cellRecords = filtered.filter(r => r.service === 'Cell Group');
    const avgCell = cellRecords.length > 0 ? Math.round(cellRecords.reduce((sum, r) => sum + r.total, 0) / cellRecords.length) : 0;
    
    // Calculate trend (compare last 2 records)
    const lastRecord = filtered[0];
    const previousRecord = filtered[1];
    const trend = lastRecord && previousRecord ? 
      ((lastRecord.total - previousRecord.total) / previousRecord.total) * 100 : 0;
    
    // Demographics
    const totalMen = filtered.reduce((sum, r) => sum + r.men, 0);
    const totalWomen = filtered.reduce((sum, r) => sum + r.women, 0);
    const totalChildren = filtered.reduce((sum, r) => sum + r.children, 0);
    
    return {
      totalAttendance,
      totalFirstTimers,
      totalVisitors,
      avgAttendance,
      avgSunday,
      avgMidweek,
      avgCell,
      trend,
      lastRecord,
      totalMen,
      totalWomen,
      totalChildren,
      recordCount: filtered.length,
    };
  }, [filtered]);

  const serviceBreakdown = useMemo(() => {
    const services = ['Sunday Service', 'Midweek Service', 'Cell Group', 'Special Event', 'Prayer Meeting'] as const;
    return services.map(service => ({
      name: service,
      total: filtered.filter(r => r.service === service).reduce((sum, r) => sum + r.total, 0),
      count: filtered.filter(r => r.service === service).length,
      avg: filtered.filter(r => r.service === service).length > 0 
        ? Math.round(filtered.filter(r => r.service === service).reduce((sum, r) => sum + r.total, 0) / filtered.filter(r => r.service === service).length)
        : 0,
    })).filter(item => item.count > 0);
  }, [filtered]);

  const handleSaveRecord = async () => {
    if (!selected) return;
    
    if (!selected.date) {
      toast.error('Please select a date');
      return;
    }
    if (selected.total <= 0) {
      toast.error('Please enter valid attendance numbers');
      return;
    }
    if (!selected.location?.trim()) {
      toast.error('Please enter a location');
      return;
    }

    try {
      if (selected.id === 'new') {
        const recordedBy = useSupabaseAuth
          ? (session?.user?.email || session?.user?.id)
          : 'Admin';

        const newRecord: AttendanceRecord = {
          ...selected,
          recordedBy: recordedBy || 'Admin',
        };
        
        const createdRecord = await createFrontendAttendanceRecord(newRecord);
        setRecords(prev => [createdRecord, ...prev]);
        toast.success('Attendance recorded', { description: `${selected.total} attendees on ${selected.date}` });
      } else {
        const updatedRecord = await updateFrontendAttendanceRecord(selected.id, selected);
        setRecords(prev => prev.map(r => r.id === selected.id ? updatedRecord : r));
        toast.success('Attendance updated');
      }
      
      setSelected(null);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save attendance record:', error);
      toast.error('Failed to save attendance record', { description: 'Please try again.' });
    }
  };

  const handleDeleteRecord = async (record: AttendanceRecord) => {
    if (!window.confirm(`Delete attendance record for ${record.date}?`)) return;
    
    try {
      await deleteFrontendAttendanceRecord(record.id);
      setRecords(prev => prev.filter(r => r.id !== record.id));
      toast.success('Attendance record deleted');
      setSelected(null);
    } catch (error) {
      console.error('Failed to delete attendance record:', error);
      toast.error('Failed to delete attendance record', { description: 'Please try again.' });
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.info(`Exporting ${filtered.length} records as ${format.toUpperCase()}`, { 
      description: 'Download will start shortly.' 
    });
  };

  const clearFilters = () => {
    setQuery('');
    setServiceFilter('');
    setDateFrom('');
    setDateTo('');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = query || serviceFilter || dateFrom || dateTo;

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  const getServiceColor = (service: ServiceType) => {
    const colors: Record<ServiceType, string> = {
      'Sunday Service': 'bg-blue-100 text-blue-700 border-blue-300',
      'Midweek Service': 'bg-purple-100 text-purple-700 border-purple-300',
      'Cell Group': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Special Event': 'bg-amber-100 text-amber-700 border-amber-300',
      'Prayer Meeting': 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return colors[service] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getServiceIcon = (service: ServiceType) => {
    const icons: Record<ServiceType, string> = {
      'Sunday Service': '⛪',
      'Midweek Service': '📖',
      'Cell Group': '👥',
      'Special Event': '🎉',
      'Prayer Meeting': '🙏',
    };
    return icons[service] || '📅';
  };

  return (
    <AppLayout currentPath="/attendance">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingRecords 
              ? 'Loading attendance records...' 
              : `Monitor service attendance, track growth trends, and analyze demographics. ${records.length} total records.`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRecords}
            disabled={loadingRecords}
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
              setSelected({
                id: 'new',
                date: new Date().toISOString().split('T')[0],
                service: 'Sunday Service',
                location: 'Main Auditorium',
                total: 0,
                men: 0,
                women: 0,
                children: 0,
                firstTimers: 0,
                visitors: 0,
              });
              setEditMode(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] transition-all shadow-card"
          >
            <UserPlus size={16} /> Record Attendance
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MetricCard 
          label="Last Service" 
          value={metrics.lastRecord ? metrics.lastRecord.total.toLocaleString() : '—'} 
          subValue={metrics.lastRecord ? `${metrics.lastRecord.service} · ${metrics.lastRecord.date}` : 'No records'}
          icon={<CalendarDays size={18} />}
          hero
        />
        <MetricCard 
          label="Average Attendance" 
          value={metrics.avgAttendance.toLocaleString()} 
          subValue={`Across ${metrics.recordCount} services`}
          icon={<Users size={18} />} 
          iconBg="bg-blue-500/10"
        />
        <MetricCard 
          label="Total First Timers" 
          value={metrics.totalFirstTimers.toLocaleString()} 
          subValue={`${metrics.totalVisitors} visitors`}
          icon={<UserPlus size={18} />} 
          iconBg="bg-emerald-500/10"
        />
        <MetricCard 
          label="Growth Trend" 
          value={`${metrics.trend >= 0 ? '+' : ''}${metrics.trend.toFixed(1)}%`} 
          subValue={metrics.trend >= 0 ? 'Increasing' : 'Decreasing'}
          icon={metrics.trend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} 
          iconBg={metrics.trend >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}
        />
      </div>

      {/* Loading State */}
      {loadingRecords && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-5 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading attendance records...</p>
        </div>
      )}

      {/* Error State - No records */}
      {!loadingRecords && records.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-12 mt-5 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={40} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No attendance records yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your church attendance by recording your first service.
          </p>
          <button
            onClick={() => {
              setSelected({
                id: 'new',
                date: new Date().toISOString().split('T')[0],
                service: 'Sunday Service',
                location: 'Main Auditorium',
                total: 0,
                men: 0,
                women: 0,
                children: 0,
                firstTimers: 0,
                visitors: 0,
              });
              setEditMode(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md mx-auto"
          >
            <UserPlus size={16} /> Record First Attendance
          </button>
        </div>
      )}

      {/* Main Content - Only show if not loading and has records */}
      {!loadingRecords && records.length > 0 && (
        <>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between gap-3 mt-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-1 shadow-card">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'table' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BarChart3 size={16} className="inline mr-1" />
            Table View
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'analytics' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <PieChart size={16} className="inline mr-1" />
            Analytics
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
              {[query, serviceFilter, dateFrom, dateTo].filter(Boolean).length}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Date, service, location..."
                  className="w-full text-sm border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service Type</label>
              <select
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All services</option>
                <option value="Sunday Service">Sunday Service</option>
                <option value="Midweek Service">Midweek Service</option>
                <option value="Cell Group">Cell Group</option>
                <option value="Special Event">Special Event</option>
                <option value="Prayer Meeting">Prayer Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden mt-4">
          <div className="p-5 border-b border-border bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{filtered.length} Attendance Records</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total: {metrics.totalAttendance.toLocaleString()} attendees
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No attendance records found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {hasActiveFilters ? 'Try adjusting your filters to see more results' : 'Start tracking attendance by recording your first service'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Date</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Service</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap hidden lg:table-cell">Location</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap">Total</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap hidden md:table-cell">First Timers</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-3 whitespace-nowrap hidden xl:table-cell">Demographics</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 py-3 px-4 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-mono text-[12px] text-gray-600">{r.date}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getServiceColor(r.service)}`}>
                          <span>{getServiceIcon(r.service)}</span>
                          {r.service}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-[12px] hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          {r.location}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono font-bold tabular-nums text-blue-600 text-[15px]">
                          {r.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          <UserPlus size={12} className="text-emerald-600" />
                          <span className="font-mono font-semibold tabular-nums text-emerald-600 text-[13px]">
                            {r.firstTimers}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right hidden xl:table-cell">
                        <div className="flex items-center justify-end gap-2 text-[11px]">
                          <span className="text-blue-600 font-semibold">👨 {r.men}</span>
                          <span className="text-pink-600 font-semibold">👩 {r.women}</span>
                          <span className="text-amber-600 font-semibold">👶 {r.children}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelected(r);
                              setEditMode(false);
                            }}
                            title="View details"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-600 text-gray-400 transition-all"
                          >
                            <Search size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(r);
                              setEditMode(true);
                            }}
                            title="Edit record"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-100 hover:text-amber-600 text-gray-400 transition-all"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r)}
                            title="Delete record"
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

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-4 mt-4">
          {/* Service Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Breakdown */}
            <div className="bg-white rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                Attendance by Service Type
              </h3>
              <div className="space-y-3">
                {serviceBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No service records found</p>
                ) : (
                  serviceBreakdown.map(item => (
                    <div key={item.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${getServiceColor(item.name as ServiceType)}`}>
                            {getServiceIcon(item.name as ServiceType)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.count} service{item.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums text-blue-600 text-[15px]">{item.total.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-blue-600">Avg: {item.avg.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${(item.total / metrics.totalAttendance) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Demographics Breakdown */}
            <div className="bg-white rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                Demographics Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Men', value: metrics.totalMen, icon: '👨', color: 'from-blue-500 to-blue-400', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300' },
                  { label: 'Women', value: metrics.totalWomen, icon: '👩', color: 'from-pink-500 to-pink-400', bgColor: 'bg-pink-100', textColor: 'text-pink-700', borderColor: 'border-pink-300' },
                  { label: 'Children', value: metrics.totalChildren, icon: '👶', color: 'from-amber-500 to-amber-400', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-300' },
                ].map(item => (
                  <div key={item.label} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${item.bgColor} ${item.textColor} border ${item.borderColor}`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{((item.value / metrics.totalAttendance) * 100).toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-bold tabular-nums text-[15px] ${item.textColor}`}>{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(item.value / metrics.totalAttendance) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Average Attendance Cards */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-purple-600" />
              Average Attendance by Service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">
                    ⛪
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600">Sunday Service</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.avgSunday.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Average per service</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">
                    📖
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600">Midweek Service</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.avgMidweek.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Average per service</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg">
                    👥
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">Cell Groups</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.avgCell.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Average per meeting</p>
              </div>
            </div>
          </div>

          {/* Growth Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-gradient-to-br ${metrics.trend >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {metrics.trend >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                {metrics.trend >= 0 ? <TrendingUp size={32} className="opacity-20" /> : <TrendingDown size={32} className="opacity-20" />}
              </div>
              <p className={`${metrics.trend >= 0 ? 'text-emerald-100' : 'text-red-100'} text-sm font-medium mb-1`}>Growth Trend</p>
              <p className="text-3xl font-bold mb-2">{metrics.trend >= 0 ? '+' : ''}{metrics.trend.toFixed(1)}%</p>
              <p className={`${metrics.trend >= 0 ? 'text-emerald-100' : 'text-red-100'} text-xs`}>
                {metrics.trend >= 0 ? 'Attendance is growing!' : 'Needs attention'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserCheck size={24} />
                </div>
                <UserPlus size={32} className="opacity-20" />
              </div>
              <p className="text-blue-100 text-sm font-medium mb-1">First Timers & Visitors</p>
              <p className="text-3xl font-bold mb-2">{metrics.totalFirstTimers.toLocaleString()}</p>
              <p className="text-blue-100 text-xs">
                {metrics.totalVisitors} visitors • {((metrics.totalFirstTimers / metrics.totalAttendance) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>
      )}

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
            ? 'Record Attendance'
            : editMode 
            ? 'Edit Attendance Record' 
            : 'Attendance Details'
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            {(selected.id === 'new' || editMode) ? (
              // Edit/Add Form
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={selected.date}
                      onChange={e => setSelected({ ...selected, date: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Service Type *</label>
                    <select
                      value={selected.service}
                      onChange={e => setSelected({ ...selected, service: e.target.value as ServiceType })}
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Midweek Service">Midweek Service</option>
                      <option value="Cell Group">Cell Group</option>
                      <option value="Special Event">Special Event</option>
                      <option value="Prayer Meeting">Prayer Meeting</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Location *</label>
                    <input
                      value={selected.location}
                      onChange={e => setSelected({ ...selected, location: e.target.value })}
                      placeholder="e.g., Main Auditorium"
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-2">Demographics *</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Men 👨</label>
                        <input
                          type="number"
                          value={selected.men || ''}
                          onChange={e => {
                            const men = Number(e.target.value) || 0;
                            const total = men + selected.women + selected.children;
                            setSelected({ ...selected, men, total });
                          }}
                          placeholder="0"
                          min="0"
                          className="w-full text-sm border-2 border-blue-200 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Women 👩</label>
                        <input
                          type="number"
                          value={selected.women || ''}
                          onChange={e => {
                            const women = Number(e.target.value) || 0;
                            const total = selected.men + women + selected.children;
                            setSelected({ ...selected, women, total });
                          }}
                          placeholder="0"
                          min="0"
                          className="w-full text-sm border-2 border-pink-200 rounded-lg px-3 py-2 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Children 👶</label>
                        <input
                          type="number"
                          value={selected.children || ''}
                          onChange={e => {
                            const children = Number(e.target.value) || 0;
                            const total = selected.men + selected.women + children;
                            setSelected({ ...selected, children, total });
                          }}
                          placeholder="0"
                          min="0"
                          className="w-full text-sm border-2 border-amber-200 rounded-lg px-3 py-2 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Total Attendance</label>
                    <input
                      type="number"
                      value={selected.total || ''}
                      readOnly
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed font-bold"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from demographics</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">First Timers</label>
                    <input
                      type="number"
                      value={selected.firstTimers || ''}
                      onChange={e => setSelected({ ...selected, firstTimers: Number(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      className="w-full text-sm border-2 border-emerald-200 rounded-lg px-3 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Visitors</label>
                    <input
                      type="number"
                      value={selected.visitors || ''}
                      onChange={e => setSelected({ ...selected, visitors: Number(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">Notes (Optional)</label>
                  <textarea
                    value={selected.notes || ''}
                    onChange={e => setSelected({ ...selected, notes: e.target.value })}
                    placeholder="Additional notes about this service..."
                    rows={3}
                    className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${getServiceColor(selected.service)}`}>
                      <span>{getServiceIcon(selected.service)}</span>
                      {selected.service}
                    </span>
                    <span className="text-3xl font-bold text-blue-700">
                      {selected.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Calendar size={14} />
                    <span className="font-semibold">{selected.date}</span>
                    <span className="mx-2">•</span>
                    <MapPin size={14} />
                    <span>{selected.location}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-3">Demographics Breakdown</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-2xl mb-1">👨</p>
                      <p className="text-2xl font-bold text-blue-700">{selected.men}</p>
                      <p className="text-xs text-blue-600 font-semibold">Men</p>
                      <p className="text-xs text-gray-500 mt-1">{((selected.men / selected.total) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
                      <p className="text-2xl mb-1">👩</p>
                      <p className="text-2xl font-bold text-pink-700">{selected.women}</p>
                      <p className="text-xs text-pink-600 font-semibold">Women</p>
                      <p className="text-xs text-gray-500 mt-1">{((selected.women / selected.total) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                      <p className="text-2xl mb-1">👶</p>
                      <p className="text-2xl font-bold text-amber-700">{selected.children}</p>
                      <p className="text-xs text-amber-600 font-semibold">Children</p>
                      <p className="text-xs text-gray-500 mt-1">{((selected.children / selected.total) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus size={16} className="text-emerald-600" />
                      <p className="text-xs font-bold text-emerald-700">First Timers</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{selected.firstTimers}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-purple-600" />
                      <p className="text-xs font-bold text-purple-700">Visitors</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{selected.visitors}</p>
                  </div>
                </div>

                {selected.notes && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-foreground bg-gray-50 rounded-lg p-3 border border-gray-200">{selected.notes}</p>
                  </div>
                )}

                {selected.recordedBy && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-gray-200">
                    Recorded by {selected.recordedBy}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-4 border-t-2 border-gray-200">
              {!editMode && selected.id !== 'new' && (
                <button
                  onClick={() => handleDeleteRecord(selected)}
                  className="px-4 py-2.5 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100 transition-all shadow-sm hover:shadow"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                  onClick={() => {
                    setSelected(null);
                    setEditMode(false);
                  }}
                >
                  {editMode || selected.id === 'new' ? 'Cancel' : 'Close'}
                </button>
                {!editMode && selected.id !== 'new' && (
                  <button
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit2 size={14} className="inline mr-1" />
                    Edit
                  </button>
                )}
                {(editMode || selected.id === 'new') && (
                  <button
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold transition-all shadow-sm hover:shadow"
                    onClick={handleSaveRecord}
                  >
                    {selected.id === 'new' ? 'Record Attendance' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
