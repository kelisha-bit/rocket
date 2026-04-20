'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Search, RefreshCw, UserPlus, Trash2, Pencil, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEvents, type ChurchEvent } from '@/lib/supabase/events';
import {
  createFirstTimer,
  deleteFirstTimer,
  fetchFirstTimers,
  type FirstTimer,
  type FirstTimerStatus,
  updateFirstTimer,
  convertFirstTimerToMember,
} from '@/lib/supabase/firstTimers';

type UserProfile = {
  role?: string;
};

function canEdit(role?: string) {
  const r = (role || '').toLowerCase();
  return r.includes('admin') || r.includes('pastor') || r.includes('administrator');
}

const STATUS_OPTIONS: FirstTimerStatus[] = ['New', 'Contacted', 'Connected', 'Converted', 'Not Interested'];

export default function FirstTimersPage() {
  const { useSupabaseAuth, loading: authLoading, session, getUserProfile } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [rows, setRows] = useState<FirstTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | FirstTimerStatus>('All');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FirstTimer | null>(null);
  const [form, setForm] = useState<Partial<FirstTimer>>({
    status: 'New',
    first_visit_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (authLoading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, authLoading, session, router]);

  useEffect(() => {
    if (useSupabaseAuth && (authLoading || !session)) return;
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSupabaseAuth, authLoading, session]);

  const init = async () => {
    try {
      setLoading(true);
      const [ft, ev, prof] = await Promise.all([
        fetchFirstTimers(),
        fetchEvents(),
        (async () => {
          try {
            return (await getUserProfile()) as UserProfile | null;
          } catch {
            return null;
          }
        })(),
      ]);
      setRows(ft);
      setEvents(ev);
      setProfile(prof);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load first timers');
    } finally {
      setLoading(false);
    }
  };

  const editable = canEdit(profile?.role);
  const readOnly = !!editing && !editable;

  const eventTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of events) map.set(e.id, e.title);
    return map;
  }, [events]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter(r => {
      const matchesSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      status: 'New',
      first_visit_date: new Date().toISOString().slice(0, 10),
      full_name: '',
      phone: '',
      email: '',
      gender: null,
      address: '',
      preferred_contact_method: '',
      service_type: '',
      event_id: null,
      notes: '',
      invited_by_name: '',
    });
    setOpen(true);
  };

  const openEdit = (row: FirstTimer) => {
    setEditing(row);
    setForm({ ...row });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !String(form.full_name).trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        const updated = await updateFirstTimer(editing.id, {
          full_name: form.full_name,
          phone: form.phone ?? null,
          email: form.email ?? null,
          gender: (form.gender as any) ?? null,
          address: form.address ?? null,
          preferred_contact_method: form.preferred_contact_method ?? null,
          first_visit_date: form.first_visit_date,
          service_type: form.service_type ?? null,
          event_id: (form.event_id as any) ?? null,
          notes: form.notes ?? null,
          invited_by_name: form.invited_by_name ?? null,
          status: (form.status as any) ?? 'New',
        });
        setRows(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        toast.success('First timer updated');
      } else {
        const created = await createFirstTimer({
          full_name: form.full_name,
          phone: form.phone ?? null,
          email: form.email ?? null,
          gender: (form.gender as any) ?? null,
          address: form.address ?? null,
          preferred_contact_method: form.preferred_contact_method ?? null,
          first_visit_date: form.first_visit_date,
          service_type: form.service_type ?? null,
          event_id: (form.event_id as any) ?? null,
          notes: form.notes ?? null,
          invited_by_name: form.invited_by_name ?? null,
          status: (form.status as any) ?? 'New',
        });
        setRows(prev => [created, ...prev]);
        toast.success('First timer added');
      }

      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Save failed', { description: err?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: FirstTimer) => {
    if (!editable) {
      toast.error('You do not have permission to delete first timers');
      return;
    }

    if (!window.confirm(`Delete ${row.full_name}?`)) return;

    try {
      await deleteFirstTimer(row.id);
      setRows(prev => prev.filter(p => p.id !== row.id));
      toast.success('First timer deleted');
    } catch (err: any) {
      console.error(err);
      toast.error('Delete failed', { description: err?.message || 'Please try again.' });
    }
  };

  const handleConvert = async (row: FirstTimer) => {
    if (row.status === 'Converted') {
      toast.info('Already converted');
      return;
    }

    if (!window.confirm(`Convert ${row.full_name} into a Member record?`)) return;

    try {
      setSaving(true);
      const result = await convertFirstTimerToMember(row);
      setRows(prev => prev.map(p => (p.id === result.firstTimer.id ? result.firstTimer : p)));
      toast.success('Converted to member');
    } catch (err: any) {
      console.error(err);
      toast.error('Conversion failed', { description: err?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (useSupabaseAuth && (authLoading || !session)) {
    return null;
  }

  return (
    <AppLayout currentPath="/reports">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">First Timers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Capture and follow up with first-time visitors.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={init}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add First Timer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-card p-4 mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, email..."
              className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-72"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {!editable && (
              <span className="text-xs text-muted-foreground">You can add; editing is restricted.</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">Visitor</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">Visit Date</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">Service/Event</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">Status</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No first timers found.</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-medium text-foreground">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {(r.phone || '—')} · {(r.email || '—')}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{r.first_visit_date}</td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {r.event_id ? (eventTitleById.get(r.event_id) || 'Event') : (r.service_type || '—')}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title={editable ? 'Edit' : 'View (editing restricted)'}
                        >
                          <Pencil size={14} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleConvert(r)}
                          disabled={saving}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Convert to Member"
                        >
                          <UserPlus size={14} className="text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title={editable ? 'Delete' : 'Delete (restricted)'}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                        {r.converted_member_id && (
                          <button
                            onClick={() => router.push(`/member-management?memberId=${r.converted_member_id}`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Member"
                          >
                            <ArrowRight size={14} className="text-gray-700" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit First Timer' : 'Add First Timer'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Full Name</label>
            <input
              value={String(form.full_name ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
            <input
              value={String(form.phone ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
            <input
              value={String(form.email ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Gender</label>
            <select
              value={String(form.gender ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, gender: (e.target.value || null) as any }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">—</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-1">Address</label>
            <input
              value={String(form.address ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Preferred Contact Method</label>
            <input
              value={String(form.preferred_contact_method ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, preferred_contact_method: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Call, WhatsApp, Email..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">First Visit Date</label>
            <input
              type="date"
              value={String(form.first_visit_date ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, first_visit_date: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Service Type</label>
            <input
              value={String(form.service_type ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, service_type: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Sunday Service, Midweek..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Event (optional)</label>
            <select
              value={String(form.event_id ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, event_id: e.target.value || null }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">—</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Invited By</label>
            <input
              value={String(form.invited_by_name ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, invited_by_name: e.target.value }))}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
            <select
              value={String(form.status ?? 'New')}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={readOnly}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-foreground mb-1">Notes</label>
            <textarea
              value={String(form.notes ?? '')}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              disabled={readOnly}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
          <button
            onClick={() => {
              setOpen(false);
              setEditing(null);
            }}
            className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (editing ? !editable : false)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {!editable && editing && (
          <div className="text-xs text-muted-foreground mt-3">
            Editing is restricted to admins/pastors.
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
