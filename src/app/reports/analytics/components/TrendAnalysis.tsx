'use client';

import React from 'react';

type TrendAnalysisProps = {
  timeframe: string;
};

export default function TrendAnalysis({ timeframe }: TrendAnalysisProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Trend Analysis</h2>
        <span className="text-sm text-gray-500">{timeframe}</span>
      </div>

      <div className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
        No trend data available.
      </div>
    </div>
  );
}
