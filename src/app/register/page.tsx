'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Loader2, Mail, Lock, User, Phone, ChevronRight, Eye, EyeOff, 
  KeyRound, Zap, Fingerprint, Building2, AlertCircle, X, Edit2, CheckCircle2
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
  const [countdown, setCountdown] = useState(0);
  
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

  // --- AUTO DISMISS ERROR BANNER ---
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- OTP COUNTDOWN TIMER ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
    }
    setError('');
    setOtpLoading(true);
    try {
        await axios.post('/api/auth/otp/send', { email: formData.email });
        setIsOtpSent(true);
        setCountdown(60); 
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
        setCountdown(0); 
    } catch (err: any) {
        setError(err.response?.data?.error || "Invalid OTP code.");
    } finally {
        setVerifyLoading(false);
    }
  };

  const handleEditEmail = () => {
    setIsOtpSent(false);
    setOtp('');
    setCountdown(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const localNum = formData.phoneNumber.startsWith('0') ? formData.phoneNumber.substring(1) : formData.phoneNumber;
    const fullPhoneNumber = `+234${localNum}`;

    const phoneRegex = /^(?:\+234)[789][01]\d{8}$/;
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;

    if (!isEmailVerified) {
        setError("Please verify your email address to continue.");
        return;
    }
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
        setError("Names can only contain letters and spaces.");
        return;
    }
    if (!phoneRegex.test(fullPhoneNumber)) {
        setError("Please enter a valid 10-digit Nigerian phone number.");
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
      const payload = { ...formData, phoneNumber: fullPhoneNumber };
      await axios.post('/api/auth/register', payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const InputIcon = ({ icon: Icon, active }: { icon: any, active?: boolean }) => (
    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>
      <Icon className="h-4 w-4" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* ERROR TOAST */}
      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border-l-4 border-red-500 p-4 pr-5 rounded-lg shadow-xl animate-in slide-in-from-right-8 fade-in duration-300 max-w-sm w-full">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0B1120] relative overflow-hidden flex-col justify-between p-10 lg:p-12 text-white border-r border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <Link href="/" className="mb-10 inline-block hover:opacity-90 transition-opacity">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub Logo" 
                width={160} 
                height={48} 
                priority
                className="object-contain h-10 w-auto"
             />
          </Link>
          
          <h2 className="text-3xl lg:text-4xl font-bold leading-[1.2] mb-4 tracking-tight">
            Build with the premier <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Identity Infrastructure.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Join thousands of businesses streamlining NIN, BVN, Corporate Filings, and Utility Payments in one secure platform.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3 p-3 bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-xs">Dashboard & API Access</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Immediate access to all services.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 p-3 bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-white font-semibold text-xs">Bank-Grade Security</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Strict data validation & encryption.</p>
              </div>
           </div>

           <div className="text-xs text-slate-500 mt-6 font-medium">© {new Date().getFullYear()} AgentHub Systems Ltd.</div>
        </div>
      </div>

      {/* 2. RIGHT CONTENT */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-6 lg:px-12 relative overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-5 flex items-center justify-between bg-slate-900 text-white border-b border-slate-800">
           <Link href="/">
             <Image src="/logo-agenthub.png" alt="AgentHub Logo" width={120} height={32} className="object-contain h-7 w-auto" />
           </Link>
           <Link href="/login" className="text-xs text-blue-400 font-semibold hover:text-blue-300">Log in</Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-20 lg:mt-0">
          
          {success ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-300">
               <div className="mx-auto mb-5 flex justify-center">
                 <Image src="/welldone.png" alt="Registration Successful" width={100} height={100} className="object-contain drop-shadow-md"/>
               </div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                 Welcome to AgentHub. Your account is fully active. <br className="hidden sm:block" />
                 You can now log in to access your dashboard.
               </p>
               <Link href="/login" className="flex items-center justify-center w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95">
                 Go to Login <ChevronRight className="w-4 h-4 ml-1" />
               </Link>
            </div>
          ) : (
            <div className="bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:p-8 lg:rounded-2xl lg:shadow-xl lg:dark:shadow-none lg:border lg:border-slate-200 lg:dark:border-slate-800">
              
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create your account</h1>
                <p className="mt-1.5 text-slate-500 dark:text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                    Log in here
                  </Link>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative group">
                    <InputIcon icon={User} active={formData.firstName.length > 0} />
                    <input
                      type="text" name="firstName" required placeholder="First Name"
                      pattern="^[a-zA-Z\s\-']+$" title="Letters and spaces only"
                      className="block w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                      value={formData.firstName} onChange={handleChange}
                    />
                  </div>
                  <div className="relative group">
                    <InputIcon icon={User} active={formData.lastName.length > 0} />
                    <input
                      type="text" name="lastName" required placeholder="Last Name"
                      pattern="^[a-zA-Z\s\-']+$" title="Letters and spaces only"
                      className="block w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400 dark:group-hover:border-slate-600"
                      value={formData.lastName} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email & OTP Section */}
                <div className={`transition-all duration-300 ${isOtpSent || isEmailVerified ? 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        {isOtpSent && !isEmailVerified && (
                            <button type="button" onClick={handleEditEmail} className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> Edit Email
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 group">
                            <InputIcon icon={Mail} active={formData.email.length > 0} />
                            <input
                                type="email" name="email" required placeholder="name@company.com"
                                disabled={isEmailVerified || isOtpSent}
                                className={`block w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                    isEmailVerified 
                                    ? 'border-green-300 bg-green-50 text-green-900 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400' 
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-blue-500/50 focus:border-blue-500 group-hover:border-slate-400'
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                                value={formData.email} onChange={handleChange}
                            />
                        </div>
                        
                        {!isEmailVerified && !isOtpSent && (
                            <button 
                                type="button" onClick={sendOtp} disabled={otpLoading || !formData.email}
                                className="sm:w-auto w-full px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex justify-center items-center"
                            >
                                {otpLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Verify'}
                            </button>
                        )}

                        {isEmailVerified && (
                             <div className="sm:w-auto w-full px-4 py-2.5 flex items-center justify-center bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg font-bold text-xs shadow-sm">
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                             </div>
                        )}
                    </div>

                    {/* OTP Field */}
                    {isOtpSent && !isEmailVerified && (
                        <div className="mt-3 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Enter 6-digit code</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                                      <KeyRound className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text" placeholder="123456"
                                        className="block w-full pl-9 pr-4 py-2.5 text-base border border-blue-300 dark:border-blue-500/50 rounded-lg bg-blue-50/50 dark:bg-blue-500/10 text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6}
                                    />
                                </div>
                                <button 
                                    type="button" onClick={verifyOtp} disabled={verifyLoading || otp.length < 6}
                                    className="sm:w-auto w-full px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all active:scale-95 flex justify-center items-center"
                                >
                                    {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Confirm'}
                                </button>
                            </div>
                            
                            <div className="mt-2 flex justify-between items-center px-1">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                              <button 
                                type="button" onClick={sendOtp} disabled={countdown > 0 || otpLoading}
                                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:text-slate-400 transition-colors"
                              >
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                              </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Business & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative group">
                        <InputIcon icon={Building2} active={formData.businessName.length > 0} />
                        <input
                            type="text" name="businessName" placeholder="Business Name (Optional)"
                            className="block w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400"
                            value={formData.businessName} onChange={handleChange}
                        />
                    </div>
                    
                    <div className="relative group">
                        <InputIcon icon={Phone} active={formData.phoneNumber.length > 0} />
                        <div className="absolute inset-y-0 left-0 pl-[2.25rem] flex items-center pointer-events-none">
                            <span className={`text-sm font-semibold transition-colors duration-200 ${formData.phoneNumber.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                +234
                            </span>
                        </div>
                        <input
                            type="tel" name="phoneNumber" required placeholder="801 234 5678" maxLength={11}
                            className="block w-full pl-[4.5rem] pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400"
                            value={formData.phoneNumber} 
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                        />
                    </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative group">
                        <InputIcon icon={Lock} active={formData.password.length > 0} />
                        <input
                            type={showPass ? "text" : "password"} name="password" required placeholder="Password" minLength={8}
                            className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm group-hover:border-slate-400"
                            value={formData.password} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <div className="relative group">
                        <InputIcon icon={Lock} active={formData.confirmPassword.length > 0} />
                        <input
                            type={showConfirm ? "text" : "password"} name="confirmPassword" required placeholder="Confirm Password"
                            className={`block w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg shadow-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-950 ${
                                formData.confirmPassword && formData.password !== formData.confirmPassword 
                                ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' 
                                : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/50 focus:border-blue-500 group-hover:border-slate-400'
                            }`}
                            value={formData.confirmPassword} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Strength Meter */}
                {formData.password && (
                    <div className="pt-1">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Password Strength</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${passStrength <= 2 ? 'text-red-500' : passStrength <= 3 ? 'text-amber-500' : 'text-green-500'}`}>
                                {passStrength <= 2 ? 'Weak' : passStrength <= 3 ? 'Fair' : 'Strong'}
                            </span>
                        </div>
                        <div className="flex gap-1 h-1.5 px-1">
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
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  {registerLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                  ) : (
                    <>Complete Registration <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
