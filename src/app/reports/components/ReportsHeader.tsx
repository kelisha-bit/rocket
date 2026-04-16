'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus,
  BarChart3,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsHeader() {
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('All Reports');

  const handleCreateReport = () => {
    toast.info('Report Builder', { description: 'Opening custom report builder...' });
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
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 size={16} className="text-green-600" />
            <span className="text-muted-foreground">47 reports generated</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-muted-foreground">+23% this month</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} className="text-purple-600" />
            <span className="text-muted-foreground">12 active users</span>
          </div>
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