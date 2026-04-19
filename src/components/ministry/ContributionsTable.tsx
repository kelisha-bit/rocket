'use client';

import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { MinistryContribution } from '@/lib/supabase/ministry-analytics';

interface ContributionsTableProps {
  contributions: MinistryContribution[];
  loading?: boolean;
}

export default function ContributionsTable({ contributions, loading }: ContributionsTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No contributions recorded</p>
      </div>
    );
  }

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
  const averageAmount = totalAmount / contributions.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average Amount</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageAmount)}</p>
        </div>
      </div>

      {/* Contributions List */}
      <div className="space-y-2">
        {contributions.slice(0, 10).map((contribution) => (
          <div
            key={contribution.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{contribution.member_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(contribution.date)}</span>
                  <span>•</span>
                  <span className="truncate">{contribution.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{formatCurrency(contribution.amount)}</p>
            </div>
          </div>
        ))}
      </div>

      {contributions.length > 10 && (
        <p className="text-center text-sm text-gray-500">
          Showing 10 of {contributions.length} contributions
        </p>
      )}
    </div>
  );
}
