'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import MetricCard from '@/components/ui/MetricCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Settings, Shield, Building2, UserRound, Bell, Palette, Database, 
  Mail, Phone, Globe, Lock, Eye, EyeOff, Save, RefreshCw, Download,
  Upload, Trash2, Plus, Edit3, Check, X, AlertTriangle, Info,
  Users, Calendar, DollarSign, BarChart3, Zap, Clock, MapPin,
  Camera, Smartphone, Monitor, Moon, Sun, Volume2, VolumeX
} from 'lucide-react';

type SettingSection = 'Organization' | 'Security' | 'Notifications' | 'Profile' | 'Appearance' | 'Data' | 'Integrations' | 'Advanced';

type SettingType = 'text' | 'select' | 'toggle' | 'number' | 'email' | 'password' | 'color' | 'file';

type SettingRow = {
  id: string;
  section: SettingSection;
  name: string;
  value: string | boolean | number;
  type: SettingType;
  description?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  warning?: boolean;
  info?: string;
};

const defaultSettings: SettingRow[] = [
  // Organization Settings
  { 
    id: 'org-1', 
    section: 'Organization', 
    name: 'Church Name', 
    value: 'Greater Works City Church', 
    type: 'text',
    description: 'Official name displayed across reports and exports.',
    required: true
  },
  { 
    id: 'org-2', 
    section: 'Organization', 
    name: 'Address', 
    value: 'Accra, Ghana', 
    type: 'text',
    description: 'Physical address of the church.'
  },
  { 
    id: 'org-3', 
    section: 'Organization', 
    name: 'Phone Number', 
    value: '+233 24 123 4567', 
    type: 'text',
    description: 'Main contact number for the church.'
  },
  { 
    id: 'org-4', 
    section: 'Organization', 
    name: 'Email', 
    value: 'info@greaterworks.gh', 
    type: 'email',
    description: 'Official email address for communications.'
  },
  { 
    id: 'org-5', 
    section: 'Organization', 
    name: 'Website', 
    value: 'https://greaterworks.gh', 
    type: 'text',
    description: 'Church website URL.'
  },
  { 
    id: 'org-6', 
    section: 'Organization', 
    name: 'Default Currency', 
    value: 'GHS', 
    type: 'select',
    options: ['GHS', 'USD', 'EUR', 'GBP'],
    description: 'Currency used in finance module calculations.'
  },
  { 
    id: 'org-7', 
    section: 'Organization', 
    name: 'Time Zone', 
    value: 'Africa/Accra', 
    type: 'select',
    options: ['Africa/Accra', 'UTC', 'America/New_York', 'Europe/London'],
    description: 'Default timezone for events and reports.'
  },

  // Security Settings
  { 
    id: 'sec-1', 
    section: 'Security', 
    name: 'Session Timeout', 
    value: '30', 
    type: 'select',
    options: ['15', '30', '60', '120', '240'],
    description: 'Auto sign-out after inactivity (minutes).'
  },
  { 
    id: 'sec-2', 
    section: 'Security', 
    name: 'Two-Factor Authentication', 
    value: false, 
    type: 'toggle',
    description: 'Enable 2FA for enhanced security.',
    warning: true
  },
  { 
    id: 'sec-3', 
    section: 'Security', 
    name: 'Password Policy', 
    value: 'Strong', 
    type: 'select',
    options: ['Basic', 'Strong', 'Very Strong'],
    description: 'Minimum password requirements for users.'
  },
  { 
    id: 'sec-4', 
    section: 'Security', 
    name: 'Login Attempts', 
    value: '5', 
    type: 'select',
    options: ['3', '5', '10', 'Unlimited'],
    description: 'Maximum failed login attempts before lockout.'
  },
  { 
    id: 'sec-5', 
    section: 'Security', 
    name: 'Data Encryption', 
    value: true, 
    type: 'toggle',
    description: 'Encrypt sensitive data at rest.',
    disabled: true,
    info: 'Always enabled for security compliance.'
  },

  // Notifications Settings
  { 
    id: 'not-1', 
    section: 'Notifications', 
    name: 'Email Notifications', 
    value: true, 
    type: 'toggle',
    description: 'Receive important activity notifications via email.'
  },
  { 
    id: 'not-2', 
    section: 'Notifications', 
    name: 'SMS Notifications', 
    value: false, 
    type: 'toggle',
    description: 'Receive urgent notifications via SMS.'
  },
  { 
    id: 'not-3', 
    section: 'Notifications', 
    name: 'Push Notifications', 
    value: true, 
    type: 'toggle',
    description: 'Browser push notifications for real-time updates.'
  },
  { 
    id: 'not-4', 
    section: 'Notifications', 
    name: 'Weekly Reports', 
    value: true, 
    type: 'toggle',
    description: 'Receive weekly summary reports via email.'
  },
  { 
    id: 'not-5', 
    section: 'Notifications', 
    name: 'Event Reminders', 
    value: true, 
    type: 'toggle',
    description: 'Get reminders for upcoming church events.'
  },

  // Profile Settings
  { 
    id: 'prof-1', 
    section: 'Profile', 
    name: 'Display Name', 
    value: 'Administrator', 
    type: 'text',
    description: 'Name displayed in the interface.'
  },
  { 
    id: 'prof-2', 
    section: 'Profile', 
    name: 'Role', 
    value: 'Administrator', 
    type: 'select',
    options: ['Administrator', 'Pastor', 'Secretary', 'Treasurer', 'Member'],
    description: 'Determines permissions and module access.',
    disabled: true,
    info: 'Contact system administrator to change roles.'
  },
  { 
    id: 'prof-3', 
    section: 'Profile', 
    name: 'Language', 
    value: 'English', 
    type: 'select',
    options: ['English', 'Twi', 'Ga', 'Ewe'],
    description: 'Interface language preference.'
  },
  { 
    id: 'prof-4', 
    section: 'Profile', 
    name: 'Date Format', 
    value: 'DD/MM/YYYY', 
    type: 'select',
    options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    description: 'Date display format throughout the system.'
  },

  // Appearance Settings
  { 
    id: 'app-1', 
    section: 'Appearance', 
    name: 'Theme', 
    value: 'Light', 
    type: 'select',
    options: ['Light', 'Dark', 'Auto'],
    description: 'Interface color scheme preference.'
  },
  { 
    id: 'app-2', 
    section: 'Appearance', 
    name: 'Primary Color', 
    value: '#1B4F8A', 
    type: 'color',
    description: 'Main brand color used throughout the interface.'
  },
  { 
    id: 'app-3', 
    section: 'Appearance', 
    name: 'Font Size', 
    value: 'Medium', 
    type: 'select',
    options: ['Small', 'Medium', 'Large', 'Extra Large'],
    description: 'Text size for better readability.'
  },
  { 
    id: 'app-4', 
    section: 'Appearance', 
    name: 'Compact Mode', 
    value: false, 
    type: 'toggle',
    description: 'Reduce spacing for more content on screen.'
  },
  { 
    id: 'app-5', 
    section: 'Appearance', 
    name: 'Sidebar Collapsed', 
    value: false, 
    type: 'toggle',
    description: 'Keep sidebar collapsed by default.'
  },

  // Data Settings
  { 
    id: 'data-1', 
    section: 'Data', 
    name: 'Auto Backup', 
    value: true, 
    type: 'toggle',
    description: 'Automatically backup data daily.'
  },
  { 
    id: 'data-2', 
    section: 'Data', 
    name: 'Backup Retention', 
    value: '30', 
    type: 'select',
    options: ['7', '14', '30', '90', '365'],
    description: 'Days to keep backup files.'
  },
  { 
    id: 'data-3', 
    section: 'Data', 
    name: 'Export Format', 
    value: 'Excel', 
    type: 'select',
    options: ['Excel', 'CSV', 'PDF'],
    description: 'Default format for data exports.'
  },
  { 
    id: 'data-4', 
    section: 'Data', 
    name: 'Data Retention', 
    value: '7', 
    type: 'select',
    options: ['1', '3', '5', '7', 'Unlimited'],
    description: 'Years to retain member data.'
  },

  // Integrations Settings
  { 
    id: 'int-1', 
    section: 'Integrations', 
    name: 'Email Service', 
    value: 'Disabled', 
    type: 'select',
    options: ['Disabled', 'Gmail', 'Outlook', 'SendGrid'],
    description: 'Email service for notifications and communications.'
  },
  { 
    id: 'int-2', 
    section: 'Integrations', 
    name: 'SMS Service', 
    value: 'Disabled', 
    type: 'select',
    options: ['Disabled', 'Twilio', 'Nexmo', 'Local Provider'],
    description: 'SMS service for text notifications.'
  },
  { 
    id: 'int-3', 
    section: 'Integrations', 
    name: 'Payment Gateway', 
    value: 'Disabled', 
    type: 'select',
    options: ['Disabled', 'Paystack', 'Flutterwave', 'Stripe'],
    description: 'Online payment processing for donations.'
  },
  { 
    id: 'int-4', 
    section: 'Integrations', 
    name: 'Calendar Sync', 
    value: false, 
    type: 'toggle',
    description: 'Sync church events with external calendars.'
  },

  // Advanced Settings
  { 
    id: 'adv-1', 
    section: 'Advanced', 
    name: 'Debug Mode', 
    value: false, 
    type: 'toggle',
    description: 'Enable detailed logging for troubleshooting.',
    warning: true
  },
  { 
    id: 'adv-2', 
    section: 'Advanced', 
    name: 'API Access', 
    value: false, 
    type: 'toggle',
    description: 'Enable REST API for third-party integrations.'
  },
  { 
    id: 'adv-3', 
    section: 'Advanced', 
    name: 'Cache Duration', 
    value: '60', 
    type: 'select',
    options: ['0', '30', '60', '120', '300'],
    description: 'Cache timeout in minutes (0 = disabled).'
  },
  { 
    id: 'adv-4', 
    section: 'Advanced', 
    name: 'Maintenance Mode', 
    value: false, 
    type: 'toggle',
    description: 'Put system in maintenance mode.',
    warning: true
  }
];

