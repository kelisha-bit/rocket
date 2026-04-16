'use client';

import React from 'react';
import { AlertTriangle, Info, Check, X } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  warning?: boolean;
  info?: string;
  actions?: React.ReactNode;
}

export default function SettingsSection({
  title,
  description,
  icon,
  children,
  warning,
  info,
  actions
}: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {title}
                {warning && <AlertTriangle size={16} className="text-amber-500" />}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        
        {info && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{info}</p>
          </div>
        )}
        
        {warning && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              This section contains security-sensitive settings. Please review changes carefully.
            </p>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}