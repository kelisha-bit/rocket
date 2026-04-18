'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import DashboardBentoGrid from './components/DashboardBentoGrid';
import BirthdayWidget from './components/BirthdayWidget';
import RecentGivingTable from './components/RecentGivingTable';
import UpcomingEvents from './components/UpcomingEvents';
import DashboardHeader from './components/DashboardHeader';
import QuickActionsWidget from './components/QuickActionsWidget';
import AlertsWidget from './components/AlertsWidget';
import MobileDashboardNav from './components/MobileDashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardProvider } from './context/DashboardContext';

// Lazy load chart components to improve initial load time
const AttendanceTrendChart = dynamic(() => import('./components/AttendanceTrendChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[240px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const GivingComparisonChart = dynamic(() => import('./components/GivingComparisonChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[220px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const DemographicsChart = dynamic(() => import('./components/DemographicsChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[200px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const KPIComparisonChart = dynamic(() => import('./components/KPIComparisonChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[200px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function DashboardPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  if (useSupabaseAuth && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (useSupabaseAuth && !session) {
    return null;
  }

  return (
    <DashboardProvider>
      <MobileDashboardNav currentPath="/dashboard" />
      <AppLayout currentPath="/dashboard">
        <div className="pb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2">
              <RecentGivingTable />
            </div>
            <div className="lg:col-span-1">
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </AppLayout>
    </DashboardProvider>
  );
}