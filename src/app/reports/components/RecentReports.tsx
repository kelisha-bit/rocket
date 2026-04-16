'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Trash2,
  Clock,
  User,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

const recentReports = [
  {
    id: 'rpt-001',
    title: 'April 2026 Monthly Summary',
    type: 'Executive Summary',
    generatedBy: 'Pastor John Mensah',
    generatedAt: '2 hours ago',
    size: '2.4 MB',
    format: 'PDF',
    status: 'Completed',
    downloads: 12,
    shared: true,
    category: 'Executive'
  },
  {
    id: 'rpt-002',
    title: 'Q1 2026 Financial Report',
    type: 'Financial Analysis',
    generatedBy: 'Finance Team',
    generatedAt: '1 day ago',
    size: '5.1 MB',
    format: 'Excel',
    status: 'Completed',
    downloads: 8,
    shared: false,
    category: 'Financial'
  },
  {
    id: 'rpt-003',
    title: 'Member Engagement Analysis',
    type: 'Membership Report',
    generatedBy: 'Admin User',
    generatedAt: '2 days ago',
    size: '1.8 MB',
    format: 'PDF',
    status: 'Completed',
    downloads: 15,
    shared: true,
    category: 'Membership'
  },
  {
    id: 'rpt-004',
    title: 'Weekly Attendance Trends',
    type: 'Attendance Analysis',
    generatedBy: 'Secretary Mary',
    generatedAt: '3 days ago',
    size: '892 KB',
    format: 'PDF',
    status: 'Completed',
    downloads: 6,
    shared: false,
    category: 'Attendance'
  },
  {
    id: 'rpt-005',
    title: 'Youth Ministry Report',
    type: 'Ministry Analysis',
    generatedBy: 'Youth Leader',
    generatedAt: '5 days ago',
    size: '3.2 MB',
    format: 'PowerPoint',
    status: 'Processing',
    downloads: 0,
    shared: false,
    category: 'Ministry'
  },
  {
    id: 'rpt-006',
    title: 'Easter Event Summary',
    type: 'Event Report',
    generatedBy: 'Events Team',
    generatedAt: '1 week ago',
    size: '4.7 MB',
    format: 'PDF',
    status: 'Completed',
    downloads: 23,
    shared: true,
    category: 'Events'
  }
];

const statusColors = {
  'Completed': 'bg-green-50 text-green-700 border-green-200',
  'Processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200'
};

const formatColors = {
  'PDF': 'bg-red-50 text-red-700',
  'Excel': 'bg-green-50 text-green-700',
  'PowerPoint': 'bg-orange-50 text-orange-700',
  'Word': 'bg-blue-50 text-blue-700'
};

export default function RecentReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredReports = recentReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || report.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDownload = (report: any) => {
    toast.success('Download Started', { 
      description: `Downloading ${report.title}...` 
    });
  };

  const handleView = (report: any) => {
    toast.info('Opening Report', { 
      description: `Viewing ${report.title}...` 
    });
  };

  const handleShare = (report: any) => {
    toast.success('Report Shared', { 
      description: `Share link copied to clipboard` 
    });
  };

  const handleDelete = (report: any) => {
    toast.error('Report Deleted', { 
      description: `${report.title} has been deleted` 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
          <p className="text-sm text-muted-foreground">
            {filteredReports.length} reports · {filteredReports.reduce((sum, r) => sum + r.downloads, 0)} total downloads
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
                    <span>{report.generatedAt}</span>
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