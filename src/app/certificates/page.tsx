'use client';

import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import CertificateManagementContent from './components/CertificateManagementContent';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CertificatesPage() {
  const { useSupabaseAuth, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!useSupabaseAuth) return;
    if (loading) return;
    if (!session) router.push('/sign-up-login-screen');
  }, [useSupabaseAuth, loading, session, router]);

  if (useSupabaseAuth && (loading || !session)) {
    return null;
  }

  return (
    <AppLayout currentPath="/certificates">
      <CertificateManagementContent />
    </AppLayout>
  );
}
