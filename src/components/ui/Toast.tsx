'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          borderRadius: '12px',
          border: '1px solid hsl(220,15%,88%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        },
      }}
      richColors
    />
  );
}