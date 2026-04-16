'use client';

import React, { useState } from 'react';
import { ArrowRight, Search, Download, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useDashboard } from '../context/DashboardContext';

const typeColor: Record<string, string> = {
  Tithe: 'bg-amber-50 text-amber-700 border-amber-200',
  Offering: 'bg-blue-50 text-blue-700 border-blue-200',
  Pledge: 'bg-purple-50 text-purple-700 border-purple-200',
  Seed: 'bg-green-50 text-green-700 border-green-200',
  'Special Offering': 'bg-pink-50 text-pink-700 border-pink-200',
  'Building Fund': 'bg-orange-50 text-orange-700 border-orange-200',
  Donation: 'bg-teal-50 text-teal-700 border-teal-200',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function RecentGivingTable() {
  const { data, loading } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Only income transactions, most recent 20
  const incomeTransactions = data.transactions
    .filter(t => t.type === 'income')
    .slice(0, 20);

  const filtered = incomeTransactions.filter(tx => {
    const memberName = tx.member ?? '';
    const matchesSearch =
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memberId ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || tx.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const handleExport = () => {
    toast.success('Export started', { description: 'Giving records will be downloaded shortly.' });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Giving Records</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading...' : `${filtered.length} transactions · ₵${totalAmount.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All</option>
            <option>Tithe</option>
            <option>Offering</option>
            <option>Pledge</option>
            <option>Seed</option>
            <option>Special Offering</option>
            <option>Building Fund</option>
            <option>Donation</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs bg-primary text-white rounded-lg px-2.5 py-1.5 hover:bg-primary/90 transition-colors"
          >
            <Download size={12} />
            Export
          </button>
          <Link
            href="/finance"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading transactions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Member', 'Type', 'Amount (₵)', 'Date', 'Method', 'Actions'].map(col => (
                  <th key={col} className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-2 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors group">
                  <td className="py-2.5 px-2">
                    <p className="font-medium text-foreground text-[13px]">{tx.member || tx.description || '—'}</p>
                    {tx.memberId && (
                      <p className="text-[11px] text-muted-foreground font-mono">{tx.memberId}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${typeColor[tx.category] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="font-mono font-semibold tabular-nums text-[13px]">
                      ₵{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-[12px] text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-2.5 px-2 text-[12px] text-muted-foreground">{tx.method}</td>
                  <td className="py-2.5 px-2">
                    <button
                      onClick={() => toast.info('Transaction', { description: tx.description })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <Eye size={14} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions found</p>
              <p className="text-xs">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
