'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Member } from './memberData';
import { fetchFrontendMembers, createFrontendMember, updateFrontendMember, deleteFrontendMember } from '@/lib/member-adapter';
import { fetchFrontendMinistries, Ministry } from '@/lib/ministry-adapter';
import { toast } from 'sonner';

import MemberTable from './MemberTable';
import MemberDetailPanel from './MemberDetailPanel';
import MemberFilters from './MemberFilters';
import Modal from '@/components/ui/Modal';
import MemberStats from './MemberStats';
import MemberCardView from './MemberCardView';
import ViewToggle from './ViewToggle';
import MemberPhotoModal from './MemberPhotoModal';
import PhotoUpload from '@/components/ui/PhotoUpload';

export interface Filters {
  status: string;
  cellGroup: string;
  ministry: string;
  titheStatus: string;
  gender: string;
}

function parseDobToDate(dob: string): Date | null {
  const v = dob.trim();
  if (!v) return null;

  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(v)) {
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const parts = v.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calculateAge(dob: string): number {
  const d = parseDobToDate(dob);
  if (!d) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return Math.max(0, age);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function generateMemberCode(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GWC-${y}${m}${d}-${rand}`;
}

export default function MemberManagementContent() {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ status: '', cellGroup: '', ministry: '', titheStatus: '', gender: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Member>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingMinistries, setLoadingMinistries] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [photoModalMember, setPhotoModalMember] = useState<Member | null>(null);

  // Fetch members from database on component mount
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const members = await fetchFrontendMembers();
      setMemberList(members);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError('Failed to load members. Please try again.');
      toast.error('Failed to load members', { description: 'Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ministries when edit modal opens
  useEffect(() => {
    if (editMember) {
      loadMinistries();
    }
  }, [editMember]);

  const loadMinistries = async () => {
    try {
      setLoadingMinistries(true);
      const fetchedMinistries = await fetchFrontendMinistries();
      setMinistries(fetchedMinistries);
    } catch (err) {
      console.error('Failed to load ministries:', err);
      toast.error('Failed to load ministries', { description: 'Ministry dropdown may not work properly.' });
    } finally {
      setLoadingMinistries(false);
    }
  };

  const filtered = useMemo(() => {
    return memberList
      .filter(m => {
        const q = search.toLowerCase();
        if (q && !m.name.toLowerCase().includes(q) && !m.memberId.toLowerCase().includes(q) && !m.phone.includes(q)) return false;
        if (filters.status && m.status !== filters.status) return false;
        if (filters.titheStatus && m.titheStatus !== filters.titheStatus) return false;
        if (filters.gender && m.gender !== filters.gender) return false;
        if (filters.cellGroup && !m.cellGroup.toLowerCase().includes(filters.cellGroup.toLowerCase())) return false;
        if (filters.ministry && m.ministry !== filters.ministry) return false;
        return true;
      })

      .sort((a, b) => {
        const av = a[sortField];
        const bv = b[sortField];
        if (typeof av === 'string' && typeof bv === 'string') {
          return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return 0;
      });
  }, [memberList, search, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: keyof Member) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(m => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map(id => deleteFrontendMember(id));
      await Promise.all(deletePromises);
      
      setMemberList(prev => prev.filter(m => !selectedIds.has(m.id)));
      toast.success(`${selectedIds.size} member(s) deleted`, { description: 'The selected members have been removed.' });
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to delete members:', err);
      toast.error('Failed to delete members', { description: 'Please try again.' });
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Backend integration point: POST /api/members/export with filters + format
    toast.info(`Exporting ${filtered.length} members as ${format.toUpperCase()}…`, { description: 'Download will start shortly.' });
  };

  const createEmptyMember = (): Member => {
    const id = `member-${Math.random().toString(16).slice(2)}`;
    return {
      id,
      memberId: generateMemberCode(),
      name: 'New Member',
      photo: 'https://i.pravatar.cc/48?img=12',
      photoAlt: 'New member profile photo',
      phone: '+233 00 000 0000',
      email: 'new.member@greaterworks.gh',
      gender: 'Male',
      dob: '01/01/2000',
      age: 26,
      status: 'new',
      titheStatus: 'tithe-none',
      cellGroup: '—',
      ministry: '—',
      joinDate: '14/04/2026',
      lastAttendance: '—',
      attendanceRate: 0,
      totalGiving: 0,
      address: '—',
      maritalStatus: 'Single',
      occupation: '—',
      emergencyContact: '—',
      baptised: false,
      attendanceHistory: [],
      recentGiving: [],
    };
  };

  const handleSaveMember = async (m: Member) => {
    try {
      if (!isUuid(m.id)) {
        // New members use temporary frontend IDs (e.g. "member-..."), not DB UUIDs.
        const createdMember = await createFrontendMember(m);
        setMemberList(prev => [createdMember, ...prev]);
        toast.success('Member created', { description: `${createdMember.name} added as ${createdMember.memberId}.` });
      } else {
        // This is an existing member
        const updatedMember = await updateFrontendMember(m.id, m);
        setMemberList(prev => {
          const idx = prev.findIndex(x => x.id === m.id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = updatedMember;
          return next;
        });
        toast.success('Member updated', { description: `${m.name} has been updated successfully.` });
      }
      setEditMember(null);
    } catch (err) {
      console.error('Failed to save member:', err);
      toast.error('Failed to save member', { description: 'Please try again.' });
    }
  };

  const handleMoreActions = (m: Member) => {
    // Create a context menu or dropdown with options
    const actions = [
      { label: 'Update Photo', action: () => setPhotoModalMember(m) },
      { label: 'Send Email', action: () => toast.info('Email', { description: 'Email feature coming soon' }) },
      { label: 'Send SMS', action: () => toast.info('SMS', { description: 'SMS feature coming soon' }) },
      { label: 'Print Card', action: () => toast.info('Print', { description: 'Print feature coming soon' }) },
      { label: 'Export Data', action: () => toast.info('Export', { description: 'Export feature coming soon' }) },
    ];
    
    // For now, show the photo modal directly
    setPhotoModalMember(m);
  };

  const handlePhotoUpdate = async (memberId: string, photoUrl: string, photoAlt: string) => {
    try {
      // Update the member in the database first
      const memberToUpdate = memberList.find(m => m.id === memberId);
      if (memberToUpdate) {
        const updatedMember = { ...memberToUpdate, photo: photoUrl, photoAlt: photoAlt };
        await updateFrontendMember(memberId, updatedMember);
        
        // Update the member in the local list
        setMemberList(prev => prev.map(member => 
          member.id === memberId 
            ? updatedMember
            : member
        ));
      }
      
      toast.success('Photo updated successfully');
    } catch (error) {
      console.error('Failed to update photo:', error);
      toast.error('Failed to update photo');
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading...' : `${memberList.length.toLocaleString()} registered members · ${memberList.filter(m => m.status === 'active').length} active`}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          
          <button
            onClick={loadMembers}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card disabled:opacity-50"
          >
            🔄 Refresh
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <span>📊</span> Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
          >
            <span>📄</span> Export PDF
          </button>
          <button
            onClick={() => setEditMember(createEmptyMember())}
            className="flex items-center gap-2 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#163f6f] active:scale-[0.99] transition-all shadow-card"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {!loading && !error && <MemberStats members={memberList} />}

      {/* Filters */}
      <MemberFilters
        search={search}
        setSearch={v => { setSearch(v); setPage(1); }}
        filters={filters}
        setFilters={v => { setFilters(v); setPage(1); }}
      />

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading members...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={loadMembers}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table or Card View */}
      {!loading && !error && (
        <>
          {viewMode === 'table' ? (
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden mt-4">
              <MemberTable
                members={paginated}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
                toggleSelectAll={toggleSelectAll}
                allSelected={selectedIds.size === paginated.length && paginated.length > 0}
                sortField={sortField}
                sortDir={sortDir}
                toggleSort={toggleSort}
                onViewDetail={setDetailMember}
                onEditMember={m => setEditMember(m)}
                onMoreActions={handleMoreActions}
                onExport={handleExport}
              />

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} members
                  </span>
                  <select
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[10, 20, 50].map(n => (
                      <option key={`per-page-${n}`} value={n}>{n} per page</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={`page-${p}`}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-muted'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <MemberCardView
                members={paginated}
                onViewDetail={setDetailMember}
                onEditMember={m => setEditMember(m)}
                onMoreActions={handleMoreActions}
              />
              
              {/* Pagination for Card View */}
              <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} members
                  </span>
                  <select
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[12, 24, 48].map(n => (
                      <option key={`per-page-${n}`} value={n}>{n} per page</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={`page-${p}`}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-muted'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-2xl shadow-modal px-5 py-3 flex items-center gap-4 animate-slide-up z-40">
          <span className="text-sm font-semibold">{selectedIds.size} member{selectedIds.size > 1 ? 's' : ''} selected</span>
          <div className="w-px h-4 bg-white/20" />
          <button onClick={() => handleExport('excel')} className="text-sm hover:text-amber-300 transition-colors">Export</button>
          <button 
            onClick={() => {
              // Open photo modal for the first selected member as an example
              const firstSelectedId = Array.from(selectedIds)[0];
              const firstMember = memberList.find(m => m.id === firstSelectedId);
              if (firstMember) {
                setPhotoModalMember(firstMember);
                toast.info('Bulk photo update', { description: 'Update photos individually for now. Bulk update coming soon!' });
              }
            }} 
            className="text-sm hover:text-blue-300 transition-colors"
          >
            Update Photos
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm hover:text-blue-300 transition-colors">Deselect all</button>
          <button onClick={handleBulkDelete} className="text-sm text-red-400 hover:text-red-300 transition-colors">Remove</button>
        </div>
      )}

      {/* Detail panel */}
      {detailMember && (
        <MemberDetailPanel 
          member={detailMember} 
          onClose={() => setDetailMember(null)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}

      {/* Photo Modal */}
      {photoModalMember && (
        <MemberPhotoModal
          member={photoModalMember}
          isOpen={!!photoModalMember}
          onClose={() => setPhotoModalMember(null)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}

      <Modal
        open={!!editMember}
        onClose={() => setEditMember(null)}
        title={editMember?.status === 'new' ? 'Add Member' : 'Edit Member'}
        size="md"
      >
        {editMember && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Photo Upload Section */}
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border">
              <PhotoUpload
                currentPhoto={editMember.photo}
                onPhotoChange={(photoUrl) => setEditMember({ ...editMember, photo: photoUrl })}
                size="lg"
                name={editMember.name}
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Member Photo</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload a clear, professional photo of the member. This will be used throughout the system.
                </p>
                <button
                  onClick={() => setPhotoModalMember(editMember)}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Advanced Photo Options →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Name</label>
                <input
                  value={editMember.name}
                  onChange={e => setEditMember({ ...editMember, name: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Member ID</label>
                <input
                  value={editMember.memberId}
                  onChange={e => setEditMember({ ...editMember, memberId: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
                <select
                  value={editMember.status}
                  onChange={e => setEditMember({ ...editMember, status: e.target.value as Member['status'] })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phone</label>
                <input
                  value={editMember.phone}
                  onChange={e => setEditMember({ ...editMember, phone: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                <input
                  value={editMember.email}
                  onChange={e => setEditMember({ ...editMember, email: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Gender</label>
                <select
                  value={editMember.gender}
                  onChange={e => setEditMember({ ...editMember, gender: e.target.value as Member['gender'] })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">DOB</label>
                <input
                  value={editMember.dob}
                  onChange={e => {
                    const dob = e.target.value;
                    setEditMember({ ...editMember, dob, age: calculateAge(dob) });
                  }}
                  placeholder="DD/MM/YYYY"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Age</label>
                <input
                  value={String(editMember.age ?? 0)}
                  onChange={e => setEditMember({ ...editMember, age: Number(e.target.value || 0) })}
                  inputMode="numeric"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Join Date</label>
                <input
                  value={editMember.joinDate}
                  onChange={e => setEditMember({ ...editMember, joinDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cell Group</label>
                <input
                  value={editMember.cellGroup}
                  onChange={e => setEditMember({ ...editMember, cellGroup: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ministry</label>
                <select
                  value={editMember.ministry}
                  onChange={e => setEditMember({ ...editMember, ministry: e.target.value })}
                  disabled={loadingMinistries}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="—">No ministry</option>
                  {ministries.map(ministry => (
                    <option key={ministry.id} value={ministry.name}>
                      {ministry.name}
                    </option>
                  ))}
                </select>
                {loadingMinistries && (
                  <p className="text-xs text-muted-foreground mt-1">Loading ministries...</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tithe Status</label>
                <select
                  value={editMember.titheStatus}
                  onChange={e => setEditMember({ ...editMember, titheStatus: e.target.value as Member['titheStatus'] })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="tithe-faithful">Faithful</option>
                  <option value="tithe-irregular">Irregular</option>
                  <option value="tithe-none">None</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Marital Status</label>
                <select
                  value={editMember.maritalStatus}
                  onChange={e => setEditMember({ ...editMember, maritalStatus: e.target.value as Member['maritalStatus'] })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Address</label>
                <input
                  value={editMember.address}
                  onChange={e => setEditMember({ ...editMember, address: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Occupation</label>
                <input
                  value={editMember.occupation}
                  onChange={e => setEditMember({ ...editMember, occupation: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Emergency Contact</label>
                <input
                  value={editMember.emergencyContact}
                  onChange={e => setEditMember({ ...editMember, emergencyContact: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Baptised</p>
                  <p className="text-xs text-muted-foreground">Mark if the member has been baptised</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!editMember.baptised}
                  onChange={e => setEditMember({ ...editMember, baptised: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Photo URL</label>
                <input
                  value={editMember.photo}
                  onChange={e => setEditMember({ ...editMember, photo: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Photo Alt Text</label>
                <input
                  value={editMember.photoAlt}
                  onChange={e => setEditMember({ ...editMember, photoAlt: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last Attendance</label>
                <input
                  value={editMember.lastAttendance}
                  onChange={e => setEditMember({ ...editMember, lastAttendance: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Attendance Rate (%)</label>
                <input
                  value={String(editMember.attendanceRate ?? 0)}
                  onChange={e => setEditMember({ ...editMember, attendanceRate: Number(e.target.value || 0) })}
                  inputMode="decimal"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Giving</label>
                <input
                  value={String(editMember.totalGiving ?? 0)}
                  onChange={e => setEditMember({ ...editMember, totalGiving: Number(e.target.value || 0) })}
                  inputMode="decimal"
                  className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setEditMember(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                onClick={() => handleSaveMember(editMember)}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}