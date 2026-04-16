'use client';

import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ReportsHeader from './components/ReportsHeader';
import ReportCategories from './components/ReportCategories';
import RecentReports from './components/RecentReports';
import ReportTemplates from './components/ReportTemplates';
import QuickReports from './components/QuickReports';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  return (
    <AppLayout currentPath="/reports">
      <ReportsHeader />
      
      {/* Quick Reports */}
      <QuickReports />

      {/* Report Categories & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ReportCategories />
        <ReportTemplates />
      </div>

      {/* Recent Reports */}
      <div className="mt-6">
        <RecentReports />
      </div>
    </AppLayout>
  );
}