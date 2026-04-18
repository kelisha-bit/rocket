'use client';

import React, { useMemo, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums ml-auto pl-3">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function formatAttendanceDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

function AttendanceTrendChartComponent() {
  const { data, loading } = useDashboard();

  const chartData = useMemo(() => {
    // Group attendance by date, split by service type — last 8 records per service
    const byDate = new Map<string, { sunday_service: number; midweek: number; cell_group: number }>();

    for (const r of data.attendance) {
      const key = r.date;
      if (!byDate.has(key)) byDate.set(key, { sunday_service: 0, midweek: 0, cell_group: 0 });
      const entry = byDate.get(key)!;
      if (r.service === 'Sunday Service') entry.sunday_service += r.total;
      else if (r.service === 'Midweek Service') entry.midweek += r.total;
      else if (r.service === 'Cell Group') entry.cell_group += r.total;
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, vals]) => ({ date: formatAttendanceDate(date), ...vals }));
  }, [data.attendance]);

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Attendance Trend</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `Last ${chartData.length} records — all service types`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[240px] text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading attendance data...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
          No attendance records found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gradSunday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4F8A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1B4F8A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMidweek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9922A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#C9922A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Area type="monotone" dataKey="sunday_service" name="Sunday Service" stroke="#1B4F8A" strokeWidth={2} fill="url(#gradSunday)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="midweek" name="Midweek Service" stroke="#C9922A" strokeWidth={2} fill="url(#gradMidweek)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="cell_group" name="Cell Group" stroke="#7C3AED" strokeWidth={2} fill="url(#gradCell)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const AttendanceTrendChart = memo(AttendanceTrendChartComponent);
export default AttendanceTrendChart;
