'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Loader2, Mail, Lock, User, Phone, ChevronRight, Eye, EyeOff, 
  KeyRound, Building2, AlertCircle, X, CheckCircle2, ArrowRight, Gift
} from 'lucide-react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const refFromQuery = searchParams.get('ref') || searchParams.get('referral') || '';

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: refFromQuery
  });

  useEffect(() => {
    if (refFromQuery && !formData.referralCode) {
      setFormData(prev => ({ ...prev, referralCode: refFromQuery.toUpperCase() }));
    }
  }, [refFromQuery]);

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

  const resetEmail = () => {
    setIsOtpSent(false);
    setIsEmailVerified(false);
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
    <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${active ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>
      <Icon className="h-4 w-4" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ERROR TOAST */}
      {error && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-4 pr-5 rounded-2xl shadow-2xl animate-in slide-in-from-top-8 fade-in duration-300 max-w-sm w-full">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 leading-snug">{error}</p>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-16">
             <Image 
                src="/logo-agenthub.png" 
                alt="AgentHub" 
                width={140} 
                height={40} 
                priority
                className="object-contain h-8 w-auto"
             />
          </Link>
          
          <h2 className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-6 tracking-tight">
            The standard for <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Identity Infrastructure.
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Join thousands of modern businesses relying on AgentHub for seamless NIN, BVN, and Corporate verifications.
          </p>
        </div>

        {/* Premium Testimonial/Feature Card */}
        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
           <div className="flex gap-1 mb-4">
             {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
           </div>
           <p className="text-slate-200 text-sm italic leading-relaxed">
             "AgentHub completely transformed how we onboard our agents. The API is lightning fast, and the dashboard is incredibly intuitive. A game changer for our operations."
           </p>
           <div className="mt-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs">MA</div>
             <div>
               <p className="text-xs font-bold text-white">Mukhtar A.</p>
               <p className="text-[10px] text-slate-400">Operations Director</p>
             </div>
           </div>
        </div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24 justify-center relative bg-slate-50 dark:bg-slate-950 min-h-screen">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-5 flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 z-10">
           <Link href="/">
             <Image src="/logo-agenthub.png" alt="AgentHub" width={120} height={32} className="object-contain h-6 w-auto dark:invert" />
           </Link>
           <Link href="/login" className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:opacity-80">Log in</Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 lg:mt-0">
          
          {success ? (
            /* SUCCESS STATE */
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle2 size={48} strokeWidth={2.5} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Account Created!</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                 Welcome to AgentHub. Your registration was successful and your account is active.
               </p>
               <Link href="/login" className="flex items-center justify-center w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md active:scale-95">
                 Sign In to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
               </Link>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create account</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-all underline-offset-2">
                    Log in here
                  </Link>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Personal Info Group */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <InputIcon icon={User} active={formData.firstName.length > 0} />
                      <input
                        type="text" name="firstName" required placeholder="First Name"
                        className="block w-full pl-10 pr-3 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={formData.firstName} onChange={handleChange}
                      />
                    </div>
                    <div className="relative">
                      <InputIcon icon={User} active={formData.lastName.length > 0} />
                      <input
                        type="text" name="lastName" required placeholder="Last Name"
                        className="block w-full pl-10 pr-3 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={formData.lastName} onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Inline Email & OTP Flow */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <InputIcon icon={Mail} active={formData.email.length > 0} />
                        <input
                          type="email" name="email" required placeholder="Work Email Address"
                          disabled={isEmailVerified || isOtpSent}
                          className={`block w-full pl-10 pr-3 py-3 text-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
                            isEmailVerified 
                            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800/50 text-green-900 dark:text-green-400' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400'
                          } disabled:opacity-80`}
                          value={formData.email} onChange={handleChange}
                        />
                        {isEmailVerified && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                             <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      
                      {!isEmailVerified && !isOtpSent && (
                        <button 
                          type="button" onClick={sendOtp} disabled={otpLoading || !formData.email}
                          className="px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center shrink-0"
                        >
                          {otpLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Verify'}
                        </button>
                      )}
                      
                      {isEmailVerified && (
                        <button type="button" onClick={resetEmail} className="px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                          Change
                        </button>
                      )}
                    </div>

                    {/* Inline OTP Dropdown */}
                    {isOtpSent && !isEmailVerified && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl animate-in slide-in-from-top-2 fade-in">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Enter Verification Code</span>
                           <button type="button" onClick={resetEmail} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline">Wrong email?</button>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <InputIcon icon={KeyRound} active={otp.length > 0} />
                            <input
                              type="text" placeholder="123456" maxLength={6}
                              className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white font-mono tracking-[0.2em] font-bold focus:outline-none focus:border-blue-500 shadow-sm"
                              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                          </div>
                          <button 
                            type="button" onClick={verifyOtp} disabled={verifyLoading || otp.length !== 6}
                            className="px-5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                          >
                            {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Confirm'}
                          </button>
                        </div>
                        <div className="mt-2 text-right">
                          <button 
                            type="button" onClick={sendOtp} disabled={countdown > 0 || otpLoading}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 disabled:text-slate-400 transition-colors"
                          >
                            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                {/* Business & Contact Group */}
                <div className="space-y-4">
                  <div className="relative">
                    <InputIcon icon={Building2} active={formData.businessName.length > 0} />
                    <input
                      type="text" name="businessName" placeholder="Business Name (Optional)"
                      className="block w-full pl-10 pr-3 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={formData.businessName} onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <InputIcon icon={Phone} active={formData.phoneNumber.length > 0} />
                    <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
                      <span className={`text-sm font-medium ${formData.phoneNumber.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>+234</span>
                    </div>
                    <input
                      type="tel" name="phoneNumber" required placeholder="801 234 5678" maxLength={11}
                      className="block w-full pl-[4.5rem] pr-3 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={formData.phoneNumber} 
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>

                  {/* Referral Code (Optional) */}
                  <div className="relative">
                    <InputIcon icon={Gift} active={Boolean(formData.referralCode && formData.referralCode.length > 0)} />
                    <input
                      type="text" name="referralCode" placeholder="Referral Code (Optional)"
                      className="block w-full pl-10 pr-20 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-mono tracking-wider transition-all shadow-sm"
                      value={formData.referralCode} 
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase().trim() })}
                    />
                    {formData.referralCode && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          Applied
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                {/* Security Group */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <InputIcon icon={Lock} active={formData.password.length > 0} />
                      <input
                        type={showPass ? "text" : "password"} name="password" required placeholder="Password" minLength={8}
                        className="block w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={formData.password} onChange={handleChange}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <InputIcon icon={Lock} active={formData.confirmPassword.length > 0} />
                      <input
                        type={showConfirm ? "text" : "password"} name="confirmPassword" required placeholder="Confirm Password"
                        className={`block w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-300 dark:border-red-800/50 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400' 
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400'
                        }`}
                        value={formData.confirmPassword} onChange={handleChange}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Minimal Strength Meter */}
                  {formData.password && (
                    <div className="px-1">
                      <div className="flex gap-1 h-1.5 w-full max-w-[200px]">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              passStrength >= level 
                              ? (passStrength <= 2 ? 'bg-red-500' : passStrength <= 3 ? 'bg-amber-500' : 'bg-green-500') 
                              : 'bg-slate-200 dark:bg-slate-800'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${passStrength <= 2 ? 'text-red-500' : passStrength <= 3 ? 'text-amber-500' : 'text-green-500'}`}>
                        {passStrength <= 2 ? 'Weak Password' : passStrength <= 3 ? 'Fair Password' : 'Strong Password'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={registerLoading || !isEmailVerified}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {registerLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Setting up account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-4">
                    By registering, you agree to AgentHub's <Link href="#" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">Terms of Service</Link> and <Link href="#" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
                
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
