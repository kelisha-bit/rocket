'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums ml-auto pl-3">₵{entry.value.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t border-border mt-2 pt-2 flex justify-between">
        <span className="text-muted-foreground text-xs">Total</span>
        <span className="font-bold tabular-nums text-xs">
          ₵{payload.reduce((s: number, e: any) => s + e.value, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default function GivingComparisonChart() {
  const { data, loading } = useDashboard();

  const chartData = useMemo(() => {
    // Build last 6 months of giving data from transactions
    const now = new Date();
    const months: { year: number; month: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    }

    return months.map(({ year, month, label }) => {
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      const monthTx = data.transactions.filter(
        t => t.type === 'income' && t.date >= start && t.date <= end
      );

      return {
        month: MONTHS[month],
        tithes: monthTx.filter(t => t.category === 'Tithe').reduce((s, t) => s + t.amount, 0),
        offerings: monthTx.filter(t => t.category === 'Offering').reduce((s, t) => s + t.amount, 0),
        pledges: monthTx.filter(t => t.category === 'Pledge').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [data.transactions]);

  const currentMonthTotal = chartData[chartData.length - 1];
  const currentTotal = currentMonthTotal
    ? currentMonthTotal.tithes + currentMonthTotal.offerings + currentMonthTotal.pledges
    : 0;

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Giving Overview</h3>
          <p className="text-xs text-muted-foreground">Tithes, Offerings & Pledges — last 6 months</p>
        </div>
        {!loading && (
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2.5 py-1 font-medium">
            ₵{currentTotal.toLocaleString()} this month
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[220px] text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading giving data...</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} tickFormatter={v => `₵${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="tithes" name="Tithes" fill="#1B4F8A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="offerings" name="Offerings" fill="#C9922A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pledges" name="Pledges" fill="#7C3AED" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
