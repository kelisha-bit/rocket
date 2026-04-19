import { createClient } from './supabase/client';
import { fetchTransactions, getFinancialSummary } from './supabase/transactions';
import { fetchMembers } from './supabase/members';
import { fetchAttendanceRecords, getAttendanceSummary, getAttendanceTrend } from './supabase/attendance';
import { fetchEvents, getEventStatistics, getUpcomingEvents } from './supabase/events';
import { getSupabaseErrorMessage } from './utils/supabase-errors';

// Report types
export type ReportType = 'financial' | 'attendance' | 'membership' | 'events' | 'ministry' | 'cellgroups';
export type ReportFormat = 'PDF' | 'Excel' | 'CSV';
export type ReportStatus = 'Completed' | 'Processing' | 'Failed';

export interface QuickReportMetric {
  id: string;
  title: string;
  description: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  type: ReportType;
  lastUpdated: string;
}

export interface DashboardStats {
  totalReportsGenerated: number;
  reportsThisMonth: number;
  lastMonthReports: number;
  percentChange: number;
  activeUsers: number;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  category: string;
  generatedBy: string;
  generatedAt: string;
  size: string;
  format: ReportFormat;
  status: ReportStatus;
  downloads: number;
  shared: boolean;
  data?: any;
}

export interface ReportCategoryInfo {
  id: ReportType;
  title: string;
  description: string;
  count: number;
  reports: string[];
}

