'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Share2,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsHeaderProps {
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  comparisonPeriod: string;
  onComparisonChange: (period: string) => void;
}

const timeframes = [
  { id: '3_months', label: 'Last 3 Months' },
  { id: '6_months', label: 'Last 6 Months' },
  { id: '12_months', label: 'Last 12 Months' },
  { id: '2_years', label: 'Last 2 Years' },
  { id: 'custom', label: 'Custom Range' }
];

const comparisonPeriods = [
  { id: 'previous_period', label: 'Previous Period' },
  { id: 'previous_year', label: 'Previous Year' },
  { id: 'budget', label: 'Budget/Target' },
  { id: 'industry_avg', label: 'Industry Average' }
];

export default function AnalyticsHeader({ 
  timeframe, 
  onTimeframeChange, 
  comparisonPeriod, 
  onComparisonChange 
}: AnalyticsHeaderProps) {
  
  const handleExport = () => {
    toast.success('Export Started', { 
      description: 'Analytics report will be downloaded shortly.' 
    });
  };

  const handleShare = () => {
    toast.success('Share Link Created', { 
      description: 'Analytics dashboard link copied to clipboard.' 
    });
  };

  const handleRefresh = () => {
    toast.info('Refreshing Data', { 
      description: 'Updating analytics with latest data...' 
    });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Advanced insights and predictive analytics for church operations
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-muted-foreground">Growth Rate: +12.4%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-muted-foreground">Data Range: 12 months</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 size={16} className="text-purple-600" />
            <span className="text-muted-foreground">15 KPIs tracked</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={timeframe}
          onChange={(e) => onTimeframeChange(e.target.value)}
          className="bg-white border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
        >
          {timeframes.map(tf => (
            <option key={tf.id} value={tf.id}>{tf.label}</option>
          ))}
        </select>

        <select
          value={comparisonPeriod}
          onChange={(e) => onComparisonChange(e.target.value)}
          className="bg-white border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-card"
        >
          <option value="">Compare to...</option>
          {comparisonPeriods.map(cp => (
            <option key={cp.id} value={cp.id}>{cp.label}</option>
          ))}
        </select>

        <button className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card">
          <Filter size={14} />
          Advanced Filters
        </button>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
        >
          <RefreshCw size={14} />
          Refresh
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors shadow-card"
        >
          <Share2 size={14} />
          Share
        </button>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors shadow-card"
        >
          <Download size={14} />
          Export Analytics
        </button>
      </div>
    </div>
  );
}