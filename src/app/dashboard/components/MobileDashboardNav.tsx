'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  HandCoins, 
  BookOpen,
  Menu,
  X,
  Home,
  UsersRound,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../context/DashboardContext';

interface MobileDashboardNavProps {
  currentPath?: string;
}

export default function MobileDashboardNav({ currentPath = '' }: MobileDashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { stats, data, loading } = useDashboard();

  const navItems = [
    { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, badge: null },
    { id: 'nav-members', label: 'Members', href: '/member-management', icon: <Users size={20} />, badge: loading ? null : stats.newMembersThisMonth > 0 ? stats.newMembersThisMonth : null },
    { id: 'nav-attendance', label: 'Attendance', href: '/attendance', icon: <BookOpen size={20} />, badge: null },
    { id: 'nav-finance', label: 'Finance', href: '/finance', icon: <HandCoins size={20} />, badge: null },
    { id: 'nav-events', label: 'Events', href: '/events', icon: <CalendarDays size={20} />, badge: loading ? null : data.upcomingEvents.length > 0 ? data.upcomingEvents.length : null },
    { id: 'nav-cellgroups', label: 'Cell Groups', href: '/cell-groups', icon: <Home size={20} />, badge: null },
    { id: 'nav-ministries', label: 'Ministries', href: '/ministries', icon: <UsersRound size={20} />, badge: null },
    { id: 'nav-settings', label: 'Settings', href: '/settings', icon: <Settings size={20} />, badge: null },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-10 h-10 bg-white border border-border rounded-lg shadow-card"
        >
          <Menu size={20} className="text-foreground" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-[#1B4F8A] text-white z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">GreaterWorks</span>
              <p className="text-white/70 text-xs">City Church · Accra</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
            Navigation
          </p>
          
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                currentPath === item.href
                  ? 'bg-white/15 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-[#C9922A] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-white/50 text-xs">
              Greater Works City Church
            </p>
            <p className="text-white/30 text-xs">
              Management System v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}