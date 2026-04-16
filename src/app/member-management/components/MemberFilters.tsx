'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Filters } from './MemberManagementContent';

const cellGroups = ['Bethel Cell — Dansoman', 'Grace Cell — Tema', 'Zion Cell — Legon', 'Faith Cell — Accra Central', 'Canaan Cell — Adenta', 'Hope Cell — Madina', 'Shalom Cell — Ashaiman'];
const ministries = ['Worship Team', 'Ushering', 'Finance Committee', 'Youth Ministry', 'Elders Board', 'Children Ministry', 'Media & Tech', 'Prayer Ministry', 'Evangelism Team', 'Women Ministry', 'Hospitality'];

interface Props {
  search: string;
  setSearch: (v: string) => void;
  filters: Filters;
  setFilters: (v: Filters) => void;
}

export default function MemberFilters({ search, setSearch, filters, setFilters }: Props) {
  const hasFilters = search || Object.values(filters).some(Boolean);

  const update = (key: keyof Filters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const clearAll = () => {
    setSearch('');
    setFilters({ status: '', cellGroup: '', ministry: '', titheStatus: '', gender: '' });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or phone…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={e => update('status', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[130px]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="new">New Member</option>
          <option value="inactive">Inactive</option>
          <option value="transferred">Transferred</option>
        </select>

        {/* Tithe status */}
        <select
          value={filters.titheStatus}
          onChange={e => update('titheStatus', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
        >
          <option value="">All Tithe Status</option>
          <option value="tithe-faithful">Faithful Tithers</option>
          <option value="tithe-irregular">Irregular Tithers</option>
          <option value="tithe-none">Non-tithers</option>
        </select>

        {/* Cell group */}
        <select
          value={filters.cellGroup}
          onChange={e => update('cellGroup', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
        >
          <option value="">All Cell Groups</option>
          {cellGroups.map(cg => (
            <option key={`cg-filter-${cg}`} value={cg}>{cg}</option>
          ))}
        </select>

        {/* Ministry */}
        <select
          value={filters.ministry}
          onChange={e => update('ministry', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
        >
          <option value="">All Ministries</option>
          {ministries.map(m => (
            <option key={`min-filter-${m}`} value={m}>{m}</option>
          ))}
        </select>

        {/* Gender */}
        <select
          value={filters.gender}
          onChange={e => update('gender', e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-2 rounded-lg hover:bg-red-50"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}