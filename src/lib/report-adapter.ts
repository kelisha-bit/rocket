import { createClient } from '@/lib/supabase/client';

export interface ReportData {
  id: string;
  title: string;
  type: string;
  category: string;
  generatedBy: string;
  generatedAt: string;
  size: string;
  format: string;
  status: 'Completed' | 'Processing' | 'Failed';
  downloads: number;
  shared: boolean;
  data: any;
  description?: string;
}

export interface QuickReportData {
  id: string;
  title: string;
  description: string;
  type: string;
  value: string;
  change: string;
  lastGenerated: string;
  data: any;
}

export interface ReportStats {
  totalReports: number;
  totalDownloads: number;
  monthlyGrowth: number;
  activeUsers: number;
}

// Mock data for now - in a real app, this would come from the database
const mockReports: ReportData[] = [
  {
    id: 'rpt-001',
    title: 'April 2026 Monthly Summary',
    type: 'Executive Summary',
    category: 'Executive',
    generatedBy: 'Pastor John Mensah',
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    size: '2.4 MB',
    format: 'PDF',
    status: 'Completed',
    downloads: 12,
    shared: true,
    data: {
      totalMembers: 1247,
      newMembers: 23,
      totalGiving: 68070,
      averageAttendance: 78.4,
      events: 7
    }
  },
  {
    id: 'rpt-002',
    title: 'Q1 2026 Financial Report',
    type: 'Financial Analysis',
    category: 'Financial',
    generatedBy: 'Finance Team',
    generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: '5.1 MB',
    format: 'Excel',
    status: 'Completed',
    downloads: 8,
    shared: false,
    data: {
      totalIncome: 204210,
      totalExpenses: 156780,
      netIncome: 47430,
      budgetVariance: 12.4
    }
  }
];

export async function fetchReports(): Promise<ReportData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockReports;
}

