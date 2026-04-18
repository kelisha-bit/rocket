'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const password = watch('password');

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, { fullName: data.fullName });
      setSignedUp(true);
      toast.success('Account created!', {
        description: 'Check your email to confirm your account, then sign in.',
      });
    } catch (e: any) {
      const msg: string = e?.message || 'Sign up failed';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { message: msg });
      } else {
        setError('fullName', { message: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (signedUp) {
    return (
      <div className="w-full max-w-md text-center">
        {/* Mobile logo */}
        <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-[#1B4F8A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GW</span>
          </div>
          <span className="font-bold text-foreground">GreaterWorks</span>
        </div>

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          We sent a confirmation link to your email address. Click the link to activate your account, then come back to sign in.
        </p>
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="w-full flex items-center justify-center gap-2 bg-[#1B4F8A] hover:bg-[#163f6f] text-white font-semibold text-sm py-2.5 rounded-lg transition-all duration-150"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-[#1B4F8A] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">GW</span>
        </div>
        <span className="font-bold text-foreground">GreaterWorks</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Greater Works City Church · Staff Portal
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Emmanuel Asante"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
              errors.fullName
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border focus:ring-primary/20'
            }`}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.fullName && (
            <p className="text-destructive text-xs mt-1.5">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <input
            id="email"
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
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
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
                  message: 'Must include uppercase, lowercase, and a number',
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••••"
              className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
                errors.confirmPassword
                  ? 'border-destructive focus:ring-destructive/20'
                  : 'border-border focus:ring-primary/20'
              }`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
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
              <UserPlus size={16} />
              Create account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
