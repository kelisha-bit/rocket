'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, Info, Check, X } from 'lucide-react';

interface SettingFieldProps {
  label: string;
  description?: string;
  value: string | boolean | number;
  type: 'text' | 'select' | 'toggle' | 'number' | 'email' | 'password' | 'color' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  warning?: boolean;
  info?: string;
  onChange: (value: string | boolean | number) => void;
  onSave?: () => void;
  className?: string;
}

export default function SettingField({
  label,
  description,
  value,
  type,
  options,
  placeholder,
  required,
  disabled,
  warning,
  info,
  onChange,
  onSave,
  className = ''
}: SettingFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
    onSave?.();
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const commonInputProps = {
    className: `w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${
      warning ? 'border-amber-300 focus:ring-amber-200' : ''
    }`,
    disabled: disabled || !isEditing
  };

  const renderInput = () => {
    switch (type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {value ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => onChange(!value)}
              disabled={disabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                value ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={isEditing ? tempValue as string : value as string}
            onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
            {...commonInputProps}
          >
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={isEditing ? tempValue as string : value as string}
              onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
              className="w-12 h-10 border border-border rounded-lg cursor-pointer disabled:cursor-not-allowed"
              disabled={disabled || !isEditing}
            />
            <input
              type="text"
              value={isEditing ? tempValue as string : value as string}
              onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
              placeholder={placeholder}
              {...commonInputProps}
              className={commonInputProps.className + " flex-1"}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            value={isEditing ? tempValue as string : value as string}
            onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            {...commonInputProps}
            className={commonInputProps.className + " resize-none"}
          />
        );
      
      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={isEditing ? tempValue as string : value as string}
              onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
              placeholder={placeholder}
              {...commonInputProps}
              className={commonInputProps.className + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={isEditing ? tempValue as number : value as number}
            onChange={e => isEditing ? setTempValue(Number(e.target.value)) : onChange(Number(e.target.value))}
            placeholder={placeholder}
            {...commonInputProps}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={isEditing ? tempValue as string : value as string}
            onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
            placeholder={placeholder}
            {...commonInputProps}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={isEditing ? tempValue as string : value as string}
            onChange={e => isEditing ? setTempValue(e.target.value) : onChange(e.target.value)}
            placeholder={placeholder}
            {...commonInputProps}
          />
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-semibold text-foreground">
              {label}
            </label>
            {required && <span className="text-xs text-red-500">*</span>}
            {warning && <AlertTriangle size={14} className="text-amber-500" />}
            {info && (
              <div className="group relative">
                <Info size={14} className="text-blue-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {info}
                </div>
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}
        </div>
        
        {type !== 'toggle' && !disabled && (
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1.5 text-primary hover:text-primary/80 rounded-lg hover:bg-primary/10 transition-colors"
                  title="Save"
                >
                  <Check size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="max-w-md">
        {renderInput()}
      </div>
      
      {warning && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            This setting affects system security. Please review carefully.
          </p>
        </div>
      )}
    </div>
  );
}