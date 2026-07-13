'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  Loader2, Mail, Lock, Eye, EyeOff, 
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
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000814] font-sans relative overflow-hidden px-4 sm:px-6">
      
      {/* Top Corporate Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#001232] via-[#FFB902] to-[#001232]"></div>

      {/* ERROR TOAST NOTIFICATION */}
      {error && (
        <div className="fixed top-6 right-6 md:right-8 z-50 flex items-center gap-3 bg-white dark:bg-[#001232] border-l-4 border-red-500 p-4 pr-5 rounded-md shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 max-w-sm w-full border-y border-r border-y-gray-200 border-r-gray-200 dark:border-y-gray-800 dark:border-r-gray-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CENTERED AUTH CARD */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#001232] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-gray-800/60 p-8 sm:p-10 relative z-10">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6 block transition-transform hover:scale-[1.02]">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Corporate Logo" 
                width={180} 
                height={50} 
                priority
                className="object-contain h-10 w-auto"
             />
          </Link>
          <h1 className="text-2xl font-bold text-[#001232] dark:text-white tracking-tight">
            Account Portal
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5">
            Authenticate to access your workspace.
          </p>
        </div>

        {/* Optional Success Banner */}
        {registered && (
           <div className="mb-6 bg-green-50 dark:bg-green-500/10 p-3.5 rounded-lg flex items-center gap-2.5 border border-green-200 dark:border-green-500/20 animate-in fade-in">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-4 h-4 shrink-0" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Registration successful. Please log in.</p>
           </div>
        )}

        {/* Auth Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase">
                  Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FFB902] transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#000a1c] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FFB902] focus:border-[#FFB902] transition-all"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300 uppercase">
                      Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-bold text-[#001232] hover:text-[#FFB902] dark:text-gray-300 dark:hover:text-[#FFB902] transition-colors">
                    Reset Password
                  </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FFB902] transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#000a1c] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FFB902] focus:border-[#FFB902] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#001232] focus:ring-[#FFB902] dark:border-gray-700 dark:bg-[#000a1c] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
              Keep me securely logged in
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#001232] dark:bg-[#FFB902] hover:bg-[#001232]/90 dark:hover:bg-[#FFB902]/90 text-white dark:text-[#001232] text-sm font-bold tracking-wide rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001232] dark:focus:ring-[#FFB902] disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              New to AgentHub?{' '}
              <Link href="/register" className="font-bold text-[#001232] hover:text-[#FFB902] dark:text-[#FFB902] dark:hover:text-white transition-colors">
                Request an account
              </Link>
           </p>
        </div>
      </div>
      
      {/* Background Footer Copyright */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} AgentHub Systems Ltd. All rights reserved.
        </p>
      </div>

    </div>
  );
}
