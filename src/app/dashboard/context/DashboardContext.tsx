'use client';

import React, { createContext, useContext } from 'react';
import { useDashboardData, computeStats, type DashboardData, type DashboardStats } from '../hooks/useDashboardData';

interface DashboardContextValue {
  data: DashboardData;
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefreshed: Date | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error, refresh, lastRefreshed } = useDashboardData();
  const stats = computeStats(data);

  return (
    <DashboardContext.Provider value={{ data, stats, loading, error, refresh, lastRefreshed }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
