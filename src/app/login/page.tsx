'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  Loader2, Mail, Lock, ChevronRight, Eye, EyeOff, 
  ShieldCheck, Zap, Fingerprint, AlertCircle, X, CheckCircle2 
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
      // Redirect based on role
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

  // --- RENDER HELPERS ---
  const InputIcon = ({ icon: Icon, active }: { icon: any, active?: boolean }) => (
    <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>
      <Icon className="h-5 w-5" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* ERROR TOAST NOTIFICATION */}
      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border-l-4 border-red-500 p-4 pr-5 rounded-xl shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 max-w-sm w-full">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0B1120] relative overflow-hidden flex-col justify-between p-12 lg:p-16 text-white border-r border-slate-800">
        
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <Link href="/" className="mb-12 inline-block hover:opacity-90 transition-opacity">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={200} 
                height={60} 
                priority
                className="object-contain h-12 w-auto"
             />
          </Link>
          
          <h2 className="text-4xl lg:text-5xl font-bold leading-[1.15] mb-6 tracking-tight">
            Build with the premier <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Identity Infrastructure.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Join thousands of businesses streamlining NIN, BVN, Corporate Filings, and Utility Payments in one secure platform.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
           <div className="flex items-center gap-4 p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-sm">Dashboard & API Access</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Immediate access to all services upon registration.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-sm">Bank-Grade Security</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Strict data validation & 256-bit encryption.</p>
              </div>
           </div>

           <div className="text-sm text-slate-500 mt-8 font-medium">© {new Date().getFullYear()} AgentHub Systems Ltd.</div>
        </div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 relative overflow-y-auto">
        
        {/* Mobile Header with Logo */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center justify-between bg-slate-900 text-white border-b border-slate-800">
           <Link href="/">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={140} 
                height={40} 
                className="object-contain h-8 w-auto"
             />
           </Link>
           <Link href="/register" className="text-sm text-blue-400 font-semibold hover:text-blue-300">Register</Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-20 lg:mt-0">
          
          <div className="bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:p-10 lg:rounded-3xl lg:shadow-xl lg:dark:shadow-none lg:border lg:border-slate-200 lg:dark:border-slate-800">
            
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
                Enter your details to sign in.
              </p>
            </div>

            {/* Optional Success Banner if redirected from registration */}
            {registered && (
               <div className="mb-6 bg-green-50 dark:bg-green-500/10 p-4 rounded-xl flex items-center gap-3 border border-green-200 dark:border-green-500/20 animate-in fade-in">
                  <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">Registration successful! Please log in.</p>
               </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div className="relative group">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      Email Address
                  </label>
                  <InputIcon icon={Mail} active={email.length > 0} />
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>

              {/* Password Input */}
              <div className="relative group pt-1">
                  <div className="flex items-center justify-between mb-2 ml-1">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          Password
                      </label>
                      <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Forgot password?
                      </Link>
                  </div>
                  <InputIcon icon={Lock} active={password.length > 0} />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute bottom-0 right-0 h-[3.25rem] px-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-2 ml-1">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500/50 border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950 transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Sign In <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
               <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Don't have an account yet?{' '}
                  <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Create free account
                  </Link>
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
