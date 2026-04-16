'use client';

import React from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ReportBuilderHeaderProps {
  currentStep: number;
  steps: Step[];
}

export default function ReportBuilderHeader({ currentStep, steps }: ReportBuilderHeaderProps) {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/reports"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Reports</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Report Builder</h1>
            <p className="text-sm text-muted-foreground">
              Create custom reports with advanced filtering and formatting
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.id < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`font-medium ${
                    step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}