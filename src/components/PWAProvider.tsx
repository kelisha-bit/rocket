'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection Restored', {
        description: 'You are back online!'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection Lost', {
        description: 'You are now offline. Some features may be limited.'
      });
    };

    // Set initial online status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              showUpdatePrompt(registration);
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
          showUpdatePrompt(registration);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const showUpdatePrompt = (registration: ServiceWorkerRegistration) => {
    toast.info('App Update Available', {
      description: 'A new version of GreaterWorks is available.',
      action: {
        label: 'Update',
        onClick: () => updateApp(registration)
      },
      duration: 10000
    });
  };

  const updateApp = (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return (
    <>
      {children}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium z-50">
          You are offline. Some features may be limited.
        </div>
      )}
      
      {/* Update available indicator */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium z-50">
          App update available. Refresh to get the latest version.
        </div>
      )}
    </>
  );
}