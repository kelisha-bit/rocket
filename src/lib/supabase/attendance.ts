import { createClient } from './client';

export type ServiceType = 'Sunday Service' | 'Midweek Service' | 'Cell Group' | 'Special Event' | 'Prayer Meeting';

export interface AttendanceRecord {
  id: string;
  date: string;
  service: ServiceType;
  location: string;
  total: number;
  men: number;
  women: number;
  children: number;
  first_timers: number;
  visitors: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

// Transform database record to frontend format
export function transformAttendanceRecord(dbRecord: any): AttendanceRecord {
  return {
    id: dbRecord.id,
    date: dbRecord.date,
    service: dbRecord.service,
    location: dbRecord.location,
    total: dbRecord.total,
    men: dbRecord.men,
    women: dbRecord.women,
    children: dbRecord.children,
    first_timers: dbRecord.first_timers,
    visitors: dbRecord.visitors,
    notes: dbRecord.notes,
    recorded_by: dbRecord.recorded_by,
    created_at: dbRecord.created_at,
    updated_at: dbRecord.updated_at,
  };
}

// Fetch all attendance records
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }

  return data ? data.map(transformAttendanceRecord) : [];
}

// Fetch attendance records by service type
export async function fetchAttendanceByService(service: ServiceType): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('service', service)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance by service:', error);
    throw error;
  }

  return data ? data.map(transformAttendanceRecord) : [];
}

// Fetch attendance records by date range
export async function fetchAttendanceByDateRange(
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance by date range:', error);
    throw error;
  }

  return data ? data.map(transformAttendanceRecord) : [];
}

// Fetch a single attendance record by ID
export async function fetchAttendanceById(id: string): Promise<AttendanceRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching attendance record:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data ? transformAttendanceRecord(data) : null;
}

// Create a new attendance record
export async function createAttendanceRecord(recordData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    date: recordData.date,
    service: recordData.service,
    location: recordData.location,
    total: recordData.total,
    men: recordData.men,
    women: recordData.women,
    children: recordData.children,
    first_timers: recordData.first_timers,
    visitors: recordData.visitors,
    notes: recordData.notes,
    recorded_by: recordData.recorded_by,
  };

  const { data, error } = await supabase
    .from('attendance')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }

  return transformAttendanceRecord(data);
}

// Update an existing attendance record
export async function updateAttendanceRecord(id: string, recordData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
  const supabase = createClient();
  
  // Prepare data for database
  const dbData = {
    date: recordData.date,
    service: recordData.service,
    location: recordData.location,
    total: recordData.total,
    men: recordData.men,
    women: recordData.women,
    children: recordData.children,
    first_timers: recordData.first_timers,
    visitors: recordData.visitors,
    notes: recordData.notes,
  };

  const { data, error } = await supabase
    .from('attendance')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }

  return transformAttendanceRecord(data);
}

// Delete an attendance record
export async function deleteAttendanceRecord(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
}

// Get attendance summary
export async function getAttendanceSummary(startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('attendance')
    .select('total, first_timers, visitors, men, women, children');

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }

  const totalAttendance = data?.reduce((sum, r) => sum + r.total, 0) || 0;
  const totalFirstTimers = data?.reduce((sum, r) => sum + r.first_timers, 0) || 0;
  const totalVisitors = data?.reduce((sum, r) => sum + r.visitors, 0) || 0;
  const totalMen = data?.reduce((sum, r) => sum + r.men, 0) || 0;
  const totalWomen = data?.reduce((sum, r) => sum + r.women, 0) || 0;
  const totalChildren = data?.reduce((sum, r) => sum + r.children, 0) || 0;
  const avgAttendance = data && data.length > 0 ? Math.round(totalAttendance / data.length) : 0;

  return {
    totalAttendance,
    totalFirstTimers,
    totalVisitors,
    totalMen,
    totalWomen,
    totalChildren,
    avgAttendance,
    recordCount: data?.length || 0,
  };
}

// Get service breakdown
export async function getServiceBreakdown(startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('attendance')
    .select('service, total');

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching service breakdown:', error);
    throw error;
  }

  // Group by service
  const breakdown = data?.reduce((acc, r) => {
    if (!acc[r.service]) {
      acc[r.service] = { total: 0, count: 0 };
    }
    acc[r.service].total += r.total;
    acc[r.service].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return breakdown || {};
}

// Get latest attendance record
export async function getLatestAttendance(): Promise<AttendanceRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest attendance:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data ? transformAttendanceRecord(data) : null;
}

// Get attendance trend (compare periods)
export async function getAttendanceTrend(currentStartDate: string, currentEndDate: string, previousStartDate: string, previousEndDate: string) {
  const supabase = createClient();
  
  // Fetch current period
  const { data: currentData, error: currentError } = await supabase
    .from('attendance')
    .select('total')
    .gte('date', currentStartDate)
    .lte('date', currentEndDate);

  if (currentError) {
    console.error('Error fetching current period:', currentError);
    throw currentError;
  }

  // Fetch previous period
  const { data: previousData, error: previousError } = await supabase
    .from('attendance')
    .select('total')
    .gte('date', previousStartDate)
    .lte('date', previousEndDate);

  if (previousError) {
    console.error('Error fetching previous period:', previousError);
    throw previousError;
  }

  const currentTotal = currentData?.reduce((sum, r) => sum + r.total, 0) || 0;
  const previousTotal = previousData?.reduce((sum, r) => sum + r.total, 0) || 0;
  
  const trend = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return {
    currentTotal,
    previousTotal,
    trend,
  };
}
