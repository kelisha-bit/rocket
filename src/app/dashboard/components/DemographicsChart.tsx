'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const AGE_COLORS = ['#1B4F8A', '#C9922A', '#7C3AED', '#059669'];
const GENDER_COLORS = { Female: '#EC4899', Male: '#1B4F8A' };
const MINISTRY_COLORS = ['#1B4F8A', '#EC4899', '#059669', '#C9922A', '#7C3AED', '#F59E0B', '#0EA5E9', '#EF4444'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal px-3 py-2 text-sm">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="tabular-nums text-muted-foreground">
        {d.payload.value.toLocaleString()} members
        {d.payload.percentage != null && ` (${d.payload.percentage}%)`}
      </p>
    </div>
  );
};

function getAge(dob: string): number {
  if (!dob) return 0;
  try {
    let iso: string;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      iso = dob;
    } else {
      const parts = dob.split('/');
      if (parts.length !== 3) return 0;
      iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const birth = new Date(`${iso}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return Math.max(0, age);
  } catch { return 0; }
}

export default function DemographicsChart() {
  const [view, setView] = useState<'age' | 'gender' | 'ministry'>('age');
  const { data, loading } = useDashboard();

  const { ageData, genderData, ministryData, total } = useMemo(() => {
    const members = data.members;
    const total = members.length;

    // Age groups
    const ageBuckets = { youth: 0, youngAdults: 0, adults: 0, seniors: 0 };
    for (const m of members) {
      const age = m.age || getAge(m.dob);
      if (age >= 13 && age <= 25) ageBuckets.youth++;
      else if (age >= 26 && age <= 35) ageBuckets.youngAdults++;
      else if (age >= 36 && age <= 50) ageBuckets.adults++;
      else if (age > 50) ageBuckets.seniors++;
    }
    const ageData = [
      { name: 'Youth (13–25)', value: ageBuckets.youth, color: AGE_COLORS[0], percentage: total ? +((ageBuckets.youth / total) * 100).toFixed(1) : 0 },
      { name: 'Young Adults (26–35)', value: ageBuckets.youngAdults, color: AGE_COLORS[1], percentage: total ? +((ageBuckets.youngAdults / total) * 100).toFixed(1) : 0 },
      { name: 'Adults (36–50)', value: ageBuckets.adults, color: AGE_COLORS[2], percentage: total ? +((ageBuckets.adults / total) * 100).toFixed(1) : 0 },
      { name: 'Seniors (51+)', value: ageBuckets.seniors, color: AGE_COLORS[3], percentage: total ? +((ageBuckets.seniors / total) * 100).toFixed(1) : 0 },
    ];

    // Gender
    const males = members.filter(m => m.gender === 'Male').length;
    const females = members.filter(m => m.gender === 'Female').length;
    const genderData = [
      { name: 'Female', value: females, color: GENDER_COLORS.Female, percentage: total ? +((females / total) * 100).toFixed(1) : 0 },
      { name: 'Male', value: males, color: GENDER_COLORS.Male, percentage: total ? +((males / total) * 100).toFixed(1) : 0 },
    ];

    // Ministry breakdown — count each ministry a member belongs to
    const ministryCount = new Map<string, number>();
    for (const m of members) {
      const allMinistries = (m.ministries ?? [m.ministry]).filter(n => n && n !== '—');
      for (const name of allMinistries) {
        ministryCount.set(name, (ministryCount.get(name) ?? 0) + 1);
      }
    }
    const ministryData = Array.from(ministryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({ name, value, color: MINISTRY_COLORS[i % MINISTRY_COLORS.length] }));

    return { ageData, genderData, ministryData, total };
  }, [data.members]);

  const chartDataMap = { age: ageData, gender: genderData, ministry: ministryData };
  const currentData = chartDataMap[view];
  const isMinistry = view === 'ministry';

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Demographics</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `${total.toLocaleString()} total members`}
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {(['age', 'gender', 'ministry'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 font-medium transition-colors capitalize ${view === v ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          {isMinistry ? (
            <BarChart data={currentData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {currentData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={currentData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                {currentData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', lineHeight: '1.8' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
