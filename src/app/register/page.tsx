'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  CheckCircle2, Loader2, ShieldCheck, Mail, Lock, 
  User, Phone, Briefcase, ChevronRight, Eye, EyeOff, 
  KeyRound, Zap, Fingerprint, Building2, AlertCircle 
} from 'lucide-react';

export default function RegisterPage() {
  
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Loading States
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passStrength, setPassStrength] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- PASSWORD STRENGTH ---
  useEffect(() => {
    const p = formData.password;
    let score = 0;
    if (!p) { setPassStrength(0); return; }
    if (p.length > 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    setPassStrength(score);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ACTIONS ---
  const sendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
        setError("Please enter a valid email address first.");
        return;
    }
    setError('');
    setOtpLoading(true);
    try {
        await axios.post('/api/auth/otp/send', { email: formData.email });
        setIsOtpSent(true);
    } catch (err: any) {
        setError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
        setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return;
    setVerifyLoading(true);
    setError('');
    try {
        await axios.post('/api/auth/otp/verify', { email: formData.email, otp });
        setIsEmailVerified(true);
        setIsOtpSent(false);
    } catch (err: any) {
        setError(err.response?.data?.error || "Invalid OTP code.");
    } finally {
        setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
        setError("Please verify your email address to continue.");
        return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passStrength < 3) {
      setError("Password is too weak. Add numbers & symbols.");
      return;
    }

    setRegisterLoading(true);

    try {
      await axios.post('/api/auth/register', formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
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
      
      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0B1120] relative overflow-hidden flex-col justify-between p-12 lg:p-16 text-white border-r border-slate-800">
        
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12 group cursor-pointer inline-flex">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                AgentHub
            </span>
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
           <div className="flex items-center gap-4 p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-sm">Dashboard & API Access</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Immediate access to all services upon registration.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 p-4 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-sm">Bank-Grade Security</h4>
                  <p className="text-xs text-slate-400 mt-0.5">256-bit encryption with strict NDPR compliance.</p>
              </div>
           </div>

           <div className="text-sm text-slate-500 mt-8 font-medium">© {new Date().getFullYear()} AgentHub Systems Ltd.</div>
        </div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 relative overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center justify-between bg-slate-900 text-white border-b border-slate-800">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-xl">AgentHub</span>
           </div>
           <Link href="/login" className="text-sm text-blue-400 font-semibold hover:text-blue-300">Log in</Link>
        </div>

        <div className="w-full max-w-xl mx-auto mt-20 lg:mt-0">
          
          {success ? (
            /* SUCCESS STATE - Updated for open registration */
            <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl dark:shadow-none border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50 dark:ring-green-500/5">
                 <CheckCircle2 className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Registration Successful!</h2>
               <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                 Welcome to AgentHub. Your account is fully active. <br className="hidden sm:block" />
                 You can now log in to access your dashboard.
               </p>
               <Link href="/login" className="flex items-center justify-center w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
                 Go to Login <ChevronRight className="w-5 h-5 ml-1" />
               </Link>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div className="bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:p-10 lg:rounded-3xl lg:shadow-xl lg:dark:shadow-none lg:border lg:border-slate-200 lg:dark:border-slate-800">
              
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create your account</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                    Log in here
                  </Link>
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative group">
                    <InputIcon icon={User} active={formData.firstName.length > 0} />
                    <input
                      type="text" name="firstName" required placeholder="First Name"
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                      value={formData.firstName} onChange={handleChange}
                    />
                  </div>
                  <div className="relative group">
                    <InputIcon icon={User} active={formData.lastName.length > 0} />
                    <input
                      type="text" name="lastName" required placeholder="Last Name"
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                      value={formData.lastName} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email & OTP Section - Restyled as a dedicated secure block */}
                <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isOtpSent || isEmailVerified ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5' : ''}`}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <InputIcon icon={Mail} active={formData.email.length > 0} />
                            <input
                                type="email" name="email" required placeholder="name@company.com"
                                disabled={isEmailVerified || isOtpSent}
                                className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                    isEmailVerified 
                                    ? 'border-green-300 bg-green-50 text-green-900 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400' 
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-blue-500/50 focus:border-blue-500 group-hover:border-slate-400 dark:group-hover:border-slate-600'
                                } disabled:opacity-70`}
                                value={formData.email} onChange={handleChange}
                            />
                        </div>
                        
                        {!isEmailVerified && !isOtpSent && (
                            <button 
                                type="button" 
                                onClick={sendOtp}
                                disabled={otpLoading || !formData.email}
                                className="sm:w-auto w-full px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] whitespace-nowrap flex justify-center items-center"
                            >
                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Verify Email'}
                            </button>
                        )}

                        {isEmailVerified && (
                             <div className="sm:w-auto w-full px-5 py-3.5 flex items-center justify-center bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-xl font-bold text-sm shadow-sm">
                                <CheckCircle2 className="w-5 h-5 mr-1.5" /> Verified
                             </div>
                        )}
                    </div>

                    {/* OTP Field (Conditionally Rendered) */}
                    {isOtpSent && !isEmailVerified && (
                        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center justify-between mb-2 ml-1">
                                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Enter the 6-digit code sent to your email</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                      <KeyRound className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text" placeholder="123456"
                                        className="block w-full pl-11 pr-4 py-3.5 border border-blue-300 dark:border-blue-500/50 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 text-slate-900 dark:text-white font-mono tracking-[0.2em] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                                        value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={verifyOtp}
                                    disabled={verifyLoading || otp.length < 6}
                                    className="sm:w-auto w-full px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] flex justify-center items-center"
                                >
                                    {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Business & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="relative group">
                        <InputIcon icon={Building2} active={formData.businessName.length > 0} />
                        <input
                            type="text" name="businessName" placeholder="Business Name (Optional)"
                            className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                            value={formData.businessName} onChange={handleChange}
                        />
                    </div>
                    <div className="relative group">
                        <InputIcon icon={Phone} active={formData.phoneNumber.length > 0} />
                        <input
                            type="tel" name="phoneNumber" required placeholder="Phone Number"
                            className="block w-full pl-11 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                            value={formData.phoneNumber} onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="relative group">
                        <InputIcon icon={Lock} active={formData.password.length > 0} />
                        <input
                            type={showPass ? "text" : "password"} name="password" required placeholder="Password"
                            className="block w-full pl-11 pr-12 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                            value={formData.password} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                            {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="relative group">
                        <InputIcon icon={Lock} active={formData.confirmPassword.length > 0} />
                        <input
                            type={showConfirm ? "text" : "password"} name="confirmPassword" required placeholder="Confirm Password"
                            className={`block w-full pl-11 pr-12 py-3.5 border rounded-xl shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-950 ${
                                formData.confirmPassword && formData.password !== formData.confirmPassword 
                                ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50 focus:border-blue-500 group-hover:border-slate-400 dark:group-hover:border-slate-600'
                            }`}
                            value={formData.confirmPassword} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Strength Meter */}
                {formData.password && (
                    <div className="pt-1">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password Strength</span>
                            <span className={`text-xs font-bold ${
                                passStrength <= 2 ? 'text-red-500' : passStrength <= 3 ? 'text-amber-500' : 'text-green-500'
                            }`}>
                                {passStrength <= 2 ? 'Weak' : passStrength <= 3 ? 'Fair' : 'Strong'}
                            </span>
                        </div>
                        <div className="flex gap-1.5 h-2 px-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-500 ${
                                passStrength >= level 
                                    ? (passStrength <= 2 ? 'bg-red-500' : passStrength <= 3 ? 'bg-amber-500' : 'bg-green-500') 
                                    : 'bg-slate-200 dark:bg-slate-800'
                                }`} 
                            />
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={registerLoading || !isEmailVerified}
                  className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 mt-6"
                >
                  {registerLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                        Complete Registration <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    By registering, you agree to our <Link href="#" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">Terms of Service</Link> and <Link href="#" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">Privacy Policy</Link>.
                </p>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