export async function generateQuickReport(reportId: string): Promise<QuickReportData> {
  const supabase = createClient();
  
  try {
    switch (reportId) {
      case 'monthly-giving':
        // Get giving data from the last 30 days
        const { data: givingData } = await supabase
          .from('giving_transactions')
          .select('amount, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        const totalGiving = givingData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;
        const previousMonthGiving = totalGiving * 0.89; // Mock previous month data
        const change = ((totalGiving - previousMonthGiving) / previousMonthGiving * 100).toFixed(1);
        
        return {
          id: reportId,
          title: 'Monthly Giving Summary',
          description: 'Tithes, offerings, and pledges for current month',
          type: 'Financial',
          value: `₵${totalGiving.toLocaleString()}`,
          change: `+${change}%`,
          lastGenerated: 'Just now',
          data: {
            totalGiving,
            transactionCount: givingData?.length || 0,
            averageGiving: givingData?.length ? totalGiving / givingData.length : 0
          }
        };

      case 'attendance-trends':
        // Get attendance data
        const { data: attendanceData } = await supabase
          .from('attendance_sessions')
          .select('total_present, total_expected, session_date')
          .gte('session_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        const totalPresent = attendanceData?.reduce((sum, session) => sum + (session.total_present || 0), 0) || 0;
        const totalExpected = attendanceData?.reduce((sum, session) => sum + (session.total_expected || 0), 0) || 0;
        const attendanceRate = totalExpected > 0 ? (totalPresent / totalExpected * 100).toFixed(1) : '0';
        
        return {
          id: reportId,
          title: 'Attendance Analysis',
          description: 'Weekly attendance patterns and trends',
          type: 'Attendance',
          value: `${attendanceRate}%`,
          change: '-2.1%',
          lastGenerated: '1 day ago',
          data: {
            totalPresent,
            totalExpected,
            attendanceRate: parseFloat(attendanceRate),
            sessionsCount: attendanceData?.length || 0
          }
        };

      case 'member-growth':
        // Get member data
        const { data: memberData } = await supabase
          .from('members')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        const newMembers = memberData?.length || 0;
        
        return {
          id: reportId,
          title: 'Membership Growth',
          description: 'New members and retention statistics',
          type: 'Members',
          value: `+${newMembers}`,
          change: '+15.0%',
          lastGenerated: '3 hours ago',
          data: {
            newMembers,
            growthRate: 15.0
          }
        };

      case 'events-summary':
        // Get events data
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString());
        
        const upcomingEvents = eventsData?.length || 0;
        
        return {
          id: reportId,
          title: 'Events & Programs',
          description: 'Upcoming events and participation rates',
          type: 'Events',
          value: `${upcomingEvents} events`,
          change: '+2',
          lastGenerated: '5 hours ago',
          data: {
            upcomingEvents,
            events: eventsData || []
          }
        };

      default:
        throw new Error('Unknown report type');
    }
  } catch (error) {
    console.error('Error generating quick report:', error);
    // Return mock data as fallback
    return {
      id: reportId,
      title: 'Report',
      description: 'Report description',
      type: 'General',
      value: 'N/A',
      change: '0%',
      lastGenerated: 'Error',
      data: {}
    };
  }
}

export async function generateDetailedReport(templateId: string, options: any = {}): Promise<ReportData> {
  const supabase = createClient();
  
  try {
    let reportData: any = {};
    let title = '';
    let description = '';
    
    switch (templateId) {
      case 'monthly-summary':
        // Fetch comprehensive monthly data
        const [members, giving, attendance, events] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('giving_transactions').select('*').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('attendance_sessions').select('*').gte('session_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('events').select('*').gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);
        
        title = 'Monthly Church Summary';
        description = 'Comprehensive overview of all church activities and metrics';
        reportData = {
          totalMembers: members.data?.length || 0,
          newMembers: members.data?.filter(m => new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
          totalGiving: giving.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
          givingTransactions: giving.data?.length || 0,
          attendanceSessions: attendance.data?.length || 0,
          averageAttendance: attendance.data?.length ? 
            attendance.data.reduce((sum, s) => sum + (s.total_present || 0), 0) / attendance.data.length : 0,
          totalEvents: events.data?.length || 0,
          period: 'Last 30 days'
        };
        break;
        
      case 'quarterly-financial':
        // Fetch quarterly financial data
        const { data: quarterlyGiving } = await supabase
          .from('giving_transactions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
        
        title = 'Quarterly Financial Report';
        description = 'Detailed financial analysis with budget comparisons';
        reportData = {
          totalIncome: quarterlyGiving?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
          transactionCount: quarterlyGiving?.length || 0,
          averageTransaction: quarterlyGiving?.length ? 
            (quarterlyGiving.reduce((sum, t) => sum + (t.amount || 0), 0) / quarterlyGiving.length) : 0,
          period: 'Last 90 days'
        };
        break;
        
      default:
        title = 'Custom Report';
        description = 'Generated report';
        reportData = { message: 'Report generated successfully' };
    }
    
    const newReport: ReportData = {
      id: `rpt-${Date.now()}`,
      title,
      type: description,
      category: 'Generated',
      generatedBy: 'Current User',
      generatedAt: new Date().toISOString(),
      size: '1.2 MB',
      format: 'PDF',
      status: 'Completed',
      downloads: 0,
      shared: false,
      data: reportData,
      description
    };
    
    return newReport;
  } catch (error) {
    console.error('Error generating detailed report:', error);
    throw error;
  }
}

export async function getReportStats(): Promise<ReportStats> {
  // In a real app, this would query the database
  return {
    totalReports: 47,
    totalDownloads: 234,
    monthlyGrowth: 23,
    activeUsers: 12
  };
}

export function downloadReport(report: ReportData): void {
  // Create a simple text report for download
  const reportContent = `
${report.title}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Type: ${report.type}
Category: ${report.category}

Report Data:
${JSON.stringify(report.data, null, 2)}
  `;
  
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function shareReport(report: ReportData): string {
  // Generate a shareable link (in a real app, this would create a secure share token)
  const shareUrl = `${window.location.origin}/reports/shared/${report.id}`;
  navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}