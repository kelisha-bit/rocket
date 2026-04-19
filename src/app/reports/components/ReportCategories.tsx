'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  BookOpen,
  Home,
  UsersRound,
  BarChart3,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchReportCategories, ReportCategoryInfo, generateReport, downloadReport } from '@/lib/reports-adapter';

const iconMap: Record<string, React.ReactNode> = {
  'financial': <DollarSign size={20} className="text-green-600" />,
  'membership': <Users size={20} className="text-blue-600" />,
  'attendance': <BookOpen size={20} className="text-purple-600" />,
  'events': <Calendar size={20} className="text-amber-600" />,
  'cellgroups': <Home size={20} className="text-teal-600" />,
  'ministry': <UsersRound size={20} className="text-indigo-600" />,
};

const bgColorMap: Record<string, string> = {
  'financial': 'bg-green-50',
  'membership': 'bg-blue-50',
  'attendance': 'bg-purple-50',
  'events': 'bg-amber-50',
  'cellgroups': 'bg-teal-50',
  'ministry': 'bg-indigo-50',
};

const borderColorMap: Record<string, string> = {
  'financial': 'border-green-200',
  'membership': 'border-blue-200',
  'attendance': 'border-purple-200',
  'events': 'border-amber-200',
  'cellgroups': 'border-teal-200',
  'ministry': 'border-indigo-200',
};

const routeMap: Record<string, string> = {
  'financial': '/finance',
  'membership': '/member-management',
  'attendance': '/attendance',
  'events': '/events',
  'cellgroups': '/cell-groups',
  'ministry': '/ministries',
};

export default function ReportCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<ReportCategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchReportCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load report categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: ReportCategoryInfo) => {
    const route = routeMap[category.id];
    if (route) {
      router.push(route);
    } else {
      toast.info('Opening Category', { 
        description: `Viewing ${category.title}...` 
      });
    }
  };

  const handleQuickGenerate = async (category: ReportCategoryInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setGeneratingId(category.id);
      const report = await generateReport(
        `${category.title} Summary`,
        category.id,
        'PDF'
      );
      downloadReport(report);
      toast.success('Report Generated', { 
        description: `${report.title} downloaded successfully.` 
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingId(null);
    }
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
          <span>{loading ? '...' : categories.reduce((sum: number, cat: ReportCategoryInfo) => sum + cat.count, 0)} total reports</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-5 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="flex flex-wrap gap-1">
                    <div className="h-5 bg-gray-200 rounded w-24" />
                    <div className="h-5 bg-gray-200 rounded w-20" />
                    <div className="h-5 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category: ReportCategoryInfo) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`border ${borderColorMap[category.id] || 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${bgColorMap[category.id] || 'bg-gray-50'} rounded-lg flex items-center justify-center shrink-0`}>
                  {iconMap[category.id] || <FileText size={20} className="text-gray-600" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                        {category.count} reports
                      </span>
                      <button
                        onClick={(e) => handleQuickGenerate(category, e)}
                        disabled={generatingId === category.id}
                        className="text-xs bg-primary text-white px-2 py-1 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {generatingId === category.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          'Generate'
                        )}
                      </button>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {category.reports.slice(0, 3).map((report: string, index: number) => (
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
      )}
    </div>
  );
}