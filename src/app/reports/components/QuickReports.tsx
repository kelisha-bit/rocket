'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Eye,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  fetchQuickReportMetrics, 
  QuickReportMetric, 
  generateReport, 
  downloadReport,
  ReportFormat 
} from '@/lib/reports-adapter';

const iconMap: Record<string, React.ReactNode> = {
  'monthly-giving': <DollarSign size={20} className="text-green-600" />,
  'attendance-trends': <Users size={20} className="text-blue-600" />,
  'member-growth': <TrendingUp size={20} className="text-purple-600" />,
  'events-summary': <Calendar size={20} className="text-amber-600" />,
};

const bgColorMap: Record<string, string> = {
  'monthly-giving': 'bg-green-50',
  'attendance-trends': 'bg-blue-50',
  'member-growth': 'bg-purple-50',
  'events-summary': 'bg-amber-50',
};

const typeLabelMap: Record<string, string> = {
  'financial': 'Financial',
  'attendance': 'Attendance',
  'membership': 'Members',
  'events': 'Events',
};

export default function QuickReports() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<QuickReportMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchQuickReportMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load quick report metrics:', error);
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (metric: QuickReportMetric) => {
    try {
      setGenerating(metric.id);
      const format: ReportFormat = 'PDF';
      const report = await generateReport(metric.title, metric.type, format);
      
      // Auto download after generation
      downloadReport(report);
      
      toast.success('Report Generated & Downloaded', { 
        description: `${report.title} has been generated and downloaded as ${format}.` 
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const handleViewReport = (metric: QuickReportMetric) => {
    // Navigate to appropriate page based on report type
    switch (metric.type) {
      case 'financial':
        router.push('/finance');
        break;
      case 'attendance':
        router.push('/attendance');
        break;
      case 'membership':
        router.push('/member-management');
        break;
      case 'events':
        router.push('/events');
        break;
      default:
        toast.info('Navigate to detailed view', { 
          description: `Viewing ${metric.title} data...` 
        });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick Reports</h2>
          <p className="text-sm text-muted-foreground">Generate commonly used reports instantly</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-16 h-5 bg-gray-200 rounded" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-3" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-gray-200 rounded" />
                <div className="flex-1 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${bgColorMap[metric.id] || 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                  {iconMap[metric.id] || <TrendingUp size={20} className="text-gray-600" />}
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                  {typeLabelMap[metric.type] || metric.type}
                </span>
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-1">{metric.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {metric.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-foreground">{metric.value}</span>
                  <span className={`ml-2 text-xs font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 
                    metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  <span>Updated {metric.lastUpdated}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewReport(metric)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Eye size={12} />
                  View
                </button>
                <button
                  onClick={() => handleGenerateReport(metric)}
                  disabled={generating === metric.id}
                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating === metric.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  {generating === metric.id ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}