// Fetch dashboard stats for ReportsHeader
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  
  try {
    // Get count of generated reports from a reports table (if exists)
    // For now, we'll calculate based on available data
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    // Count transactions as proxy for "reports generated"
    const { count: totalCount, error: totalError } = await supabase
      .from('giving_transactions')
      .select('*', { count: 'exact', head: true });

    const { count: thisMonthCount, error: thisMonthError } = await supabase
      .from('giving_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('date', thisMonthStart);

    const { count: lastMonthCount, error: lastMonthError } = await supabase
      .from('giving_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('date', lastMonthStart)
      .lte('date', lastMonthEnd);

    if (totalError || thisMonthError || lastMonthError) {
      throw totalError || thisMonthError || lastMonthError;
    }

    const thisMonth = thisMonthCount || 0;
    const lastMonth = lastMonthCount || 0;
    const percentChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      totalReportsGenerated: totalCount || 0,
      reportsThisMonth: thisMonth,
      lastMonthReports: lastMonth,
      percentChange: Math.round(percentChange * 10) / 10,
      activeUsers: 1, // Could be fetched from auth if needed
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback values
    return {
      totalReportsGenerated: 0,
      reportsThisMonth: 0,
      lastMonthReports: 0,
      percentChange: 0,
      activeUsers: 1,
    };
  }
}

// Fetch quick report metrics with real data
export async function fetchQuickReportMetrics(): Promise<QuickReportMetric[]> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  try {
    // Fetch financial data
    const [currentMonthFinances, lastMonthFinances, members, attendanceRecords, upcomingEvents] = await Promise.all([
      getFinancialSummary(thisMonthStart),
      getFinancialSummary(lastMonthStart, lastMonthEnd),
      fetchMembers(),
      fetchAttendanceRecords(),
      getUpcomingEvents(10),
    ]);

    // Calculate monthly giving
    const currentGiving = currentMonthFinances.income;
    const lastGiving = lastMonthFinances.income;
    const givingChange = lastGiving > 0 ? ((currentGiving - lastGiving) / lastGiving) * 100 : 0;

    // Calculate membership metrics
    const thisMonthMembers = members.filter(m => {
      if (!m.join_date) return false;
      return m.join_date >= thisMonthStart;
    }).length;
    const lastMonthMembers = members.filter(m => {
      if (!m.join_date) return false;
      return m.join_date >= lastMonthStart && m.join_date < thisMonthStart;
    }).length;
    const memberChange = lastMonthMembers > 0 ? ((thisMonthMembers - lastMonthMembers) / lastMonthMembers) * 100 : 0;

    // Calculate attendance (average of last 4 records)
    const recentAttendance = attendanceRecords.slice(0, 4);
    const avgAttendance = recentAttendance.length > 0
      ? recentAttendance.reduce((sum, r) => sum + r.total, 0) / recentAttendance.length
      : 0;

    // Get previous period attendance for comparison
    let attendanceChange = 0;
    if (attendanceRecords.length >= 8) {
      const currentPeriod = attendanceRecords.slice(0, 4).reduce((sum, r) => sum + r.total, 0);
      const previousPeriod = attendanceRecords.slice(4, 8).reduce((sum, r) => sum + r.total, 0);
      attendanceChange = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      if (amount >= 1000000) return `₵${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `₵${(amount / 1000).toFixed(1)}K`;
      return `₵${amount.toLocaleString()}`;
    };

    const metrics: QuickReportMetric[] = [
      {
        id: 'monthly-giving',
        title: 'Monthly Giving Summary',
        description: 'Tithes, offerings, and pledges for current month',
        value: formatCurrency(currentGiving),
        change: `${givingChange >= 0 ? '+' : ''}${givingChange.toFixed(1)}%`,
        changeType: givingChange >= 0 ? 'positive' : 'negative',
        type: 'financial',
        lastUpdated: 'Just now',
      },
      {
        id: 'attendance-trends',
        title: 'Attendance Analysis',
        description: 'Weekly attendance patterns and trends',
        value: `${Math.round(avgAttendance).toLocaleString()}`,
        change: `${attendanceChange >= 0 ? '+' : ''}${attendanceChange.toFixed(1)}%`,
        changeType: attendanceChange >= 0 ? 'positive' : 'negative',
        type: 'attendance',
        lastUpdated: attendanceRecords[0]?.date ? new Date(attendanceRecords[0].date).toLocaleDateString() : 'N/A',
      },
      {
        id: 'member-growth',
        title: 'Membership Growth',
        description: 'New members and retention statistics',
        value: `+${thisMonthMembers}`,
        change: `${memberChange >= 0 ? '+' : ''}${memberChange.toFixed(1)}%`,
        changeType: memberChange >= 0 ? 'positive' : 'negative',
        type: 'membership',
        lastUpdated: 'Just now',
      },
      {
        id: 'events-summary',
        title: 'Events & Programs',
        description: 'Upcoming events and participation rates',
        value: `${upcomingEvents.length} events`,
        change: upcomingEvents.length > 0 ? 'Active' : 'None',
        changeType: upcomingEvents.length > 0 ? 'positive' : 'neutral',
        type: 'events',
        lastUpdated: upcomingEvents[0]?.date ? new Date(upcomingEvents[0].date).toLocaleDateString() : 'N/A',
      },
    ];

    return metrics;
  } catch (error) {
    console.error('Error fetching quick report metrics:', error);
    return getDefaultQuickReportMetrics();
  }
}

// Default metrics when data is unavailable
function getDefaultQuickReportMetrics(): QuickReportMetric[] {
  return [
    {
      id: 'monthly-giving',
      title: 'Monthly Giving Summary',
      description: 'Tithes, offerings, and pledges for current month',
      value: '₵0',
      change: '0%',
      changeType: 'neutral',
      type: 'financial',
      lastUpdated: 'N/A',
    },
    {
      id: 'attendance-trends',
      title: 'Attendance Analysis',
      description: 'Weekly attendance patterns and trends',
      value: '0',
      change: '0%',
      changeType: 'neutral',
      type: 'attendance',
      lastUpdated: 'N/A',
    },
    {
      id: 'member-growth',
      title: 'Membership Growth',
      description: 'New members and retention statistics',
      value: '+0',
      change: '0%',
      changeType: 'neutral',
      type: 'membership',
      lastUpdated: 'N/A',
    },
    {
      id: 'events-summary',
      title: 'Events & Programs',
      description: 'Upcoming events and participation rates',
      value: '0 events',
      change: 'None',
      changeType: 'neutral',
      type: 'events',
      lastUpdated: 'N/A',
    },
  ];
}

// Fetch report categories with real counts
export async function fetchReportCategories(): Promise<ReportCategoryInfo[]> {
  try {
    const [members, attendanceRecords, events, transactions] = await Promise.all([
      fetchMembers(),
      fetchAttendanceRecords(),
      fetchEvents(),
      fetchTransactions(),
    ]);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    return [
      {
        id: 'financial',
        title: 'Financial Reports',
        description: 'Giving, tithes, offerings, and budget analysis',
        count: 5,
        reports: [
          `Monthly Giving (${transactions.filter(t => t.date >= thisMonthStart).length} transactions)`,
          `Total Income: ₵${transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0).toLocaleString()}`,
          `Total Expenses: ₵${transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()}`,
          'Budget vs Actual',
          'Donor Reports',
        ],
      },
      {
        id: 'membership',
        title: 'Membership Reports',
        description: 'Member demographics, growth, and engagement',
        count: 5,
        reports: [
          `Total Members: ${members.length}`,
          `New This Month: ${members.filter(m => m.join_date >= thisMonthStart).length}`,
          'Demographics Report',
          'Member Directory',
          'Inactive Members',
        ],
      },
      {
        id: 'attendance',
        title: 'Attendance Reports',
        description: 'Service attendance, trends, and patterns',
        count: 4,
        reports: [
          `${attendanceRecords.length} Records Available`,
          'Weekly Attendance',
          'Attendance Trends',
          'Service Comparison',
        ],
      },
      {
        id: 'events',
        title: 'Events & Programs',
        description: 'Event participation and program effectiveness',
        count: 3,
        reports: [
          `${events.length} Total Events`,
          'Event Summary',
          'Program Participation',
        ],
      },
      {
        id: 'cellgroups',
        title: 'Cell Group Reports',
        description: 'Cell group activities and member engagement',
        count: 2,
        reports: [
          'Cell Group Summary',
          'Member Distribution',
        ],
      },
      {
        id: 'ministry',
        title: 'Ministry Reports',
        description: 'Ministry participation and impact analysis',
        count: 2,
        reports: [
          'Ministry Overview',
          'Volunteer Reports',
        ],
      },
    ];
  } catch (error) {
    console.error('Error fetching report categories:', error);
    return [];
  }
}

// Generate a report and store it
export async function generateReport(
  title: string,
  type: ReportType,
  format: ReportFormat,
  dateRange?: { start: string; end: string }
): Promise<GeneratedReport> {
  const supabase = createClient();
  
  try {
    // Gather report data based on type
    let reportData: any = {};
    
    switch (type) {
      case 'financial': {
        const finances = await getFinancialSummary(dateRange?.start, dateRange?.end);
        const transactions = await fetchTransactions();
        reportData = {
          summary: finances,
          transactions: dateRange 
            ? transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end)
            : transactions,
        };
        break;
      }
      case 'attendance': {
        const summary = await getAttendanceSummary(dateRange?.start, dateRange?.end);
        const records = await fetchAttendanceRecords();
        reportData = {
          summary,
          records: dateRange
            ? records.filter(r => r.date >= dateRange.start && r.date <= dateRange.end)
            : records,
        };
        break;
      }
      case 'membership': {
        const members = await fetchMembers();
        reportData = { members };
        break;
      }
      case 'events': {
        const events = await fetchEvents();
        reportData = { events };
        break;
      }
      default:
        reportData = {};
    }

    // Create report record
    const report: GeneratedReport = {
      id: `rpt-${Date.now()}`,
      title,
      type: type.charAt(0).toUpperCase() + type.slice(1),
      category: type,
      generatedBy: 'Current User',
      generatedAt: new Date().toISOString(),
      size: format === 'PDF' ? '2.4 MB' : format === 'Excel' ? '1.8 MB' : '892 KB',
      format,
      status: 'Completed',
      downloads: 0,
      shared: false,
      data: reportData,
    };

    // Store in localStorage for persistence (could be Supabase in production)
    const existing = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    existing.unshift(report);
    localStorage.setItem('generatedReports', JSON.stringify(existing.slice(0, 50))); // Keep last 50

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate report: ${getSupabaseErrorMessage(error)}`);
  }
}

