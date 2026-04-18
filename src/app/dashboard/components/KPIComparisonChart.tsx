'use client';

import React, { useState, useMemo, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const kpiOptions = [
  { key: 'giving', label: 'Total Giving (₵)', color: '#C9922A', format: (v: number) => `₵${(v / 1000).toFixed(0)}k` },
  { key: 'attendance', label: 'Sunday Attendance', color: '#1B4F8A', format: (v: number) => v.toLocaleString() },
  { key: 'newMembers', label: 'New Members', color: '#7C3AED', format: (v: number) => v.toString() },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => {
        const kpi = kpiOptions.find(k => k.key === entry.dataKey);
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: entry.color }} />
            <span className="text-muted-foreground text-xs">{kpi?.label}:</span>
            <span className="font-semibold tabular-nums ml-auto pl-3 text-xs">
              {kpi?.format(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function KPIComparisonChartComponent() {
  const [selectedKPIs, setSelectedKPIs] = useState(['giving', 'attendance']);
  const { data, loading } = useDashboard();

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    return months.map(({ year, month }) => {
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      const giving = data.transactions
        .filter(t => t.type === 'income' && t.date >= start && t.date <= end)
        .reduce((s, t) => s + t.amount, 0);

      const sundayAttendance = data.attendance
        .filter(r => r.service === 'Sunday Service' && r.date >= start && r.date <= end)
        .reduce((s, r) => s + r.total, 0);

      const newMembers = data.members.filter(m => {
        if (!m.joinDate) return false;
        try {
          let iso: string;
          if (/^\d{4}-\d{2}-\d{2}$/.test(m.joinDate)) {
            iso = m.joinDate;
          } else {
            const parts = m.joinDate.split('/');
            if (parts.length !== 3) return false;
            iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          return iso >= start && iso <= end;
        } catch { return false; }
      }).length;

      return { month: MONTHS[month], giving, attendance: sundayAttendance, newMembers };
    });
  }, [data]);

  const toggleKPI = (key: string) => {
    setSelectedKPIs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">KPI Trends</h3>
          <p className="text-xs text-muted-foreground">Key performance indicators — last 6 months</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {kpiOptions.map(kpi => (
            <button
              key={kpi.key}
              onClick={() => toggleKPI(kpi.key)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                selectedKPIs.includes(kpi.key)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-muted-foreground hover:bg-muted'
              }`}
            >
              {kpi.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[280px] text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading KPI data...</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {selectedKPIs.map(kpiKey => {
              const kpi = kpiOptions.find(k => k.key === kpiKey);
              if (!kpi) return null;
              return (
                <Line
                  key={kpiKey}
                  type="monotone"
                  dataKey={kpiKey}
                  name={kpi.label}
                  stroke={kpi.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: kpi.color }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const KPIComparisonChart = memo(KPIComparisonChartComponent);
export default KPIComparisonChart;
