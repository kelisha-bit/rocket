'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getReportStats, ReportStats } from '@/lib/report-adapter';

export default function ReportsHeader() {
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('All Reports');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await getReportStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    // Navigate to report builder
    window.location.href = '/reports/builder';
  };

  const handleBulkExport = () => {
    toast.success('Bulk Export Started', { description: 'All reports will be exported to ZIP file.' });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive reports for church operations
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-3">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading stats...</span>
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-green-600" />
                <span className="text-muted-foreground">{stats.totalReports} reports generated</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-muted-foreground">+{stats.monthlyGrowth}% this month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-purple-600" />
                <span className="text-muted-foreground">{stats.activeUsers} active users</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Download size={16} className="text-amber-600" />
                <span className="text-muted-foreground">{stats.totalDownloads} downloads</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>Last Quarter</option>
          <option>This Year</option>
          <option>Last Year</option>
          <option>Custom Range</option>
        </select>

        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="bg-white border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
        >
          <option>All Reports</option>
          <option>Financial Reports</option>
          <option>Attendance Reports</option>
          <option>Member Reports</option>
          <option>Ministry Reports</option>
        </select>

        <button className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card">
          <Filter size={14} />
          Advanced Filters
        </button>

        <button
          onClick={handleBulkExport}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
        >
          <Download size={14} />
          Bulk Export
        </button>
        
        <button
          onClick={handleCreateReport}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors shadow-card"
        >
          <Plus size={14} />
          Create Report
        </button>
      </div>
    </div>
  );
}