'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Trash2,
  Clock,
  User,
  Filter,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  fetchGeneratedReports, 
  deleteGeneratedReport, 
  downloadReport,
  GeneratedReport,
  ReportFormat
} from '@/lib/reports-adapter';

const statusColors = {
  'Completed': 'bg-green-50 text-green-700 border-green-200',
  'Processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200'
};

const formatColors: Record<ReportFormat | string, string> = {
  'PDF': 'bg-red-50 text-red-700',
  'Excel': 'bg-green-50 text-green-700',
  'CSV': 'bg-blue-50 text-blue-700',
  'PowerPoint': 'bg-orange-50 text-orange-700',
  'Word': 'bg-blue-50 text-blue-700'
};

export default function RecentReports() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchGeneratedReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || report.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDownload = async (report: GeneratedReport) => {
    if (report.status !== 'Completed') {
      toast.error('Report not ready', { description: 'Please wait for the report to complete processing.' });
      return;
    }

    try {
      setDownloadingId(report.id);
      downloadReport(report);
      
      // Refresh to get updated download count
      await loadReports();
      
      toast.success('Download Started', { 
        description: `Downloading ${report.title}...` 
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (report: GeneratedReport) => {
    if (report.status !== 'Completed') {
      toast.info('Report processing', { description: 'This report is still being generated.' });
      return;
    }

    if (report.data) {
      // Open data in a new window as JSON
      const dataStr = JSON.stringify(report.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.info('Opening Report', { description: `Viewing ${report.title} data...` });
    } else {
      toast.info('No data available', { description: 'This report has no viewable data.' });
    }
  };

  const handleShare = async (report: GeneratedReport) => {
    try {
      const shareData = {
        title: report.title,
        type: report.type,
        generatedAt: report.generatedAt,
        format: report.format,
      };
      
      await navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
      
      toast.success('Report Shared', { 
        description: `Report details copied to clipboard` 
      });
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDelete = async (report: GeneratedReport) => {
    if (!window.confirm(`Are you sure you want to delete "${report.title}"?`)) {
      return;
    }

    try {
      await deleteGeneratedReport(report.id);
      await loadReports();
      toast.success('Report Deleted', { 
        description: `${report.title} has been deleted` 
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete report');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filteredReports.length} reports · ${filteredReports.reduce((sum, r) => sum + r.downloads, 0)} total downloads`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Failed</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All</option>
            <option>Executive</option>
            <option>Financial</option>
            <option>Membership</option>
            <option>Attendance</option>
            <option>Ministry</option>
            <option>Events</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Report
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Type
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Generated By
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Date
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Downloads
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors group">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${formatColors[report.format as keyof typeof formatColors]}`}>
                          {report.format}
                        </span>
                        <span className="text-xs text-muted-foreground">{report.size}</span>
                        {report.shared && (
                          <Share2 size={12} className="text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-muted-foreground">{report.type}</span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{report.generatedBy}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock size={12} />
                    <span>{formatDate(report.generatedAt)}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusColors[report.status as keyof typeof statusColors]}`}>
                    {report.status}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-medium tabular-nums">{report.downloads}</span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleView(report)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <Eye size={14} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Report"
                      disabled={report.status !== 'Completed'}
                    >
                      <Download size={14} className={report.status === 'Completed' ? 'text-green-600' : 'text-gray-400'} />
                    </button>
                    <button
                      onClick={() => handleShare(report)}
                      className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Share Report"
                    >
                      <Share2 size={14} className="text-purple-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(report)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No reports found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}