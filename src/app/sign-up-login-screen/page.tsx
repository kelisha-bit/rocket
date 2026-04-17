'use client';

import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[#1B4F8A] relative overflow-hidden flex-col justify-between p-12">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#C9922A] translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-white/30 -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">GW</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">GreaterWorks</p>
              <p className="text-white/60 text-xs">Church Management System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Serving the<br />
            <span className="text-[#E8B84B]">Greater Works</span><br />
            Vision
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Empowering Greater Works City Church with tools to shepherd members, steward resources, and advance the Kingdom in Accra and beyond.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '1,284', label: 'Active Members' },
              { value: '42', label: 'Cell Groups' },
              { value: '₵76K+', label: 'Monthly Giving' },
            ]?.map(stat => (
              <div key={`stat-${stat?.label}`} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white tabular-nums">{stat?.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{stat?.label}</p>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-8">
            © 2026 Greater Works City Church · Accra, Ghana
          </p>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        {mode === 'login' ? (
          <LoginForm onSwitchToSignUp={() => setMode('signup')} />
        ) : (
          <SignUpForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}