'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Star, 
  Download, 
  Eye,
  Clock,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const reportTemplates = [
  {
    id: 'monthly-summary',
    title: 'Monthly Church Summary',
    description: 'Comprehensive overview of all church activities and metrics',
    category: 'Executive',
    rating: 4.9,
    downloads: 234,
    lastUpdated: '2 days ago',
    estimatedTime: '5 min',
    featured: true,
    tags: ['Popular', 'Executive', 'Monthly']
  },
  {
    id: 'quarterly-financial',
    title: 'Quarterly Financial Report',
    description: 'Detailed financial analysis with budget comparisons',
    category: 'Financial',
    rating: 4.8,
    downloads: 189,
    lastUpdated: '1 week ago',
    estimatedTime: '8 min',
    featured: true,
    tags: ['Financial', 'Quarterly', 'Budget']
  },
  {
    id: 'member-engagement',
    title: 'Member Engagement Analysis',
    description: 'Track member participation across all church activities',
    category: 'Membership',
    rating: 4.7,
    downloads: 156,
    lastUpdated: '3 days ago',
    estimatedTime: '6 min',
    featured: false,
    tags: ['Members', 'Engagement', 'Analytics']
  },
  {
    id: 'annual-giving',
    title: 'Annual Giving Report',
    description: 'Year-end giving summary with donor recognition',
    category: 'Financial',
    rating: 4.9,
    downloads: 298,
    lastUpdated: '1 day ago',
    estimatedTime: '10 min',
    featured: true,
    tags: ['Annual', 'Giving', 'Donors']
  },
  {
    id: 'ministry-performance',
    title: 'Ministry Performance Dashboard',
    description: 'Track ministry effectiveness and volunteer engagement',
    category: 'Ministry',
    rating: 4.6,
    downloads: 123,
    lastUpdated: '5 days ago',
    estimatedTime: '7 min',
    featured: false,
    tags: ['Ministry', 'Volunteers', 'Performance']
  },
  {
    id: 'attendance-insights',
    title: 'Attendance Insights Report',
    description: 'Deep dive into attendance patterns and trends',
    category: 'Attendance',
    rating: 4.8,
    downloads: 167,
    lastUpdated: '2 days ago',
    estimatedTime: '4 min',
    featured: false,
    tags: ['Attendance', 'Trends', 'Insights']
  }
];

export default function ReportTemplates() {
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  const filteredTemplates = reportTemplates.filter(template => 
    filter === 'All' || template.category === filter
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'Popular':
        return b.downloads - a.downloads;
      case 'Rating':
        return b.rating - a.rating;
      case 'Recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const handleUseTemplate = async (template: any) => {
    try {
      const { generateDetailedReport } = await import('@/lib/report-adapter');
      const reportData = await generateDetailedReport(template.id);
      
      toast.success('Report Generated', { 
        description: `${template.title} has been generated successfully` 
      });
      
      // Open the report in a new window
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
          <html>
            <head>
              <title>${reportData.title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .header { border-bottom: 2px solid #1B4F8A; padding-bottom: 15px; margin-bottom: 25px; }
                .section { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; }
                .metric { display: inline-block; margin: 10px 15px 10px 0; }
                .metric-value { font-size: 24px; font-weight: bold; color: #1B4F8A; display: block; }
                .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
                .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .data-table th, .data-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
                .data-table th { background: #f1f3f4; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${reportData.title}</h1>
                <p>${reportData.description}</p>
                <small>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</small>
              </div>
              
              <div class="section">
                <h2>Summary</h2>
                ${Object.entries(reportData.data).map(([key, value]) => `
                  <div class="metric">
                    <span class="metric-value">${typeof value === 'number' ? value.toLocaleString() : value}</span>
                    <span class="metric-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="section">
                <h2>Detailed Data</h2>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(reportData.data).map(([key, value]) => `
                      <tr>
                        <td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                        <td>${typeof value === 'number' ? value.toLocaleString() : value}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="section">
                <h2>Report Information</h2>
                <p><strong>Generated By:</strong> ${reportData.generatedBy}</p>
                <p><strong>Report Type:</strong> ${reportData.type}</p>
                <p><strong>Category:</strong> ${reportData.category}</p>
                <p><strong>Format:</strong> ${reportData.format}</p>
              </div>
            </body>
          </html>
        `);
        reportWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Generation Failed', { 
        description: 'Failed to generate report. Please try again.' 
      });
    }
  };

  const handlePreviewTemplate = (template: any) => {
    toast.info('Template Preview', { 
      description: `Previewing ${template.title}...` 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Report Templates</h2>
          <p className="text-sm text-muted-foreground">Pre-built report templates for quick generation</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All</option>
            <option>Executive</option>
            <option>Financial</option>
            <option>Membership</option>
            <option>Ministry</option>
            <option>Attendance</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>Popular</option>
            <option>Rating</option>
            <option>Recent</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {sortedTemplates.map(template => (
          <div
            key={template.id}
            className="border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{template.title}</h3>
                      {template.featured && (
                        <Star size={14} className="text-amber-500 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-500" />
                    <span>{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download size={10} />
                    <span>{template.downloads} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>Updated {template.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex items-center gap-1 text-xs bg-primary text-white py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Download size={12} />
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}