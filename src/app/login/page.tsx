'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  Loader2, Mail, Lock, ChevronRight, Eye, EyeOff, 
  AlertCircle, X, CheckCircle2 
} from 'lucide-react';

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* ERROR TOAST NOTIFICATION */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-3 bg-white dark:bg-slate-900 border-l-4 border-red-500 p-4 rounded-lg shadow-xl animate-in slide-in-from-right-4 fade-in duration-200 max-w-sm w-full">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authentication Error</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex flex-col w-[40%] bg-[#0B1120] relative p-10 border-r border-slate-800/60">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        {/* Anchored Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={150} 
                height={45} 
                priority
                className="object-contain h-9 w-auto"
             />
          </Link>
        </div>

        {/* Centered Context */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <h2 className="text-3xl font-bold text-white tracking-tight leading-snug mb-4">
            Secure access to your operations.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Log in to manage your API keys, track corporate filings, and monitor identity verification requests in real-time.
          </p>
          
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500" /> API Gateway Management
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500" /> Transaction History & Billing
             </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-600 font-medium">
          © {new Date().getFullYear()} AgentHub Systems Ltd.
        </div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-y-auto">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center justify-center">
           <Link href="/">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={140} 
                height={40} 
                className="object-contain h-8 w-auto"
             />
           </Link>
        </div>

        <div className="w-full max-w-[400px] mx-auto mt-12 lg:mt-0">
          
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Log in to your account</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {registered && (
             <div className="mb-6 bg-green-50 dark:bg-green-500/10 p-3.5 rounded-lg flex items-center gap-2.5 border border-green-200 dark:border-green-500/20">
                <CheckCircle2 className="text-green-600 dark:text-green-400 w-4 h-4 shrink-0" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Registration successful! You can now log in.</p>
             </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                    Forgot password?
                  </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Remember for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Sign up
                </Link>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
