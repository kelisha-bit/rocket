'use client';

import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardBentoGrid from './components/DashboardBentoGrid';
import AttendanceTrendChart from './components/AttendanceTrendChart';
import GivingComparisonChart from './components/GivingComparisonChart';
import DemographicsChart from './components/DemographicsChart';
import BirthdayWidget from './components/BirthdayWidget';
import RecentGivingTable from './components/RecentGivingTable';
import UpcomingEvents from './components/UpcomingEvents';
import DashboardHeader from './components/DashboardHeader';
import QuickActionsWidget from './components/QuickActionsWidget';
import AlertsWidget from './components/AlertsWidget';
import KPIComparisonChart from './components/KPIComparisonChart';
import MobileDashboardNav from './components/MobileDashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardProvider } from './context/DashboardContext';

export default function DashboardPage() {
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
    <DashboardProvider>
      <MobileDashboardNav currentPath="/dashboard" />
      <AppLayout currentPath="/dashboard">
        <DashboardHeader />
        
        {/* Metric Cards */}
        <DashboardBentoGrid />

        {/* Quick Actions & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <QuickActionsWidget />
          <AlertsWidget />
        </div>

        {/* KPI Trends Chart */}
        <div className="mt-5">
          <KPIComparisonChart />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2">
            <AttendanceTrendChart />
          </div>
          <div className="lg:col-span-1">
            <DemographicsChart />
          </div>
        </div>

        {/* Giving chart + birthday */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2">
            <GivingComparisonChart />
          </div>
          <div className="lg:col-span-1">
            <BirthdayWidget />
          </div>
        </div>

        {/* Table + events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5 mb-6">
          <div className="lg:col-span-2">
            <RecentGivingTable />
          </div>
          <div className="lg:col-span-1">
            <UpcomingEvents />
          </div>
        </div>
      </AppLayout>
    </DashboardProvider>
  );
}