export default function SettingsPage() {
  const { useSupabaseAuth, loading, session, user } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<SettingRow | null>(null);
  const [rows, setRows] = useState<SettingRow[]>(defaultSettings);
  const [activeSection, setActiveSection] = useState<SettingSection>('Organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  const sections: { key: SettingSection; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'Organization', label: 'Organization', icon: <Building2 size={18} />, count: rows.filter(r => r.section === 'Organization').length },
    { key: 'Security', label: 'Security', icon: <Shield size={18} />, count: rows.filter(r => r.section === 'Security').length },
    { key: 'Notifications', label: 'Notifications', icon: <Bell size={18} />, count: rows.filter(r => r.section === 'Notifications').length },
    { key: 'Profile', label: 'Profile', icon: <UserRound size={18} />, count: rows.filter(r => r.section === 'Profile').length },
    { key: 'Appearance', label: 'Appearance', icon: <Palette size={18} />, count: rows.filter(r => r.section === 'Appearance').length },
    { key: 'Data', label: 'Data & Backup', icon: <Database size={18} />, count: rows.filter(r => r.section === 'Data').length },
    { key: 'Integrations', label: 'Integrations', icon: <Zap size={18} />, count: rows.filter(r => r.section === 'Integrations').length },
    { key: 'Advanced', label: 'Advanced', icon: <Settings size={18} />, count: rows.filter(r => r.section === 'Advanced').length },
  ];

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(r => r.section === activeSection);
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [rows, activeSection, searchQuery]);

  const summary = useMemo(() => {
    const emailNotifications = rows.find(r => r.id === 'not-1')?.value as boolean;
    const twoFa = rows.find(r => r.id === 'sec-2')?.value as boolean;
    const autoBackup = rows.find(r => r.id === 'data-1')?.value as boolean;
    const debugMode = rows.find(r => r.id === 'adv-1')?.value as boolean;
    
    return {
      emailNotifications,
      twoFaEnabled: twoFa,
      autoBackup,
      debugMode,
      org: rows.find(r => r.id === 'org-1')?.value as string || '—',
      profile: useSupabaseAuth ? (user?.email || 'Account') : 'Demo Admin',
      warningCount: rows.filter(r => r.warning && !r.value).length,
    };
  }, [rows, useSupabaseAuth, user]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  const handleSaveSetting = (updatedSetting: SettingRow) => {
    setRows(prev => prev.map(p => (p.id === updatedSetting.id ? updatedSetting : p)));
    setHasUnsavedChanges(true);
    setSelected(null);
  };

  const handleBulkSave = () => {
    // Here you would typically save to backend
    setHasUnsavedChanges(false);
    // Show success toast
  };

  const handleResetSection = () => {
    const defaultSectionSettings = defaultSettings.filter(s => s.section === activeSection);
    setRows(prev => prev.map(p => {
      const defaultSetting = defaultSectionSettings.find(d => d.id === p.id);
      return defaultSetting ? { ...defaultSetting } : p;
    }));
    setHasUnsavedChanges(true);
  };

  const renderSettingInput = (setting: SettingRow) => {
    const commonProps = {
      className: "mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed",
      disabled: setting.disabled
    };

    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {setting.value ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => setSelected({ ...setting, value: !setting.value })}
              disabled={setting.disabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                setting.value ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={e => setSelected({ ...setting, value: e.target.value })}
            {...commonProps}
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={setting.value as string}
              onChange={e => setSelected({ ...setting, value: e.target.value })}
              className="w-12 h-10 border border-border rounded-lg cursor-pointer disabled:cursor-not-allowed"
              disabled={setting.disabled}
            />
            <input
              type="text"
              value={setting.value as string}
              onChange={e => setSelected({ ...setting, value: e.target.value })}
              placeholder="#000000"
              {...commonProps}
              className={commonProps.className + " flex-1"}
            />
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={e => setSelected({ ...setting, value: Number(e.target.value) })}
            placeholder={setting.placeholder}
            {...commonProps}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={setting.value as string}
            onChange={e => setSelected({ ...setting, value: e.target.value })}
            placeholder={setting.placeholder}
            {...commonProps}
          />
        );
      
      case 'password':
        return (
          <div className="relative mt-1">
            <input
              type={showPasswordField ? 'text' : 'password'}
              value={setting.value as string}
              onChange={e => setSelected({ ...setting, value: e.target.value })}
              placeholder={setting.placeholder}
              {...commonProps}
              className={commonProps.className + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPasswordField(!showPasswordField)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswordField ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={e => setSelected({ ...setting, value: e.target.value })}
            placeholder={setting.placeholder}
            {...commonProps}
          />
        );
    }
  };

  return (
    <AppLayout currentPath="/settings">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure organization, security, and system preferences.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleBulkSave}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              <Save size={16} />
              Save Changes
            </button>
          )}
          
          <button
            onClick={handleResetSection}
            className="flex items-center gap-2 bg-white border border-border text-sm font-medium rounded-lg px-3 py-2 hover:bg-muted transition-colors"
          >
            <RefreshCw size={16} />
            Reset Section
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <MetricCard 
          label="Organization" 
          value={summary.org} 
          subValue="Current profile" 
          icon={<Building2 size={18} />} 
          hero 
        />
        <MetricCard 
          label="Security Status" 
          value={summary.twoFaEnabled ? 'Secure' : 'At Risk'} 
          subValue={`2FA ${summary.twoFaEnabled ? 'Enabled' : 'Disabled'}`}
          icon={<Shield size={18} />} 
          iconBg="bg-amber-500/10" 
          warning={!summary.twoFaEnabled} 
        />
        <MetricCard 
          label="Notifications" 
          value={summary.emailNotifications ? 'Active' : 'Disabled'} 
          subValue="Email alerts"
          icon={<Bell size={18} />} 
          iconBg="bg-emerald-500/10" 
        />
        <MetricCard 
          label="Data Backup" 
          value={summary.autoBackup ? 'Enabled' : 'Disabled'} 
          subValue="Auto backup"
          icon={<Database size={18} />} 
          iconBg="bg-blue-500/10"
          warning={!summary.autoBackup}
        />
      </div>

      {/* Warning Banner */}
      {summary.warningCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Security Recommendations</h3>
            <p className="text-sm text-amber-700 mt-1">
              {summary.warningCount} security setting{summary.warningCount > 1 ? 's' : ''} need{summary.warningCount === 1 ? 's' : ''} attention. 
              Review the Security section to improve your system's protection.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Settings Categories</h3>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="p-2">
              {sections.map(section => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeSection === section.key
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {section.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {sections.find(s => s.key === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredRows.length} setting{filteredRows.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeSection === 'Data' && (
                    <>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Download size={16} />
                        Export
                      </button>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Upload size={16} />
                        Import
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {filteredRows.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Settings size={48} className="text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-foreground mb-2">No settings found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search query.' : 'No settings available in this section.'}
                  </p>
                </div>
              ) : (
                filteredRows.map(setting => (
                  <div
                    key={setting.id}
                    className="px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {setting.name}
                          </h4>
                          {setting.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                          {setting.warning && !setting.value && (
                            <AlertTriangle size={14} className="text-amber-500" />
                          )}
                          {setting.info && (
                            <div className="group relative">
                              <Info size={14} className="text-blue-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {setting.info}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {setting.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {setting.description}
                          </p>
                        )}
                        
                        <div className="max-w-md">
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {setting.type !== 'toggle' && (
                          <button
                            onClick={() => setSelected(setting)}
                            disabled={setting.disabled}
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Setting Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Edit ${selected?.name}`}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {sections.find(s => s.key === selected.section)?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.section}</p>
                  {selected.description && (
                    <p className="text-sm text-muted-foreground mt-2">{selected.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Value {selected.required && <span className="text-red-500">*</span>}
              </label>
              {renderSettingInput(selected)}
              
              {selected.warning && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    This setting affects system security. Please review carefully before making changes.
                  </p>
                </div>
              )}
              
              {selected.info && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">{selected.info}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSetting(selected)}
                disabled={selected.required && !selected.value}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check size={16} />
                Save Setting
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
