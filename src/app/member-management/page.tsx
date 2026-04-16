'use client';

import React, { useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import MemberManagementContent from './components/MemberManagementContent';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MemberManagementPage() {
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
    <AppLayout currentPath="/member-management">
      <MemberManagementContent />
    </AppLayout>
  );
}