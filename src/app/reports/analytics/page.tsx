'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AnalyticsHeader from './components/AnalyticsHeader';
import KPIOverview from './components/KPIOverview';
import TrendAnalysis from './components/TrendAnalysis';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import PredictiveInsights from './components/PredictiveInsights';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('12_months');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_year');

  React.useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  return (
    <AppLayout currentPath="/reports/analytics">
      <AnalyticsHeader 
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        comparisonPeriod={comparisonPeriod}
        onComparisonChange={setComparisonPeriod}
      />
      
      {/* KPI Overview */}
      <KPIOverview timeframe={timeframe} />
      
      {/* Trend Analysis */}
      <div className="mt-6">
        <TrendAnalysis timeframe={timeframe} />
      </div>
      
      {/* Comparative Analysis */}
      <div className="mt-6">
        <ComparativeAnalysis 
          timeframe={timeframe} 
          comparisonPeriod={comparisonPeriod} 
        />
      </div>
      
      {/* Predictive Insights */}
      <div className="mt-6 mb-6">
        <PredictiveInsights timeframe={timeframe} />
      </div>
    </AppLayout>
  );
}