'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Filter,
  SortAsc,
  FileText,
  Settings
} from 'lucide-react';

interface ReportConfigurationProps {
  config: any;
  onConfigChange: (config: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const reportTypes = [
  { id: 'summary', label: 'Summary Report', description: 'High-level overview with key metrics' },
  { id: 'detailed', label: 'Detailed Report', description: 'Comprehensive data with all fields' },
  { id: 'analytical', label: 'Analytical Report', description: 'Charts and graphs with insights' },
  { id: 'comparison', label: 'Comparison Report', description: 'Period-over-period comparisons' }
];

const dateRanges = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'last_quarter', label: 'Last Quarter' },
  { id: 'this_year', label: 'This Year' },
  { id: 'last_year', label: 'Last Year' },
  { id: 'custom', label: 'Custom Range' }
];

const outputFormats = [
  { id: 'pdf', label: 'PDF Document', description: 'Professional formatted document' },
  { id: 'excel', label: 'Excel Spreadsheet', description: 'Data in spreadsheet format' },
  { id: 'csv', label: 'CSV File', description: 'Comma-separated values' },
  { id: 'powerpoint', label: 'PowerPoint', description: 'Presentation format with charts' }
];

export default function ReportConfiguration({ config, onConfigChange, onNext, onPrevious }: ReportConfigurationProps) {
  const [showCustomDate, setShowCustomDate] = useState(config.dateRange === 'custom');

  const handleConfigUpdate = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value });
    
    if (key === 'dateRange') {
      setShowCustomDate(value === 'custom');
    }
  };

  const handleNext = () => {
    if (config.title && config.type && config.dateRange && config.format) {
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Report Configuration</h2>
        <p className="text-muted-foreground">
          Configure your report settings, filters, and output format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText size={16} />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Title *
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => handleConfigUpdate('title', e.target.value)}
                  placeholder="Enter report title..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => handleConfigUpdate('description', e.target.value)}
                  placeholder="Brief description of the report..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Report Type */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings size={16} />
              Report Type *
            </h3>
            
            <div className="space-y-2">
              {reportTypes.map(type => (
                <label
                  key={type.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    config.type === type.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={config.type === type.id}
                    onChange={(e) => handleConfigUpdate('type', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-foreground">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range & Filters */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Date Range *
            </h3>
            
            <select
              value={config.dateRange}
              onChange={(e) => handleConfigUpdate('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select date range...</option>
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
            
            {showCustomDate && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={config.startDate || ''}
                    onChange={(e) => handleConfigUpdate('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={config.endDate || ''}
                    onChange={(e) => handleConfigUpdate('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Output Format */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Filter size={16} />
              Output Format *
            </h3>
            
            <div className="space-y-2">
              {outputFormats.map(format => (
                <label
                  key={format.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    config.format === format.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="outputFormat"
                    value={format.id}
                    checked={config.format === format.id}
                    onChange={(e) => handleConfigUpdate('format', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-foreground">{format.label}</p>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <SortAsc size={16} />
              Advanced Options
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeCharts || false}
                  onChange={(e) => handleConfigUpdate('includeCharts', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-foreground">Include charts and graphs</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeSummary || false}
                  onChange={(e) => handleConfigUpdate('includeSummary', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-foreground">Include executive summary</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeRawData || false}
                  onChange={(e) => handleConfigUpdate('includeRawData', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-foreground">Include raw data tables</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Data Sources
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {!config.title || !config.type || !config.dateRange || !config.format
              ? 'Please fill in all required fields'
              : 'Configuration complete'
            }
          </div>
          
          <button
            onClick={handleNext}
            disabled={!config.title || !config.type || !config.dateRange || !config.format}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Report
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}