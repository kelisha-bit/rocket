'use client';

import React from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Eye,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const quickReports = [
  {
    id: 'monthly-giving',
    title: 'Monthly Giving Summary',
    description: 'Tithes, offerings, and pledges for current month',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50',
    value: '₵68,070',
    change: '+12.4%',
    lastGenerated: '2 hours ago',
    type: 'Financial'
  },
  {
    id: 'attendance-trends',
    title: 'Attendance Analysis',
    description: 'Weekly attendance patterns and trends',
    icon: <Users size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    value: '78.4%',
    change: '-2.1%',
    lastGenerated: '1 day ago',
    type: 'Attendance'
  },
  {
    id: 'member-growth',
    title: 'Membership Growth',
    description: 'New members and retention statistics',
    icon: <TrendingUp size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    value: '+23',
    change: '+15.0%',
    lastGenerated: '3 hours ago',
    type: 'Members'
  },
  {
    id: 'events-summary',
    title: 'Events & Programs',
    description: 'Upcoming events and participation rates',
    icon: <Calendar size={20} className="text-amber-600" />,
    bgColor: 'bg-amber-50',
    value: '7 events',
    change: '+2',
    lastGenerated: '5 hours ago',
    type: 'Events'
  }
];

export default function QuickReports() {
  const handleGenerateReport = (report: any) => {
    toast.success('Generating Report', { 
      description: `${report.title} is being generated...` 
    });
  };

  const handleViewReport = (report: any) => {
    toast.info('Opening Report', { 
      description: `Viewing ${report.title}...` 
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
        {quickReports.map(report => (
          <div
            key={report.id}
            className="border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                {report.icon}
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                {report.type}
              </span>
            </div>

            <h3 className="font-semibold text-foreground text-sm mb-1">{report.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {report.description}
            </p>

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

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewReport(report)}
                className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye size={12} />
                View
              </button>
              <button
                onClick={() => handleGenerateReport(report)}
                className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download size={12} />
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}