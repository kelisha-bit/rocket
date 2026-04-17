'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword, useSupabaseAuth } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>();

  const password = watch('password');

  useEffect(() => {
    if (!useSupabaseAuth) {
      toast.error('Password reset requires Supabase auth to be enabled.');
    }
  }, [useSupabaseAuth]);

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      if (!useSupabaseAuth) {
        toast.error('Supabase auth is not enabled.');
        return;
      }
      await updatePassword(data.password);
      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Password updated</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
          <Link
            href="/sign-up-login-screen"
            className="w-full inline-block bg-[#1B4F8A] hover:bg-[#163f6f] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-[#1B4F8A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GW</span>
          </div>
          <span className="font-bold text-foreground">GreaterWorks</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">Set new password</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter your new password below. Make it strong and unique.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
                  errors.password
                    ? 'border-destructive focus:ring-destructive/20'
                    : 'border-border focus:ring-primary/20'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must include uppercase, lowercase, and a number',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-foreground mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
                  errors.confirmPassword
                    ? 'border-destructive focus:ring-destructive/20'
                    : 'border-border focus:ring-primary/20'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1.5">{errors.confirmPassword.message}</p>
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
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
