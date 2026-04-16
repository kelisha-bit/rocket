'use client';

import React, { useState } from 'react';
import { 
  Settings, Palette, Bell, Shield, Moon, Sun, 
  Volume2, VolumeX, Wifi, WifiOff, X, Check 
} from 'lucide-react';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSettings({ isOpen, onClose }: QuickSettingsProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'theme',
      label: 'Theme',
      icon: theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />,
      value: theme,
      options: ['Light', 'Dark', 'Auto'],
      onChange: (value: string) => setTheme(value.toLowerCase() as 'light' | 'dark' | 'auto')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: notifications ? <Bell size={16} /> : <Bell size={16} className="opacity-50" />,
      value: notifications,
      toggle: true,
      onChange: () => setNotifications(!notifications)
    },
    {
      id: 'sounds',
      label: 'Sounds',
      icon: sounds ? <Volume2 size={16} /> : <VolumeX size={16} />,
      value: sounds,
      toggle: true,
      onChange: () => setSounds(!sounds)
    },
    {
      id: 'autosave',
      label: 'Auto Save',
      icon: autoSave ? <Wifi size={16} /> : <WifiOff size={16} />,
      value: autoSave,
      toggle: true,
      onChange: () => setAutoSave(!autoSave)
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Quick Settings Panel */}
      <div className="fixed top-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-border z-50 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Quick Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-3">
          {quickActions.map(action => (
            <div
              key={action.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </div>

              {action.toggle ? (
                <button
                  onClick={action.onChange}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    action.value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      action.value ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <select
                  value={action.value as string}
                  onChange={e => action.onChange(e.target.value)}
                  className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {action.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Links</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors text-left">
              <Palette size={14} className="text-primary" />
              <span className="text-xs text-foreground">Appearance</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors text-left">
              <Shield size={14} className="text-amber-600" />
              <span className="text-xs text-foreground">Security</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors text-left">
              <Bell size={14} className="text-blue-600" />
              <span className="text-xs text-foreground">Notifications</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors text-left">
              <Settings size={14} className="text-muted-foreground" />
              <span className="text-xs text-foreground">All Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}