'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ReportBuilderHeader from './components/ReportBuilderHeader';
import ReportConfiguration from './components/ReportConfiguration';
import DataSourceSelector from './components/DataSourceSelector';
import ReportPreview from './components/ReportPreview';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ReportBuilderPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [reportConfig, setReportConfig] = useState({
    title: '',
    description: '',
    type: 'summary',
    dateRange: 'this_month',
    dataSources: [],
    filters: {},
    groupBy: [],
    sortBy: [],
    format: 'pdf'
  });

  React.useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  const steps = [
    { id: 1, title: 'Data Sources', description: 'Select data sources for your report' },
    { id: 2, title: 'Configuration', description: 'Configure report settings and filters' },
    { id: 3, title: 'Preview', description: 'Preview and generate your report' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DataSourceSelector
            config={reportConfig}
            onConfigChange={setReportConfig}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ReportConfiguration
            config={reportConfig}
            onConfigChange={setReportConfig}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <ReportPreview
            config={reportConfig}
            onConfigChange={setReportConfig}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout currentPath="/reports/builder">
      <ReportBuilderHeader currentStep={currentStep} steps={steps} />
      
      <div className="bg-white rounded-xl border border-border shadow-card">
        {renderStepContent()}
      </div>
    </AppLayout>
  );
}