// Fetch generated reports
export async function fetchGeneratedReports(): Promise<GeneratedReport[]> {
  try {
    const stored = localStorage.getItem('generatedReports');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error fetching generated reports:', error);
  }
  
  // Return sample data if none exists
  return getSampleReports();
}

// Get sample reports for initial display
function getSampleReports(): GeneratedReport[] {
  return [
    {
      id: 'rpt-001',
      title: 'Monthly Church Summary',
      type: 'Executive Summary',
      category: 'Executive',
      generatedBy: 'System',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      size: '2.4 MB',
      format: 'PDF',
      status: 'Completed',
      downloads: 12,
      shared: true,
    },
    {
      id: 'rpt-002',
      title: 'Financial Overview',
      type: 'Financial Analysis',
      category: 'Financial',
      generatedBy: 'System',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      size: '1.8 MB',
      format: 'Excel',
      status: 'Completed',
      downloads: 8,
      shared: false,
    },
    {
      id: 'rpt-003',
      title: 'Member Directory',
      type: 'Membership Report',
      category: 'Membership',
      generatedBy: 'System',
      generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      size: '892 KB',
      format: 'PDF',
      status: 'Completed',
      downloads: 15,
      shared: true,
    },
  ];
}

// Delete a generated report
export async function deleteGeneratedReport(id: string): Promise<void> {
  const stored = localStorage.getItem('generatedReports');
  if (stored) {
    const reports = JSON.parse(stored);
    const filtered = reports.filter((r: GeneratedReport) => r.id !== id);
    localStorage.setItem('generatedReports', JSON.stringify(filtered));
  }
}

