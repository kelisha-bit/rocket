'use client';

import React from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  BookOpen,
  Home,
  UsersRound,
  BarChart3,
  FileText,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const reportCategories = [
  {
    id: 'financial',
    title: 'Financial Reports',
    description: 'Giving, tithes, offerings, and budget analysis',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    count: 12,
    reports: [
      'Monthly Giving Summary',
      'Tithe Analysis',
      'Budget vs Actual',
      'Donor Reports',
      'Financial Trends'
    ]
  },
  {
    id: 'membership',
    title: 'Membership Reports',
    description: 'Member demographics, growth, and engagement',
    icon: <Users size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    count: 8,
    reports: [
      'Member Directory',
      'Growth Analysis',
      'Demographics Report',
      'New Member Report',
      'Inactive Members'
    ]
  },
  {
    id: 'attendance',
    title: 'Attendance Reports',
    description: 'Service attendance, trends, and patterns',
    icon: <BookOpen size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    count: 6,
    reports: [
      'Weekly Attendance',
      'Attendance Trends',
      'Service Comparison',
      'Member Attendance',
      'Seasonal Analysis'
    ]
  },
  {
    id: 'events',
    title: 'Events & Programs',
    description: 'Event participation and program effectiveness',
    icon: <Calendar size={20} className="text-amber-600" />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    count: 5,
    reports: [
      'Event Summary',
      'Program Participation',
      'Event ROI Analysis',
      'Venue Utilization',
      'Registration Reports'
    ]
  },
  {
    id: 'cellgroups',
    title: 'Cell Group Reports',
    description: 'Cell group activities and member engagement',
    icon: <Home size={20} className="text-teal-600" />,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    count: 4,
    reports: [
      'Cell Group Summary',
      'Leader Performance',
      'Member Distribution',
      'Growth Tracking'
    ]
  },
  {
    id: 'ministries',
    title: 'Ministry Reports',
    description: 'Ministry participation and impact analysis',
    icon: <UsersRound size={20} className="text-indigo-600" />,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    count: 7,
    reports: [
      'Ministry Overview',
      'Volunteer Reports',
      'Ministry Growth',
      'Resource Allocation',
      'Impact Assessment'
    ]
  }
];

export default function ReportCategories() {
  const handleCategoryClick = (category: any) => {
    toast.info('Opening Category', { 
      description: `Viewing ${category.title} reports...` 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Report Categories</h2>
          <p className="text-sm text-muted-foreground">Browse reports by category</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <BarChart3 size={16} />
          <span>{reportCategories.reduce((sum, cat) => sum + cat.count, 0)} total reports</span>
        </div>
      </div>

      <div className="space-y-3">
        {reportCategories.map(category => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`border ${category.borderColor} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
                {category.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{category.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                      {category.count} reports
                    </span>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {category.reports.slice(0, 3).map((report, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                    >
                      {report}
                    </span>
                  ))}
                  {category.reports.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{category.reports.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}