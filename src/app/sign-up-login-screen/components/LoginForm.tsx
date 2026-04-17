'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Backend integration point: replace with real auth API call
const DEMO_CREDENTIALS = [
  { role: 'Pastor / Admin', email: 'pastor@greaterworks.gh', password: 'GW@Pastor2026', description: 'Full access to all modules' },
  { role: 'Finance Officer', email: 'finance@greaterworks.gh', password: 'GW@Finance2026', description: 'Finance & giving records only' },
  { role: 'Events Coordinator', email: 'events@greaterworks.gh', password: 'GW@Events2026', description: 'Events & programs management' },
  { role: 'Cell Group Leader', email: 'cellgroup@greaterworks.gh', password: 'GW@CellGroup2026', description: 'Cell group & member view' },
];

interface FormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { signIn, useSupabaseAuth } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ defaultValues: { rememberMe: false } });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (useSupabaseAuth) {
        await signIn(data.email, data.password);
        toast.success('Welcome back', { description: 'Redirecting to your dashboard…' });
        router.push(redirectTo);
        return;
      }

      // Demo auth — check hardcoded credentials + localStorage sign-ups
      await new Promise(r => setTimeout(r, 1200));
      const match = DEMO_CREDENTIALS.find(
        c => c.email === data.email && c.password === data.password
      );
      const demoUsers = JSON.parse(localStorage.getItem('gw_demo_users') || '[]');
      const demoMatch = demoUsers.find(
        (u: { email: string; password: string; fullName: string }) => u.email === data.email && u.password === data.password
      );

      if (match) {
        toast.success(`Welcome back, ${match.role}`, {
          description: 'Redirecting to your dashboard…',
        });
        setTimeout(() => router.push(redirectTo), 800);
      } else if (demoMatch) {
        toast.success(`Welcome back, ${demoMatch.fullName}`, {
          description: 'Redirecting to your dashboard…',
        });
        setTimeout(() => router.push(redirectTo), 800);
      } else {
        setError('email', { message: 'Invalid credentials — use the demo accounts below or sign up for a new account' });
      }
    } catch (e: any) {
      setError('email', { message: e?.message || 'Sign in failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const autofill = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setValue('email', cred.email, { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
    toast.info(`${cred.role} credentials loaded`);
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-8 h-8 bg-[#1B4F8A] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">GW</span>
        </div>
        <span className="font-bold text-foreground">GreaterWorks</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Sign in to your account</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Greater Works City Church · Staff Portal
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
                ? 'border-destructive focus:ring-destructive/20' :'border-border focus:ring-primary/20'
            }`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1.5 flex items-center gap-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••"
              className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-shadow ${
                errors.password
                  ? 'border-destructive focus:ring-destructive/20' :'border-border focus:ring-primary/20'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
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

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
            Keep me signed in for 30 days
          </label>
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
              <LogIn size={16} />
              Sign in to GreaterWorks
            </>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-8 rounded-xl border border-border bg-muted/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/60 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-foreground">Demo Accounts — click any row to autofill</span>
        </div>
        <div className="divide-y divide-border">
          {DEMO_CREDENTIALS.map(cred => (
            <button
              key={`cred-${cred.role}`}
              type="button"
              onClick={() => autofill(cred)}
              className="w-full text-left px-4 py-3 hover:bg-white transition-colors group"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cred.role}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">{cred.email}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{cred.description}</p>
                </div>
                <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium shrink-0">
                  Use →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-primary font-medium hover:underline"
        >
          Create one
        </button>
      </p>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Need help accessing your account?{' '}
        <span className="text-primary cursor-pointer hover:underline">Contact church admin</span>
      </p>
    </div>
  );
}