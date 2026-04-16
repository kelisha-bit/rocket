'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricCard from '@/components/ui/MetricCard';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Users, MapPin, UserRound } from 'lucide-react';
import { fetchFrontendCellGroups } from '@/lib/cellGroup-adapter';

type CellGroup = {
  id: string;
  name: string;
  zone: string;
  leader: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  members: number;
  status: 'Active' | 'Needs Attention';
};

export default function CellGroupsPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [zone, setZone] = useState<string>('');
  const [selected, setSelected] = useState<CellGroup | null>(null);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cell groups from database
  useEffect(() => {
    const loadCellGroups = async () => {
      try {
        setLoadingGroups(true);
        setError(null);
        const groups = await fetchFrontendCellGroups();
        setCellGroups(groups);
      } catch (err) {
        console.error('Failed to load cell groups:', err);
        setError('Failed to load cell groups. Please try again.');
      } finally {
        setLoadingGroups(false);
      }
    };
    
    loadCellGroups();
  }, []);

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cellGroups
      .filter(c => (zone ? c.zone === zone : true))
      .filter(c => {
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || c.leader.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.members < b.members ? 1 : -1));
  }, [query, zone]);

  const metrics = useMemo(() => {
    const totalGroups = cellGroups.length;
    const totalMembers = cellGroups.reduce((sum, c) => sum + c.members, 0);
    const needsAttention = cellGroups.filter(c => c.status === 'Needs Attention').length;
    const zones = new Set(cellGroups.map(c => c.zone)).size;
    return { totalGroups, totalMembers, needsAttention, zones };
  }, []);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  return (
    <AppLayout currentPath="/cell-groups">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cell Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingGroups ? 'Loading...' : `Manage cell group zones, leaders, and membership. ${cellGroups.length} total groups.`}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        <button
          className="flex items-center gap-2 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#163f6f] active:scale-[0.99] transition-all shadow-card disabled:opacity-50"
          onClick={() => setSelected({ id: 'new', name: '', zone: 'Zone A', leader: '', meetingDay: 'Friday', meetingTime: '19:00', location: '', members: 0, status: 'Active' })}
          disabled={loadingGroups}
        >
          + Add Cell Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        <MetricCard label="Groups" value={metrics.totalGroups} subValue="Active groups" icon={<Home size={18} />} hero />
        <MetricCard label="Members" value={metrics.totalMembers.toLocaleString()} subValue="Across all groups" icon={<Users size={18} />} iconBg="bg-emerald-500/10" />
        <MetricCard label="Zones" value={metrics.zones} subValue="Coverage" icon={<MapPin size={18} />} iconBg="bg-purple-500/10" />
        <MetricCard label="Needs Attention" value={metrics.needsAttention} subValue="Follow-up required" icon={<UserRound size={18} />} iconBg="bg-amber-500/10" warning={metrics.needsAttention > 0} />
      </div>

      {/* Loading state */}
      {loadingGroups && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading cell groups...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loadingGroups && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      {!loadingGroups && !error && (
        <div className="bg-white rounded-xl border border-border shadow-card p-4 mt-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search group, leader, location…"
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-72"
            />
            <select
              value={zone}
              onChange={e => setZone(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} group(s)</p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Group</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Zone</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Leader</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Meeting</th>
                <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Members</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Status</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-3 text-foreground font-semibold">{c.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.zone}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.leader}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.meetingDay} · <span className="font-mono text-[12px]">{c.meetingTime}</span></td>
                  <td className="px-3 py-3 text-right font-mono font-semibold tabular-nums">{c.members.toLocaleString()}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.status}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => setSelected(c)} className="text-sm font-medium text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.id === 'new' ? 'Add Cell Group' : 'Cell Group Detail'}
        size="md"
      >
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Group</p>
                <p className="text-sm text-foreground mt-1">{selected.name || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Zone</p>
                <p className="text-sm text-foreground mt-1">{selected.zone}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Leader</p>
                <p className="text-sm text-foreground mt-1">{selected.leader || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Meeting</p>
                <p className="text-sm text-foreground mt-1">{selected.meetingDay} · <span className="font-mono">{selected.meetingTime}</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
                <p className="text-sm text-foreground mt-1">{selected.location || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors" onClick={() => setSelected(null)}>
                Close
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors" onClick={() => setSelected(null)}>
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
