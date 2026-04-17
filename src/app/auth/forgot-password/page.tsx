'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, useSupabaseAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>();

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      if (!useSupabaseAuth) {
        toast.error('Password reset requires Supabase auth to be enabled.');
        return;
      }
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success('Reset link sent', { description: 'Check your email inbox.' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link
          href="/sign-up-login-screen"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        {emailSent ? (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ve sent a password reset link to your email address. Click the link to set a new password.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/sign-up-login-screen"
              className="w-full inline-block bg-[#1B4F8A] hover:bg-[#163f6f] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-[#1B4F8A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GW</span>
              </div>
              <span className="font-bold text-foreground">GreaterWorks</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1">Forgot your password?</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@greaterworks.gh"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
                    errors.email
                      ? 'border-destructive focus:ring-destructive/20'
                      : 'border-border focus:ring-primary/20'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4F8A] hover:bg-[#163f6f] active:scale-[0.99] text-white font-semibold text-sm py-2.5 rounded-lg transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ minHeight: '42px' }}
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
