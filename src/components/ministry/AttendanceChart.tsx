'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MinistryAttendance } from '@/lib/supabase/ministry-analytics';

interface AttendanceChartProps {
  attendance: MinistryAttendance[];
  loading?: boolean;
}

export default function AttendanceChart({ attendance, loading }: AttendanceChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (attendance.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No attendance records found</p>
      </div>
    );
  }

  const maxAttendance = Math.max(...attendance.map(a => a.present_count));
  const averageRate = attendance.reduce((sum, a) => sum + a.attendance_rate, 0) / attendance.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Average Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(averageRate)}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {attendance.slice(0, 8).map((record, index) => {
          const barWidth = maxAttendance > 0 ? (record.present_count / maxAttendance) * 100 : 0;
          const prevRate = index < attendance.length - 1 ? attendance[index + 1].attendance_rate : record.attendance_rate;
          const trend = record.attendance_rate > prevRate;

          return (
            <div key={record.session_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">{formatDate(record.date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">
                    {record.present_count}/{record.total_members}
                  </span>
                  <span className={`flex items-center gap-1 ${trend ? 'text-green-600' : 'text-red-600'}`}>
                    {trend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.round(record.attendance_rate)}%
                  </span>
                </div>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-gray-700">{record.session_type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
