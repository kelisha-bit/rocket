'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, MapPin, Clock, Edit2, Trash2, Search,
  Plus, RefreshCw, ChevronRight, CheckCircle2, FileEdit,
  XCircle, LayoutGrid, List, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchFrontendEvents,
  createFrontendEvent,
  updateFrontendEvent,
  deleteFrontendEvent,
  type FrontendChurchEvent as ChurchEvent,
  type EventStatus,
} from '@/lib/event-adapter';

const STATUSES: EventStatus[] = ['scheduled', 'draft', 'completed', 'cancelled'];

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: <CalendarDays size={11} /> },
  draft:     { label: 'Draft',     color: 'bg-amber-50 text-amber-700 border-amber-200',       icon: <FileEdit size={11} /> },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={11} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',             icon: <XCircle size={11} /> },
};

function parseIsoDate(iso: string): Date {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function formatTime(t: string): string {
  if (!t) return '';
  try {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
  } catch { return t; }
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86400000);
}

const emptyEvent = (): ChurchEvent => ({
  id: 'new', title: '', date: new Date().toISOString().split('T')[0],
  time: '09:00', endDate: null, endTime: null,
  location: '', description: '', status: 'draft',
  department: 'Church-wide', expectedAttendance: 0,
});

export default function EventsPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();
  const [query, setQuery]               = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode]         = useState<'table'|'cards'|'calendar'>('table');
  const [events, setEvents]             = useState<ChurchEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [selected, setSelected]         = useState<ChurchEvent | null>(null);
  const [editMode, setEditMode]         = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try { setLoadingEvents(true); setEvents(await fetchFrontendEvents()); }
    catch { toast.error('Failed to load events'); }
    finally { setLoadingEvents(false); }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter(e => !statusFilter || e.status === statusFilter)
      .filter(e => !q || (e.title ?? '').toLowerCase().includes(q) || (e.location ?? '').toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  }, [events, query, statusFilter]);

  const calendarCells = useMemo(() => {
    const first = startOfMonth(calendarMonth);
    const startDow = (first.getDay() + 6) % 7; // Monday = 0
    const start = new Date(first);
    start.setDate(first.getDate() - startDow);

    const cells: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [calendarMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ChurchEvent[]>();
    for (const e of filtered) {
      const key = e.date;
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.time.localeCompare(b.time));
      map.set(k, arr);
    }
    return map;
  }, [filtered]);

  const metrics = useMemo(() => {
    const scheduled = events.filter(e => e.status === 'scheduled');
    const drafts    = events.filter(e => e.status === 'draft').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const next      = [...scheduled].sort((a,b) => a.date.localeCompare(b.date))[0];
    return { scheduled: scheduled.length, drafts, completed, next };
  }, [events]);

  const openCreate = () => { setSelected(emptyEvent()); setEditMode(true); };
  const openEdit   = (e: ChurchEvent) => { setSelected({...e}); setEditMode(true); };
  const openView   = (e: ChurchEvent) => { setSelected({...e}); setEditMode(false); };

  const handleSave = async () => {
    if (!selected) return;
    if (!selected.title.trim())    { toast.error('Title is required'); return; }
    if (!selected.date)            { toast.error('Date is required'); return; }
    if (!selected.time)            { toast.error('Time is required'); return; }
    try {
      setSaving(true);
      if (selected.id === 'new') {
        const created = await createFrontendEvent(selected);
        setEvents(prev => [created, ...prev]);
        toast.success('Event created', { description: created.title });
      } else {
        const updated = await updateFrontendEvent(selected.id, selected);
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        toast.success('Event updated');
      }
      setSelected(null);
    } catch (err: any) {
      toast.error('Failed to save event', { description: err?.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async (event: ChurchEvent) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      setDeleting(true);
      await deleteFrontendEvent(event.id);
      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast.success('Event deleted');
      if (selected?.id === event.id) setSelected(null);
    } catch { toast.error('Failed to delete event'); }
    finally { setDeleting(false); }
  };

  if (useSupabaseAuth && (loading || !session)) return null;

  return (
    <AppLayout currentPath="/events">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingEvents ? 'Loading' : `${events.length} total  ${metrics.scheduled} scheduled  ${metrics.drafts} drafts`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadEvents} disabled={loadingEvents}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card disabled:opacity-50">
            <RefreshCw size={14} className={loadingEvents ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#163f6f] active:scale-[0.99] transition-all shadow-card">
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Scheduled" value={String(metrics.scheduled)} subValue="Upcoming events"
          icon={<CalendarDays size={18} className="text-blue-600" />} iconBg="bg-blue-50" hero />
        <MetricCard label="Drafts" value={String(metrics.drafts)} subValue="Needs review"
          icon={<FileEdit size={18} className="text-amber-600" />} iconBg="bg-amber-50" />
        <MetricCard label="Completed" value={String(metrics.completed)} subValue="Past events"
          icon={<CheckCircle2 size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" />
        <MetricCard label="Total Events" value={String(events.length)} subValue="All time"
          icon={<Users size={18} className="text-purple-600" />} iconBg="bg-purple-50" />
      </div>

      {/* Next Event Banner */}
      {metrics.next && (() => {
        const days = daysUntil(metrics.next.date);
        return (
          <div className="bg-gradient-to-r from-[#1B4F8A] to-[#2563EB] rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <CalendarDays size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">Next Scheduled Event</p>
                <p className="text-white font-semibold">{metrics.next.title}</p>
                <p className="text-blue-200 text-xs mt-0.5">
                  {formatDate(metrics.next.date)}  {formatTime(metrics.next.time)}
                  {metrics.next.location && `  ${metrics.next.location}`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-white">{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}</p>
              {days > 1 && <p className="text-blue-200 text-xs">days away</p>}
            </div>
          </div>
        );
      })()}

      {/* Filters + View Toggle */}
      <div className="bg-white rounded-xl border border-border shadow-card p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search title, location, description"
                className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-60" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(query || statusFilter) && (
              <button onClick={() => { setQuery(''); setStatusFilter(''); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <XCircle size={13} /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
            <button onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <List size={15} />
            </button>
            <button onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <CalendarDays size={15} />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Loading */}
      {loadingEvents && (
        <div className="bg-white rounded-xl border border-border shadow-card p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading events</p>
        </div>
      )}

      {/* Calendar View */}
      {!loadingEvents && viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Calendar</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCalendarMonth(m => addMonths(m, -1))}
                className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setCalendarMonth(startOfMonth(new Date()))}
                className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonth(m => addMonths(m, 1))}
                className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-muted/20 border-b border-border">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((d) => {
              const inMonth = d.getMonth() === calendarMonth.getMonth();
              const isToday = isSameDay(d, new Date());
              const key = toYmd(d);
              const dayEvents = eventsByDate.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={`min-h-[110px] border-b border-border/60 border-r border-border/60 p-2 ${inMonth ? 'bg-white' : 'bg-muted/10'} ${isToday ? 'ring-1 ring-inset ring-primary/30' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[12px] font-semibold ${inMonth ? 'text-foreground' : 'text-muted-foreground'}`}>{d.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => {
                      const sc = STATUS_CONFIG[e.status];
                      return (
                        <button
                          key={e.id}
                          onClick={() => openView(e)}
                          title={e.title}
                          className={`w-full text-left px-2 py-1 rounded-md border text-[11px] font-medium truncate hover:opacity-90 transition-opacity ${sc.color}`}
                        >
                          {e.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => {
                          setQuery('');
                          setStatusFilter('');
                        }}
                        className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loadingEvents && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-border shadow-card p-12 text-center">
          <CalendarDays size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground mb-1">No events found</p>
          <p className="text-xs text-muted-foreground mb-4">
            {query || statusFilter ? 'Try adjusting your filters' : 'Create your first event to get started'}
          </p>
          {!query && !statusFilter && (
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#163f6f] transition-colors">
              <Plus size={15} /> Create Event
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loadingEvents && filtered.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {['Event', 'Date & Time', 'Location', 'Status', 'Actions'].map(col => (
                    <th key={col} className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-4 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(e => {
                  const sc = STATUS_CONFIG[e.status];
                  const days = daysUntil(e.date);
                  return (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3 max-w-[260px]">
                        <p className="font-semibold text-foreground text-[13px] leading-snug">{e.title}</p>
                        {e.description && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{e.description}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[12px] font-medium text-foreground">{formatDate(e.date)}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {formatTime(e.time)}
                          {e.status === 'scheduled' && days >= 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${days === 0 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate max-w-[160px]">{e.location || ''}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openView(e)} title="View"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors">
                            <ChevronRight size={14} />
                          </button>
                          <button onClick={() => openEdit(e)} title="Edit"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(e)} disabled={deleting} title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-40">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {!loadingEvents && filtered.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(e => {
            const sc = STATUS_CONFIG[e.status];
            const days = daysUntil(e.date);
            return (
              <div key={e.id} className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-shadow flex flex-col overflow-hidden group">
                <div className={`h-1 w-full ${e.status === 'scheduled' ? 'bg-blue-500' : e.status === 'completed' ? 'bg-emerald-500' : e.status === 'draft' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="font-semibold text-foreground text-[14px] leading-snug line-clamp-2 flex-1">{e.title}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[12px] text-muted-foreground flex-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={12} className="shrink-0 text-primary/60" />
                      <span>{formatDate(e.date)}</span>
                      {e.status === 'scheduled' && days >= 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${days === 0 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2"><Clock size={12} className="shrink-0 text-primary/60" /><span>{formatTime(e.time)}</span></div>
                    {e.location && <div className="flex items-center gap-2"><MapPin size={12} className="shrink-0 text-primary/60" /><span className="truncate">{e.location}</span></div>}
                    {e.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{e.description}</p>}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border/50">
                    <button onClick={() => openView(e)} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors" title="View"><ChevronRight size={14} /></button>
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors" title="Edit"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(e)} disabled={deleting} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-40" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}
        title={selected?.id === 'new' ? 'Create Event' : editMode ? 'Edit Event' : (selected?.title ?? 'Event')}
        size="md">
        {selected && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {editMode ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Title *</label>
                  <input value={selected.title} onChange={e => setSelected({...selected, title: e.target.value})}
                    placeholder="Event title"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Start Date *</label>
                    <input type="date" value={selected.date} onChange={e => setSelected({...selected, date: e.target.value})}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Start Time *</label>
                    <input type="time" value={selected.time} onChange={e => setSelected({...selected, time: e.target.value})}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">End Date</label>
                    <input type="date" value={selected.endDate ?? ''} onChange={e => setSelected({...selected, endDate: e.target.value || null})}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">End Time</label>
                    <input type="time" value={selected.endTime ?? ''} onChange={e => setSelected({...selected, endTime: e.target.value || null})}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location</label>
                  <input value={selected.location} onChange={e => setSelected({...selected, location: e.target.value})}
                    placeholder="Venue or address"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Status</label>
                  <select value={selected.status} onChange={e => setSelected({...selected, status: e.target.value as EventStatus})}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</label>
                  <textarea value={selected.description} onChange={e => setSelected({...selected, description: e.target.value})}
                    rows={3} placeholder="Event details, notes, or instructions"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
              </>
            ) : (
              <>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${STATUS_CONFIG[selected.status].color}`}>
                  {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Title</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{selected.title}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Start</p>
                    <p className="text-sm text-foreground mt-1">{formatDate(selected.date)}  {formatTime(selected.time)}</p>
                  </div>
                  {selected.endDate && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">End</p>
                      <p className="text-sm text-foreground mt-1">{formatDate(selected.endDate)}  {formatTime(selected.endTime ?? '')}</p>
                    </div>
                  )}
                  {selected.location && (
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
                      <p className="text-sm text-foreground mt-1 flex items-center gap-1"><MapPin size={13} className="text-muted-foreground" />{selected.location}</p>
                    </div>
                  )}
                  {selected.description && (
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selected.description}</p>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              <div>
                {!editMode && selected.id !== 'new' && (
                  <button onClick={() => handleDelete(selected)} disabled={deleting}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50">
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {!editMode && selected.id !== 'new' && (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white border border-border rounded-lg hover:bg-muted transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                {editMode && (
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#1B4F8A] text-white rounded-lg hover:bg-[#163f6f] transition-colors disabled:opacity-50">
                    {saving ? 'Saving' : selected.id === 'new' ? 'Create Event' : 'Save Changes'}
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
