'use client';

import React from 'react';

type ComparativeAnalysisProps = {
  timeframe: string;
  comparisonPeriod: string;
};

export default function ComparativeAnalysis({ timeframe, comparisonPeriod }: ComparativeAnalysisProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Comparative Analysis</h2>
        <div className="text-sm text-gray-500">
          <span>{timeframe}</span>
          <span className="mx-2">·</span>
          <span>{comparisonPeriod}</span>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
        No comparison data available.
      </div>
    </div>
  );
}
