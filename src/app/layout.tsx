import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import ToastProvider from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import PWAProvider from '@/components/PWAProvider';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B4F8A',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: 'GreaterWorks — Church Management System',
  description: 'Comprehensive church management system for Greater Works City Church, Accra. Manage members, attendance, finances, events, and more.',
  keywords: ['church management', 'attendance tracking', 'member management', 'church software', 'Ghana church'],
  authors: [{ name: 'GreaterWorks Development Team' }],
  creator: 'GreaterWorks City Church',
  publisher: 'GreaterWorks City Church',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GreaterWorks',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'GreaterWorks Church Management',
    title: 'GreaterWorks — Church Management System',
    description: 'Comprehensive church management system for Greater Works City Church, Accra',
    images: [
      {
        url: '/screenshots/desktop-dashboard.png',
        width: 1280,
        height: 720,
        alt: 'GreaterWorks Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreaterWorks — Church Management System',
    description: 'Comprehensive church management system for Greater Works City Church, Accra',
    images: ['/screenshots/desktop-dashboard.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'GreaterWorks',
    'application-name': 'GreaterWorks',
    'msapplication-TileColor': '#1B4F8A',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#1B4F8A" />
        <meta name="background-color" content="#ffffff" />
        <meta name="display" content="standalone" />
        <meta name="orientation" content="portrait-primary" />
        
        {/* iOS Specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GreaterWorks" />
        
        {/* Windows Specific */}
        <meta name="msapplication-TileColor" content="#1B4F8A" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/icons/icon-192x192.png" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased">
        <PWAProvider>
          <AuthProvider>
            {children}
            <PWAInstallPrompt />
          </AuthProvider>
        </PWAProvider>
        <ToastProvider />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fgreaterwor5356back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}