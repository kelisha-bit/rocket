
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const AuthContext = createContext<any>({});

type SignUpMetadata = {
  fullName?: string;
  avatarUrl?: string;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper to check if error is refresh token related
const isRefreshTokenError = (error: any): boolean => {
  if (!error) return false;
  const message = error.message || error.error?.message || '';
  return (
    message.includes('Invalid Refresh Token') ||
    message.includes('Refresh Token Not Found') ||
    message.includes('token is invalid') ||
    message.includes('session_not_found') ||
    error.status === 400 && message.includes('refresh')
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const useSupabaseAuth = process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH !== 'false';
  const supabase = useSupabaseAuth ? createClient() : null;

  // Handle sign out with cleanup
  const handleSignOut = async (redirect = true) => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // Ignore sign out errors
    }
    setUser(null);
    setSession(null);
    if (redirect && typeof window !== 'undefined') {
      window.location.href = '/sign-up-login-screen';
    }
  };

  useEffect(() => {
    if (!useSupabaseAuth || !supabase) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    // Get initial session with error handling
    supabase.auth.getSession().then((result: { data: { session: Session | null }; error: AuthError | null }) => {
      if (result.error && isRefreshTokenError(result.error)) {
        console.warn('Invalid refresh token detected, clearing session');
        handleSignOut(false);
        toast.error('Session expired', { description: 'Please sign in again.' });
      } else {
        setSession(result.data.session);
        setUser(result.data.session?.user ?? null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      if (isRefreshTokenError(error)) {
        handleSignOut(false);
        toast.error('Session expired', { description: 'Please sign in again.' });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      // Handle specific events
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [useSupabaseAuth]);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: SignUpMetadata = {}) => {
    if (!useSupabaseAuth || !supabase) {
      throw new Error('Supabase auth is disabled');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName || '',
          avatar_url: metadata.avatarUrl || ''
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    if (!useSupabaseAuth || !supabase) {
      throw new Error('Supabase auth is disabled');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async (scope: 'local' | 'global' | 'others' = 'local') => {
    if (!useSupabaseAuth || !supabase) {
      return;
    }
    try {
      const { error } = await supabase.auth.signOut({ scope });
      if (error && !isRefreshTokenError(error)) {
        throw error;
      }
    } catch (error) {
      if (isRefreshTokenError(error)) {
        // Token already invalid, just clear local state
        console.warn('Token invalid during sign out, clearing local state');
      } else {
        throw error;
      }
    } finally {
      // Always clear local state
      setUser(null);
      setSession(null);
    }
  };

  // Get Current User
  const getCurrentUser = async () => {
    if (!useSupabaseAuth || !supabase) {
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (!useSupabaseAuth || !supabase) {
      return null;
    }
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  };

  const value = {
    useSupabaseAuth,
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile,
    handleSignOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
