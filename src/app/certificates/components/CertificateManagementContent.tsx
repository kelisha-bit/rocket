'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FrontendCertificate, 
  CertificateType, 
  CertificateFormData,
  CERTIFICATE_TEMPLATES,
  fetchFrontendCertificates,
  createFrontendCertificate,
  revokeFrontendCertificate,
  deleteFrontendCertificate,
  searchFrontendCertificates,
  fetchFrontendCertificateStatistics,
  formatCertificateType,
  formatCertificateStatus,
  getCertificateStatusColor,
} from '@/lib/certificate-adapter';
import { fetchFrontendMembers } from '@/lib/member-adapter';
import { Member } from '@/app/member-management/components/memberData';
import { toast } from 'sonner';
import { 
  Award, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Ban, 
  Eye,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Award as AwardIcon
} from 'lucide-react';
import CertificateGenerator from './CertificateGenerator';
import CertificatePreview from './CertificatePreview';
import CertificateStats from './CertificateStats';

interface Filters {
  type: CertificateType | '';
  status: string;
}

export default function CertificateManagementContent() {
  const [certificates, setCertificates] = useState<FrontendCertificate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ type: '', status: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showGenerator, setShowGenerator] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<FrontendCertificate | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [certificateToRevoke, setCertificateToRevoke] = useState<FrontendCertificate | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<FrontendCertificate | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [certsData, membersData, statsData] = await Promise.all([
        fetchFrontendCertificates(),
        fetchFrontendMembers(),
        fetchFrontendCertificateStatistics(),
      ]);
      
      setCertificates(certsData);
      setMembers(membersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load certificates. Please try again.');
      toast.error('Failed to load certificates', { description: 'Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filtered = useMemo(() => {
    return certificates
      .filter(cert => {
        const q = search.toLowerCase();
        if (q && 
            !cert.certificateNumber.toLowerCase().includes(q) && 
            !cert.memberName.toLowerCase().includes(q) &&
            !cert.title.toLowerCase().includes(q)) return false;
        if (filters.type && cert.type !== filters.type) return false;
        if (filters.status && cert.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [certificates, search, filters]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = async (query: string) => {
    setSearch(query);
    setPage(1);
    if (query) {
      try {
        const results = await searchFrontendCertificates(query);
        setCertificates(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      loadData();
    }
  };

  const handleCreateCertificate = async (formData: CertificateFormData) => {
    try {
      const newCert = await createFrontendCertificate(formData);
      setCertificates(prev => [newCert, ...prev]);
      setShowGenerator(false);
      toast.success('Certificate created', { description: `${newCert.title} for ${newCert.memberName}` });
      loadData(); // Refresh stats
    } catch (err) {
      console.error('Failed to create certificate:', err);
      toast.error('Failed to create certificate', { description: 'Please try again.' });
    }
  };

  const handleRevoke = async () => {
    if (!certificateToRevoke || !revokeReason) return;
    
    try {
      await revokeFrontendCertificate(certificateToRevoke.id, revokeReason, 'admin');
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateToRevoke.id 
            ? { ...cert, status: 'revoked', revocationReason: revokeReason }
            : cert
        )
      );
      setRevokeModalOpen(false);
      setRevokeReason('');
      setCertificateToRevoke(null);
      toast.success('Certificate revoked');
      loadData(); // Refresh stats
    } catch (err) {
      console.error('Failed to revoke certificate:', err);
      toast.error('Failed to revoke certificate');
    }
  };

  const handleDelete = async () => {
    if (!certificateToDelete) return;
    
    try {
      await deleteFrontendCertificate(certificateToDelete.id);
      setCertificates(prev => prev.filter(cert => cert.id !== certificateToDelete.id));
      setDeleteModalOpen(false);
      setCertificateToDelete(null);
      toast.success('Certificate deleted');
      loadData(); // Refresh stats
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      toast.error('Failed to delete certificate');
    }
  };

  const handleDownload = (cert: FrontendCertificate) => {
    // Open print dialog for the certificate preview
    setPreviewCertificate(cert);
    setTimeout(() => {
      window.print();
    }, 500);
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
      setSelectedIds(new Set(paginated.map(c => c.id)));
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading...' : `${certificates.length.toLocaleString()} certificates · ${certificates.filter(c => c.status === 'active').length} active`}
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 bg-[#1B4F8A] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#163f6f] active:scale-[0.99] transition-all shadow-card"
          >
            <Plus size={16} /> Generate Certificate
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && stats && <CertificateStats stats={stats} />}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border shadow-card p-4 mt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by certificate number, member name, or title..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={e => { setFilters(prev => ({ ...prev, type: e.target.value as CertificateType | '' })); setPage(1); }}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Types</option>
              {CERTIFICATE_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={e => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-border shadow-card p-8 mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading certificates...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={loadData} className="mt-2 text-sm text-red-600 underline hover:text-red-800">Try again</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Certificate #</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issued</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(cert => (
                  <tr key={cert.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(cert.id)}
                        onChange={() => toggleSelect(cert.id)}
                        className="accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{cert.certificateNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={cert.memberPhoto} alt={cert.memberName} className="w-8 h-8 rounded-full object-cover" />
                        <span>{cert.memberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatCertificateType(cert.type)}</td>
                    <td className="px-4 py-3">{cert.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(cert.issuedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCertificateStatusColor(cert.status)}`}>
                        {formatCertificateStatus(cert.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button 
                          onClick={() => setPreviewCertificate(cert)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleDownload(cert)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={16} className="text-green-600" />
                        </button>
                        {cert.status === 'active' && (
                          <button 
                            onClick={() => {
                              setCertificateToRevoke(cert);
                              setRevokeModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            title="Revoke"
                          >
                            <Ban size={16} className="text-orange-600" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setCertificateToDelete(cert);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {paginated.length === 0 && (
            <div className="p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium text-foreground">No certificates found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || filters.type || filters.status 
                  ? 'Try adjusting your search or filters'
                  : 'Generate your first certificate to get started'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} certificates
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
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && page > 3) {
                    p = page - 3 + i;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={`page-${p}`}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-muted'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-border bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-2xl shadow-modal px-5 py-3 flex items-center gap-4 animate-slide-up z-40">
          <span className="text-sm font-semibold">{selectedIds.size} certificate{selectedIds.size > 1 ? 's' : ''} selected</span>
          <div className="w-px h-4 bg-white/20" />
          <button onClick={() => setSelectedIds(new Set())} className="text-sm hover:text-blue-300 transition-colors">Deselect all</button>
        </div>
      )}

      {/* Certificate Generator Modal */}
      {showGenerator && (
        <CertificateGenerator
          members={members}
          onClose={() => setShowGenerator(false)}
          onGenerate={handleCreateCertificate}
        />
      )}

      {/* Certificate Preview Modal */}
      {previewCertificate && (
        <CertificatePreview
          certificate={previewCertificate}
          onClose={() => setPreviewCertificate(null)}
        />
      )}

      {/* Revoke Modal */}
      {revokeModalOpen && certificateToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-modal max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Revoke Certificate</h3>
              <button onClick={() => setRevokeModalOpen(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                You are about to revoke <strong>{certificateToRevoke.certificateNumber}</strong> for <strong>{certificateToRevoke.memberName}</strong>.
              </p>
              <label className="block text-sm font-medium text-foreground mb-2">Revocation Reason</label>
              <textarea
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="Enter the reason for revoking this certificate..."
                className="w-full p-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!revokeReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Revoke Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && certificateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-modal max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Delete Certificate</h3>
              <button onClick={() => setDeleteModalOpen(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to permanently delete <strong>{certificateToDelete.certificateNumber}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
