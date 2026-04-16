'use client';

import React from 'react';

type KPIOverviewProps = {
  timeframe: string;
};

export default function KPIOverview({ timeframe }: KPIOverviewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">KPI Overview</h2>
        <span className="text-sm text-gray-500">{timeframe}</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Total</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">—</div>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Average</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">—</div>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Change</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">—</div>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Trend</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">—</div>
        </div>
      </div>
    </div>
  );
}
