'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  Calendar, 
  DollarSign,
  BookOpen,
  Home,
  UsersRound,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const dataSources = [
  {
    id: 'members',
    title: 'Member Data',
    description: 'Member profiles, demographics, and contact information',
    icon: <Users size={20} className="text-blue-600" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    tables: ['members', 'member_profiles', 'contact_info'],
    recordCount: 1284,
    lastUpdated: '2 hours ago'
  },
  {
    id: 'attendance',
    title: 'Attendance Records',
    description: 'Service attendance, check-ins, and participation data',
    icon: <BookOpen size={20} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    tables: ['attendance', 'service_records', 'check_ins'],
    recordCount: 15420,
    lastUpdated: '1 hour ago'
  },
  {
    id: 'financial',
    title: 'Financial Data',
    description: 'Giving records, tithes, offerings, and financial transactions',
    icon: <DollarSign size={20} className="text-green-600" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    tables: ['giving_transactions', 'tithes', 'offerings', 'pledges'],
    recordCount: 8934,
    lastUpdated: '30 minutes ago'
  },
  {
    id: 'events',
    title: 'Events & Programs',
    description: 'Event registrations, participation, and program data',
    icon: <Calendar size={20} className="text-amber-600" />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    tables: ['events', 'registrations', 'programs'],
    recordCount: 456,
    lastUpdated: '4 hours ago'
  },
  {
    id: 'cellgroups',
    title: 'Cell Groups',
    description: 'Cell group membership, activities, and leadership data',
    icon: <Home size={20} className="text-teal-600" />,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    tables: ['cell_groups', 'cell_members', 'cell_activities'],
    recordCount: 89,
    lastUpdated: '6 hours ago'
  },
  {
    id: 'ministries',
    title: 'Ministry Data',
    description: 'Ministry participation, volunteer records, and service data',
    icon: <UsersRound size={20} className="text-indigo-600" />,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    tables: ['ministries', 'volunteers', 'ministry_participation'],
    recordCount: 234,
    lastUpdated: '3 hours ago'
  }
];

interface DataSourceSelectorProps {
  config: any;
  onConfigChange: (config: any) => void;
  onNext: () => void;
}

export default function DataSourceSelector({ config, onConfigChange, onNext }: DataSourceSelectorProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(config.dataSources || []);

  const handleSourceToggle = (sourceId: string) => {
    const newSources = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId];
    
    setSelectedSources(newSources);
    onConfigChange({ ...config, dataSources: newSources });
  };

  const handleNext = () => {
    if (selectedSources.length > 0) {
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Select Data Sources</h2>
        <p className="text-muted-foreground">
          Choose the data sources you want to include in your report. You can select multiple sources to create comprehensive reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {dataSources.map(source => {
          const isSelected = selectedSources.includes(source.id);
          
          return (
            <div
              key={source.id}
              onClick={() => handleSourceToggle(source.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? `${source.borderColor} bg-blue-50/30 border-2` 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${source.bgColor} rounded-lg flex items-center justify-center`}>
                  {source.icon}
                </div>
                {isSelected && (
                  <CheckCircle size={20} className="text-green-600" />
                )}
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">{source.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {source.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{source.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="font-medium">{source.tables.length}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {source.tables.slice(0, 2).map((table, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                    >
                      {table}
                    </span>
                  ))}
                  {source.tables.length > 2 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{source.tables.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Sources Summary */}
      {selectedSources.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-2">Selected Data Sources ({selectedSources.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSources.map(sourceId => {
              const source = dataSources.find(s => s.id === sourceId);
              return (
                <span
                  key={sourceId}
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-lg text-sm"
                >
                  {source?.icon}
                  {source?.title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {selectedSources.length === 0 
            ? 'Select at least one data source to continue'
            : `${selectedSources.length} data source${selectedSources.length > 1 ? 's' : ''} selected`
          }
        </div>
        
        <button
          onClick={handleNext}
          disabled={selectedSources.length === 0}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Configuration
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}