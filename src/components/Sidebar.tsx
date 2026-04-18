'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Users, CalendarDays, HandCoins, Home, ChevronLeft, ChevronRight, Settings, LogOut, BookOpen, UsersRound, FileText, UserCheck, User, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  group: string;
}

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { signOut, useSupabaseAuth } = useAuth();

  const navItems: NavItem[] = [
    { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, group: 'main' },
    { id: 'nav-members', label: 'Members', href: '/member-management', icon: <Users size={20} />, group: 'main' },
    { id: 'nav-attendance', label: 'Attendance', href: '/attendance', icon: <BookOpen size={20} />, group: 'main' },
    { id: 'nav-member-attendance', label: 'Member Check-in', href: '/member-attendance', icon: <UserCheck size={20} />, group: 'main' },
    { id: 'nav-certificates', label: 'Certificates', href: '/certificates', icon: <Award size={20} />, group: 'main' },
    { id: 'nav-reports', label: 'Reports', href: '/reports', icon: <FileText size={20} />, group: 'main' },
    { id: 'nav-finance', label: 'Finance', href: '/finance', icon: <HandCoins size={20} />, group: 'ministry' },
    { id: 'nav-events', label: 'Events', href: '/events', icon: <CalendarDays size={20} />, group: 'ministry' },
    { id: 'nav-cellgroups', label: 'Cell Groups', href: '/cell-groups', icon: <Home size={20} />, group: 'ministry' },
    { id: 'nav-ministries', label: 'Ministries', href: '/ministries', icon: <UsersRound size={20} />, group: 'ministry' },
    { id: 'nav-profile', label: 'My Profile', href: '/profile', icon: <User size={20} />, group: 'ministry' },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#1B4F8A] text-white transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      } hidden lg:flex`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} className="shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-semibold text-sm leading-tight block truncate">GreaterWorks</span>
            <span className="text-white/50 text-[10px] leading-tight block truncate">City Church · Accra</span>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-2 pb-1">Overview</p>
        )}
        {navItems.filter(n => n.group === 'main').map(item => (
          <SidebarLink key={item.id} item={item} collapsed={collapsed} active={currentPath === item.href} />
        ))}

        {!collapsed && (
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-2 pt-4 pb-1">Ministry</p>
        )}
        {collapsed && <div className="my-3 border-t border-white/10" />}
        {navItems.filter(n => n.group === 'ministry').map(item => (
          <SidebarLink key={item.id} item={item} collapsed={collapsed} active={currentPath === item.href} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-2 py-3 space-y-1">
        <SidebarLink
          key="nav-settings"
          item={{ id: 'nav-settings', label: 'Settings', href: '/settings', icon: <Settings size={20} />, group: 'bottom' }}
          collapsed={collapsed}
          active={currentPath === '/settings'}
        />
        <button
          onClick={async () => {
            if (useSupabaseAuth) {
              await signOut();
            }
            router.push('/sign-up-login-screen');
          }}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full group flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative text-white/70 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="shrink-0"><LogOut size={20} /></span>
          {!collapsed && <span className="truncate flex-1">Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-card text-[#1B4F8A] hover:bg-blue-50 transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
        active
          ? 'bg-white/15 text-white' :'text-white/70 hover:bg-white/10 hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
    </Link>
  );
}