'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { Loader2, Eye, EyeOff, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // --- AUTO DISMISS ERROR BANNER ---
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.role === 'ADMIN' || res.data.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* ERROR TOAST NOTIFICATION */}
      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border-l-4 border-red-500 py-3 px-4 rounded-lg shadow-xl animate-in slide-in-from-right-8 fade-in duration-300 max-w-sm w-full">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEFT: BRANDING SIDEBAR (Cleaner, more integrated) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1120] relative flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            AgentHub Infrastructure
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            The secure, scalable gateway for Identity Verification, Corporate Filings, and Utility Payments in Nigeria.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-xs font-medium text-slate-600">
          © {new Date().getFullYear()} AgentHub Systems Ltd. All rights reserved.
        </div>
      </div>

      {/* RIGHT: AUTH FORM (Highly Compact & Professional) */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-6">
        
        {/* Compact Form Container */}
        <div className="w-full max-w-[380px]">
          
          {/* 1. Precise Logo Placement */}
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={160} 
                height={48} 
                priority
                className="object-contain h-9 w-auto"
              />
            </Link>
          </div>

          {/* 2. Structured Headers */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Log in to your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Registration Success Banner */}
          {registered && (
            <div className="mb-6 bg-green-50 dark:bg-green-500/10 p-3 rounded-lg flex items-center gap-2 border border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-4 h-4 shrink-0" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Registration successful! Please log in.</p>
            </div>
          )}

          {/* 3. Tightly Packed Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                className="block w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="block w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500/50 border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                Remember for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Create an account
                </Link>
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
