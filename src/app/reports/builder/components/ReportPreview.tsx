'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Share2,
  FileText,
  Calendar,
  Database,
  Settings,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportPreviewProps {
  config: any;
  onConfigChange: (config: any) => void;
  onPrevious: () => void;
}

export default function ReportPreview({ config, onConfigChange, onPrevious }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate report generation with progress
    const steps = [
      { message: 'Connecting to data sources...', progress: 20 },
      { message: 'Applying filters and processing data...', progress: 40 },
      { message: 'Generating charts and visualizations...', progress: 60 },
      { message: 'Formatting report layout...', progress: 80 },
      { message: 'Finalizing report...', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(step.progress);
      toast.info('Generating Report', { description: step.message });
    }

    setIsGenerating(false);
    toast.success('Report Generated Successfully', { 
      description: `${config.title} is ready for download` 
    });
  };

  const handlePreviewReport = () => {
    toast.info('Opening Preview', { 
      description: 'Report preview will open in a new window' 
    });
  };

  const handleShareReport = () => {
    toast.success('Share Link Created', { 
      description: 'Report share link copied to clipboard' 
    });
  };

  const getEstimatedTime = () => {
    const baseTime = 2; // Base 2 minutes
    const sourceMultiplier = config.dataSources?.length || 1;
    const typeMultiplier = config.type === 'detailed' ? 1.5 : config.type === 'analytical' ? 2 : 1;
    
    return Math.ceil(baseTime * sourceMultiplier * typeMultiplier);
  };

  const getEstimatedSize = () => {
    const baseSize = 1.2; // Base 1.2 MB
    const sourceMultiplier = config.dataSources?.length || 1;
    const formatMultiplier = config.format === 'excel' ? 1.5 : config.format === 'powerpoint' ? 2 : 1;
    
    return (baseSize * sourceMultiplier * formatMultiplier).toFixed(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Report Preview</h2>
        <p className="text-muted-foreground">
          Review your report configuration and generate the final report.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText size={16} />
              Report Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium text-foreground">{config.title}</span>
              </div>
              
              {config.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium text-foreground text-right max-w-xs">
                    {config.description}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-foreground capitalize">
                  {config.type?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium text-foreground uppercase">{config.format}</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Database size={16} />
              Data Sources ({config.dataSources?.length || 0})
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {config.dataSources?.map((source: string) => (
                <span
                  key={source}
                  className="inline-flex items-center gap-1 bg-white border border-border text-foreground px-3 py-1 rounded-lg text-sm"
                >
                  <CheckCircle size={12} className="text-green-600" />
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </span>
              )) || (
                <span className="text-muted-foreground text-sm">No data sources selected</span>
              )}
            </div>
          </div>

          {/* Configuration Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings size={16} />
              Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">Date Range:</span>
                <p className="font-medium text-foreground capitalize">
                  {config.dateRange?.replace('_', ' ')}
                </p>
              </div>
              
              {config.includeCharts && (
                <div>
                  <span className="text-muted-foreground text-sm">Charts:</span>
                  <p className="font-medium text-foreground">Included</p>
                </div>
              )}
              
              {config.includeSummary && (
                <div>
                  <span className="text-muted-foreground text-sm">Summary:</span>
                  <p className="font-medium text-foreground">Included</p>
                </div>
              )}
              
              {config.includeRawData && (
                <div>
                  <span className="text-muted-foreground text-sm">Raw Data:</span>
                  <p className="font-medium text-foreground">Included</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generation Panel */}
        <div className="space-y-4">
          {/* Estimates */}
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Generation Estimates</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Time:</span>
                </div>
                <span className="font-medium text-foreground">~{getEstimatedTime()} min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Size:</span>
                </div>
                <span className="font-medium text-foreground">~{getEstimatedSize()} MB</span>
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 size={16} className="text-blue-600 animate-spin" />
                <span className="font-semibold text-blue-700">Generating Report...</span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              
              <div className="text-sm text-blue-600 text-center">
                {generationProgress}% Complete
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePreviewReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Eye size={16} />
              Preview Report
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate Report
                </>
              )}
            </button>
            
            <button
              onClick={handleShareReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white border border-border text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Share2 size={16} />
              Share Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
        <button
          onClick={onPrevious}
          disabled={isGenerating}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back to Configuration
        </button>
        
        <div className="text-sm text-muted-foreground">
          {isGenerating 
            ? 'Report generation in progress...'
            : 'Ready to generate your report'
          }
        </div>
      </div>
    </div>
  );
}