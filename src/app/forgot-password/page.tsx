'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  Loader2, Mail, Lock, KeyRound, CheckCircle2, 
  ShieldCheck, ArrowLeft, Eye, EyeOff 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  // Steps: 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState(1);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // STEP 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/password-reset/request', { email });
      setStep(2); // Move to next step
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Confirm Reset
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/password-reset/confirm', { 
        email, otp, newPassword 
      });
      setStep(3); // Move to success step
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const InputIcon = ({ icon: Icon }: { icon: any }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      <Icon className="h-5 w-5" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AgentHub</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Account Recovery
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Securely reset your password using our OTP verification system.
          </p>
        </div>
        <div className="relative z-10 text-xs text-slate-600">© 2026 AgentHub Systems.</div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          
          {step === 3 ? (
            /* SUCCESS STATE */
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900/30 text-center animate-in fade-in zoom-in-95 duration-300">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
               <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                 Your password has been successfully updated. You can now login with your new credentials.
               </p>
               <Link href="/login" className="block w-full py-3.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                 Return to Login
               </Link>
            </div>
          ) : (
            /* FORM STATE */
            <div className="bg-white dark:bg-gray-800 p-0 lg:p-8 rounded-none lg:rounded-2xl lg:shadow-none dark:shadow-none">
              
              <div className="mb-8">
                <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Forgot Password?</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {step === 1 ? "Enter your email to receive a reset code." : "Enter the OTP sent to your email."}
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
                  </p>
                </div>
              )}

              {step === 1 ? (
                // --- STEP 1: EMAIL ---
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div className="relative">
                    <InputIcon icon={Mail} />
                    <input
                      type="email" required placeholder="Enter your email"
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                // --- STEP 2: OTP & NEW PASSWORD ---
                <form onSubmit={handleConfirmReset} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">OTP Code</label>
                    <div className="relative">
                      <InputIcon icon={KeyRound} />
                      <input
                        type="text" required placeholder="6-digit code" maxLength={6}
                        className="block w-full pl-10 pr-3 py-3.5 border border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white font-mono tracking-widest text-lg focus:outline-none focus:border-blue-500 transition-all"
                        value={otp} onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* New Passwords */}
                  <div className="space-y-4">
                     <div className="relative">
                        <InputIcon icon={Lock} />
                        <input
                            type={showPass ? "text" : "password"} required placeholder="New Password"
                            className="block w-full pl-10 pr-10 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer">
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                     </div>
                     <div className="relative">
                        <InputIcon icon={Lock} />
                        <input
                            type="password" required placeholder="Confirm New Password"
                            className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                     </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Reset Password'}
                  </button>
                  
                  <div className="text-center">
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Wrong email? Go back
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