// Download report as file
export function downloadReport(report: GeneratedReport): void {
  // Create CSV/PDF content based on report type
  let content = '';
  let mimeType = '';
  let extension = '';

  if (report.format === 'CSV' && report.data) {
    content = generateCSVContent(report);
    mimeType = 'text/csv';
    extension = 'csv';
  } else if (report.format === 'PDF') {
    // For PDF, we'd typically use a library like jsPDF
    // For now, create a text representation
    content = JSON.stringify(report.data, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  } else {
    content = JSON.stringify(report.data, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.title.replace(/\s+/g, '_')}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Update download count
  const stored = localStorage.getItem('generatedReports');
  if (stored) {
    const reports = JSON.parse(stored);
    const updated = reports.map((r: GeneratedReport) => 
      r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r
    );
    localStorage.setItem('generatedReports', JSON.stringify(updated));
  }
}

// Generate CSV content from report data
function generateCSVContent(report: GeneratedReport): string {
  if (!report.data) return '';

  let csv = '';
  
  if (report.category === 'financial' && report.data.transactions) {
    csv = 'Date,Type,Category,Description,Amount,Method\n';
    report.data.transactions.forEach((t: any) => {
      csv += `${t.date},${t.type},${t.category},"${t.description}",${t.amount},${t.method}\n`;
    });
  } else if (report.category === 'membership' && report.data.members) {
    csv = 'Name,Status,Phone,Email,Join Date\n';
    report.data.members.forEach((m: any) => {
      csv += `"${m.full_name}",${m.status},${m.phone},${m.email},${m.join_date}\n`;
    });
  } else if (report.category === 'attendance' && report.data.records) {
    csv = 'Date,Service,Location,Total,Men,Women,Children,First Timers\n';
    report.data.records.forEach((r: any) => {
      csv += `${r.date},${r.service},${r.location},${r.total},${r.men},${r.women},${r.children},${r.first_timers}\n`;
    });
  }

  return csv;
}

// Export for use in components
export type { TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod } from './supabase/transactions';
export type { Member, MemberStatus } from './supabase/members';
export type { AttendanceRecord, ServiceType } from './supabase/attendance';
export type { ChurchEvent, EventStatus } from './supabase/events';
