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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* CUSTOM CSS FOR THE ANIMATED TEXT */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        .animated-gradient-text {
          background: linear-gradient(to right, #2563eb 20%, #60a5fa 40%, #60a5fa 60%, #2563eb 80%);
          background-size: 200% auto;
          color: #000;
          background-clip: text;
          text-fill-color: transparent;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        .dark .animated-gradient-text {
          background: linear-gradient(to right, #60a5fa 20%, #93c5fd 40%, #93c5fd 60%, #60a5fa 80%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
        }
      `}} />

      {/* ERROR TOAST NOTIFICATION */}
      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border-l-4 border-red-500 py-4 px-5 rounded-xl shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 max-w-sm w-full">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* LEFT: BRANDING SIDEBAR */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1120] relative flex-col justify-center items-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            The intelligent gateway to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Identity Services.
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-md mx-auto">
            Secure, scalable, and built for businesses. Verify NINs, resolve BVNs, and process utility payments instantly.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 text-center text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} AgentHub Systems Ltd.
        </div>
      </div>

      {/* RIGHT: AUTH FORM */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-6 sm:p-12">
        
        {/* Card Wrapper for Mature Structure */}
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
          
          {/* Logo & Animated Text */}
          <div className="mb-10 flex justify-center">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo-agenthub.png" 
                alt="Logo" 
                width={48} 
                height={48} 
                priority
                className="object-contain h-10 w-10 sm:h-12 sm:w-12 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest animated-gradient-text">
                AGENTHUB
              </span>
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Registration Success Banner */}
          {registered && (
            <div className="mb-6 bg-green-50 dark:bg-green-500/10 p-4 rounded-xl flex items-center gap-3 border border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5 shrink-0" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Registration successful! Please log in.</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                /* text-base PREVENTS MOBILE ZOOM */
                className="block w-full px-4 py-3.5 text-base border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  /* text-base PREVENTS MOBILE ZOOM */
                  className="block w-full pl-4 pr-12 py-3.5 text-base border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500/50 border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-md shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
        </div>
        
        {/* Footer Link */}
        <div className="mt-8 text-center">
           <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                Register now
              </Link>
           </p>
        </div>

      </div>
    </div>
  );
}
