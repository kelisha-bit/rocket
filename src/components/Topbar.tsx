'use client';

import React, { useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const notificationsSeed = [
  { id: 'notif-1', text: '3 new members registered today', time: '2 min ago', unread: true },
  { id: 'notif-2', text: 'Sunday service attendance recorded', time: '1 hr ago', unread: true },
  { id: 'notif-3', text: 'Tithe entry by Finance Officer', time: '3 hrs ago', unread: false },
];

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsSeed);
  const router = useRouter();
  const { user, signOut, useSupabaseAuth } = useAuth();

  const displayName = useSupabaseAuth ? (user?.user_metadata?.full_name || user?.email || 'Account') : 'Ps. Emmanuel Asante';
  const displayRole = useSupabaseAuth ? 'Staff' : 'Pastor / Admin';

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={15} className="absolute left-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members, records…"
          className="pl-9 pr-4 py-1.5 text-sm bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 placeholder:text-muted-foreground"
        />
        <span className="absolute right-3 text-[10px] text-muted-foreground font-mono">⌘K</span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-muted-foreground" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9922A] rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-modal border border-border z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <button
                  className="text-[11px] text-primary cursor-pointer hover:underline"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                    toast.success('Notifications cleared', { description: 'All notifications marked as read.' });
                  }}
                >
                  Mark all read
                </button>
              </div>
              {notifications?.map(n => (
                <div
                  key={n?.id}
                  className={`px-4 py-3 flex gap-3 hover:bg-muted/50 cursor-pointer transition-colors ${n?.unread ? 'bg-blue-50/40' : ''}`}
                  onClick={() => {
                    setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, unread: false } : x)));
                    toast.info('Notification', { description: n.text });
                    setNotifOpen(false);
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n?.unread ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-foreground leading-snug">{n?.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n?.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <AppImage
              src="https://i.pravatar.cc/32?img=12"
              alt="User profile photo"
              width={32}
              height={32}
              className="rounded-full object-cover w-8 h-8"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-tight">{displayName}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{displayRole}</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-modal border border-border z-50 animate-fade-in py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                onClick={() => {
                  setUserOpen(false);
                  router.push('/profile');
                }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                onClick={() => {
                  setUserOpen(false);
                  router.push('/settings');
                }}
              >
                Account Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                onClick={async () => {
                  setUserOpen(false);
                  if (useSupabaseAuth) {
                    await signOut();
                  }
                  router.push('/sign-up-login-screen');
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}