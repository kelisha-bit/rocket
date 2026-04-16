'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, Users, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const quickActions = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Users size={20} />, label: 'Members', href: '/member-management' },
    { icon: <BookOpen size={20} />, label: 'Attendance', href: '/attendance' },
    { icon: <FileText size={20} />, label: 'Reports', href: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Offline Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} className="text-gray-400" />
        </div>

        {/* Title and Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          It looks like you've lost your internet connection. Don't worry, you can still access some features of GreaterWorks.
        </p>

        {/* Connection Status */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {isOnline ? 'Connection Restored' : 'No Internet Connection'}
        </div>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={!isOnline}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all mb-6 ${
            isOnline
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={16} className={isOnline ? '' : 'opacity-50'} />
          {isOnline ? 'Reload Page' : 'Waiting for Connection...'}
        </button>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-blue-600">
                    {action.icon}
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Offline Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Offline</h4>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• View cached member information</li>
            <li>• Access recent reports</li>
            <li>• Browse attendance records</li>
            <li>• Use offline calculator tools</li>
          </ul>
        </div>

        {/* App Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            GreaterWorks Church Management
          </div>
        </div>
      </div>
    </div>
  );
}