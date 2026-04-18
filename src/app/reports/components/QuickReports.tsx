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
import { generateQuickReport, downloadReport, QuickReportData } from '@/lib/report-adapter';

const quickReportConfigs = [
  {
    id: 'monthly-giving',
    title: 'Monthly Giving Summary',
    description: 'Tithes, offerings, and pledges for current month',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50',
    type: 'Financial'
  },
  {
    id: 'attendance-trends',
    title: 'Attendance Analysis',
    description: 'Weekly attendance patterns and trends',
    icon: <Users size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    type: 'Attendance'
  },
  {
    id: 'member-growth',
    title: 'Membership Growth',
    description: 'New members and retention statistics',
    icon: <TrendingUp size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    type: 'Members'
  },
  {
    id: 'events-summary',
    title: 'Events & Programs',
    description: 'Upcoming events and participation rates',
    icon: <Calendar size={20} className="text-amber-600" />,
    bgColor: 'bg-amber-50',
    type: 'Events'
  }
];

export default function QuickReports() {
  const [reports, setReports] = useState<Record<string, QuickReportData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleGenerateReport = async (reportId: string) => {
    setLoading(prev => ({ ...prev, [reportId]: true }));
    
    try {
      const reportData = await generateQuickReport(reportId);
      setReports(prev => ({ ...prev, [reportId]: reportData }));
      toast.success('Report Generated', { 
        description: `${reportData.title} has been generated successfully` 
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Generation Failed', { 
        description: 'Failed to generate report. Please try again.' 
      });
    } finally {
      setLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleViewReport = (reportId: string) => {
    const report = reports[reportId];
    if (!report) {
      toast.error('No Data', { description: 'Please generate the report first' });
      return;
    }
    
    // Create a simple report view
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { border-bottom: 2px solid #1B4F8A; padding-bottom: 10px; margin-bottom: 20px; }
              .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
              .value { font-size: 24px; font-weight: bold; color: #1B4F8A; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${report.title}</h1>
              <p>${report.description}</p>
              <small>Generated: ${report.lastGenerated}</small>
            </div>
            <div class="metric">
              <h3>Current Value</h3>
              <div class="value">${report.value}</div>
              <p>Change: ${report.change}</p>
            </div>
            <div class="metric">
              <h3>Raw Data</h3>
              <pre>${JSON.stringify(report.data, null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  const handleDownloadReport = (reportId: string) => {
    const report = reports[reportId];
    if (!report) {
      toast.error('No Data', { description: 'Please generate the report first' });
      return;
    }
    
    const reportData = {
      id: report.id,
      title: report.title,
      type: report.type,
      category: report.type,
      generatedBy: 'Current User',
      generatedAt: new Date().toISOString(),
      size: '1.0 MB',
      format: 'TXT',
      status: 'Completed' as const,
      downloads: 0,
      shared: false,
      data: report.data,
      description: report.description
    };
    
    downloadReport(reportData);
    toast.success('Download Started', { 
      description: `${report.title} is being downloaded` 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick Reports</h2>
          <p className="text-sm text-muted-foreground">Generate commonly used reports instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReportConfigs.map(config => {
          const report = reports[config.id];
          const isLoading = loading[config.id];
          
          return (
            <div
              key={config.id}
              className="border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                  {config.icon}
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                  {config.type}
                </span>
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-1">{config.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {config.description}
              </p>

              {report && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-foreground">{report.value}</span>
                      <span className={`ml-2 text-xs font-medium ${
                        report.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {report.change}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>Updated {report.lastGenerated}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                {report ? (
                  <>
                    <button
                      onClick={() => handleViewReport(config.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadReport(config.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleGenerateReport(config.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        Generate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}