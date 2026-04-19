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
import { useRouter } from 'next/navigation';
import { fetchDashboardStats, DashboardStats } from '@/lib/reports-adapter';

export default function ReportsHeader() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('All Reports');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    router.push('/reports/builder');
  };

  const handleBulkExport = () => {
    toast.success('Bulk Export Started', { description: 'All reports will be exported to CSV format.' });
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading stats...</span>
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-green-600" />
                <span className="text-muted-foreground">{stats.totalReportsGenerated} transactions recorded</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} className={stats.percentChange >= 0 ? 'text-blue-600' : 'text-red-600'} />
                <span className={`font-medium ${stats.percentChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.percentChange >= 0 ? '+' : ''}{stats.percentChange}% this month
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-purple-600" />
                <span className="text-muted-foreground">{stats.activeUsers} active user{stats.activeUsers !== 1 ? 's' : ''}</span>
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Stats unavailable</span>
          )}
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