'use client';

import React from 'react';
import { RefreshCw, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

export default function DashboardHeader() {
  const { stats, loading, refresh, lastRefreshed } = useDashboard();

  const handleRefresh = async () => {
    await refresh();
    toast.success('Dashboard refreshed', { description: 'Latest metrics loaded.' });
  };

  const handleExport = () => {
    toast.info('Export started', { description: 'Dashboard report will be ready shortly.' });
  };

  const refreshLabel = lastRefreshed
    ? `Updated ${lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : 'Loading...';

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Church Dashboard</h1>
          <div className="flex items-center gap-2">
            {!loading && stats.newMembersThisMonth > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                <TrendingUp size={12} />
                +{stats.newMembersThisMonth} new this month
              </div>
            )}
            {!loading && stats.birthdaysThisWeek.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                <AlertTriangle size={12} />
                {stats.birthdaysThisWeek.length} birthday{stats.birthdaysThisWeek.length !== 1 ? 's' : ''} this week
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Greater Works City Church · Accra, Ghana &nbsp;·&nbsp;
          <span className="font-medium text-foreground">{today}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-white border border-border rounded-lg px-3 py-1.5 shadow-card">
          <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          {loading ? 'Loading...' : refreshLabel}
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-muted transition-colors shadow-card disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-muted transition-colors shadow-card"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
}
