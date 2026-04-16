'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine screen size
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      // Check if in fullscreen/standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsFullscreen(isStandalone);
    };

    // Initial check
    updateScreenInfo();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsFullscreen(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  // Add responsive classes to body
  useEffect(() => {
    const body = document.body;
    
    // Remove existing classes
    body.classList.remove('screen-mobile', 'screen-tablet', 'screen-desktop');
    body.classList.remove('orientation-portrait', 'orientation-landscape');
    body.classList.remove('mode-fullscreen', 'mode-browser');
    
    // Add current classes
    body.classList.add(`screen-${screenSize}`);
    body.classList.add(`orientation-${orientation}`);
    body.classList.add(isFullscreen ? 'mode-fullscreen' : 'mode-browser');
    
    return () => {
      // Cleanup on unmount
      body.classList.remove('screen-mobile', 'screen-tablet', 'screen-desktop');
      body.classList.remove('orientation-portrait', 'orientation-landscape');
      body.classList.remove('mode-fullscreen', 'mode-browser');
    };
  }, [screenSize, orientation, isFullscreen]);

  // Handle safe area insets for devices with notches
  useEffect(() => {
    const updateSafeAreaInsets = () => {
      const root = document.documentElement;
      
      // Get safe area insets
      const safeAreaTop = getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0px';
      const safeAreaBottom = getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0px';
      const safeAreaLeft = getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0px';
      const safeAreaRight = getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0px';
      
      // Set CSS custom properties for use in components
      root.style.setProperty('--app-safe-area-top', safeAreaTop);
      root.style.setProperty('--app-safe-area-bottom', safeAreaBottom);
      root.style.setProperty('--app-safe-area-left', safeAreaLeft);
      root.style.setProperty('--app-safe-area-right', safeAreaRight);
    };

    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets);
    
    return () => {
      window.removeEventListener('resize', updateSafeAreaInsets);
    };
  }, []);

  return (
    <div 
      className={`responsive-layout ${screenSize} ${orientation} ${isFullscreen ? 'fullscreen' : 'browser'}`}
      data-screen-size={screenSize}
      data-orientation={orientation}
      data-fullscreen={isFullscreen}
    >
      {children}
    </div>
  );
}