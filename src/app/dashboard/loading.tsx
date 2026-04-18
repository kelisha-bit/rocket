'use client';

import React from 'react';
import { Loader2, Users, BookOpen, HandCoins, Gift, Home, Cake, CalendarDays, UserPlus, Target, TrendingUp } from 'lucide-react';

function SkeletonCard({ icon: Icon, hero = false }: { icon: React.ElementType; hero?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-card p-4 ${hero ? 'h-32' : 'h-28'} animate-pulse`}>
      <div className="flex items-start justify-between">
        <div className={`${hero ? 'w-16 h-16' : 'w-12 h-12'} rounded-lg bg-muted`} />
        <div className={`${hero ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-muted/50`}>
          <Icon className="w-full h-full p-1.5 text-muted-foreground/30" />
        </div>
      </div>
      <div className="mt-3">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted/50 rounded w-1/2" />
      </div>
    </div>
  );
}

function SkeletonChart({ height = 240 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-5 bg-muted rounded w-32 mb-2" />
          <div className="h-3 bg-muted/50 rounded w-48" />
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 size={24} className="animate-spin text-muted-foreground/50" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <SkeletonCard icon={Users} hero />
          </div>
          <SkeletonCard icon={BookOpen} />
          <SkeletonCard icon={HandCoins} />
          <SkeletonCard icon={Gift} />
          <SkeletonCard icon={Home} />
          <SkeletonCard icon={Cake} />
          <SkeletonCard icon={CalendarDays} />
          <SkeletonCard icon={UserPlus} />
          <SkeletonCard icon={Target} />
          <SkeletonCard icon={TrendingUp} />
        </div>

        {/* Quick Actions & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <div className="bg-white rounded-xl border border-border shadow-card p-5 h-40 animate-pulse">
            <div className="h-5 bg-muted rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-muted/50 rounded" />
              <div className="h-10 bg-muted/50 rounded" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-card p-5 h-40 animate-pulse">
            <div className="h-5 bg-muted rounded w-24 mb-4" />
            <div className="space-y-3">
              <div className="h-8 bg-muted/50 rounded" />
              <div className="h-8 bg-muted/50 rounded" />
            </div>
          </div>
        </div>

        {/* KPI Chart */}
        <div className="mt-5">
          <SkeletonChart height={200} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2">
            <SkeletonChart height={240} />
          </div>
          <div className="lg:col-span-1">
            <SkeletonChart height={240} />
          </div>
        </div>

        {/* Giving + Birthday Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2">
            <SkeletonChart height={220} />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[252px] animate-pulse">
              <div className="h-5 bg-muted rounded w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32 mb-1" />
                      <div className="h-3 bg-muted/50 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table + Events Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5 mt-5 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border shadow-card p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border shadow-card p-5 h-[292px] animate-pulse">
              <div className="h-5 bg-muted rounded w-36 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
