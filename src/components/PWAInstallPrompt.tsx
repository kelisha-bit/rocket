'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Detect device type
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkInstalled();
    detectDevice();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success('App Installed!', {
        description: 'GreaterWorks has been installed successfully.'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', detectDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', detectDevice);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      showManualInstallInstructions();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Installing App...', {
          description: 'GreaterWorks is being installed on your device.'
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
      showManualInstallInstructions();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    toast.info('Install Reminder', {
      description: 'You can install the app anytime from your browser menu.'
    });
  };

  const showManualInstallInstructions = () => {
    const instructions = getInstallInstructions();
    toast.info('Install GreaterWorks', {
      description: instructions,
      duration: 8000
    });
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && deviceType === 'mobile') {
      return 'Tap the menu (⋮) and select "Add to Home screen"';
    } else if (userAgent.includes('safari') && deviceType === 'mobile') {
      return 'Tap the Share button and select "Add to Home Screen"';
    } else if (userAgent.includes('chrome')) {
      return 'Click the install icon in the address bar or go to Menu > Install GreaterWorks';
    } else if (userAgent.includes('firefox')) {
      return 'Click the menu and select "Install this site as an app"';
    } else if (userAgent.includes('edge')) {
      return 'Click the menu (⋯) and select "Apps" > "Install this site as an app"';
    }
    
    return 'Look for an install option in your browser menu';
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone size={20} className="text-blue-600" />;
      case 'tablet':
        return <Tablet size={20} className="text-blue-600" />;
      default:
        return <Monitor size={20} className="text-blue-600" />;
    }
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white border border-border rounded-xl shadow-lg p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            {getDeviceIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Install GreaterWorks
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Get quick access to your church management system. Works offline and feels like a native app.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={12} />
                Install App
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}