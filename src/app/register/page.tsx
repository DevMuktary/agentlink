'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  CheckCircle2, Loader2, ShieldCheck, Mail, Lock, 
  User, Phone, Globe, Briefcase, ChevronRight, Eye, EyeOff, KeyRound
} from 'lucide-react';

export default function RegisterPage() {
  
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    websiteUrl: '',
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
        // Focus OTP field automatically could be added here
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
      setError("Passwords do not match");
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
  const InputIcon = ({ icon: Icon }: { icon: any }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      <Icon className="h-5 w-5" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* 1. LEFT SIDEBAR (BRANDING) */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AgentHub</span>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Secure Infrastructure for <br/> <span className="text-blue-400">Nigerian Agencies.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Join thousands of agents using our API for NIN Verification, BVN Services, Corporate Filings, and Utility Payments.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">1</div>
              <div>
                  <h4 className="font-bold">Instant API Keys</h4>
                  <p className="text-xs text-slate-400">Get production access immediately after verification.</p>
              </div>
           </div>
           <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
              <div>
                  <h4 className="font-bold">Bank-Grade Security</h4>
                  <p className="text-xs text-slate-400">256-bit encryption & strict compliance.</p>
              </div>
           </div>
           <div className="text-xs text-slate-600 mt-8">© 2026 AgentHub Systems.</div>
        </div>
      </div>

      {/* 2. RIGHT CONTENT (FORM) */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center justify-between bg-[#0F172A] text-white">
           <span className="font-bold text-xl">AgentHub</span>
           <Link href="/login" className="text-sm text-blue-400 font-medium">Login</Link>
        </div>

        <div className="w-full max-w-lg mx-auto mt-16 lg:mt-0">
          
          {success ? (
            /* SUCCESS STATE */
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900/30 text-center animate-in fade-in zoom-in-95 duration-300">
               <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle2 className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Registration Received!</h2>
               <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                 Your account has been created and is currently <strong>Under Review</strong>.
                 <br />
                 We have sent a confirmation email to <br/><span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{formData.email}</span>.
               </p>
               <Link href="/login" className="block w-full py-4 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                 Return to Login
               </Link>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div className="bg-white dark:bg-gray-800 p-0 lg:p-8 rounded-none lg:rounded-2xl lg:shadow-none dark:shadow-none">
              
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create Account</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Log in
                  </Link>
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

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <InputIcon icon={User} />
                    <input
                      type="text" name="firstName" required placeholder="First Name"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      value={formData.firstName} onChange={handleChange}
                    />
                  </div>
                  <div className="relative">
                    <InputIcon icon={User} />
                    <input
                      type="text" name="lastName" required placeholder="Last Name"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      value={formData.lastName} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email & OTP Section */}
                <div className={`p-1 rounded-xl transition-all duration-300 ${isOtpSent || isEmailVerified ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4' : ''}`}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                        Email Verification <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <InputIcon icon={Mail} />
                            <input
                                type="email" name="email" required placeholder="name@company.com"
                                disabled={isEmailVerified || isOtpSent}
                                className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${isEmailVerified ? 'border-green-300 bg-green-50/50 text-green-800' : 'border-gray-200 dark:border-gray-700'}`}
                                value={formData.email} onChange={handleChange}
                            />
                        </div>
                        
                        {!isEmailVerified && !isOtpSent && (
                            <button 
                                type="button" 
                                onClick={sendOtp}
                                disabled={otpLoading || !formData.email}
                                className="px-5 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10 whitespace-nowrap"
                            >
                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Send OTP'}
                            </button>
                        )}

                        {isEmailVerified && (
                             <div className="px-4 flex items-center justify-center bg-green-100 text-green-700 rounded-xl font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5 mr-1" /> Verified
                             </div>
                        )}
                    </div>

                    {/* OTP Field (Conditionally Rendered) */}
                    {isOtpSent && !isEmailVerified && (
                        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-blue-600 font-medium">Enter the 6-digit code sent to your email</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                      <KeyRound className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text" placeholder="e.g. 123456"
                                        className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl bg-blue-50/30 text-gray-900 font-mono tracking-widest text-lg focus:outline-none focus:border-blue-500 transition-all"
                                        value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={verifyOtp}
                                    disabled={verifyLoading || otp.length < 6}
                                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20"
                                >
                                    {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Business & Phone */}
                <div className="relative">
                    <InputIcon icon={Briefcase} />
                    <input
                        type="text" name="businessName" placeholder="Business Name (Optional)"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        value={formData.businessName} onChange={handleChange}
                    />
                </div>
                <div className="relative">
                    <InputIcon icon={Phone} />
                    <input
                        type="tel" name="phoneNumber" required placeholder="Phone Number"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        value={formData.phoneNumber} onChange={handleChange}
                    />
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                        <InputIcon icon={Lock} />
                        <input
                            type={showPass ? "text" : "password"} name="password" required placeholder="Password"
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            value={formData.password} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer">
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <div className="relative">
                        <InputIcon icon={Lock} />
                        <input
                            type={showConfirm ? "text" : "password"} name="confirmPassword" required placeholder="Confirm Password"
                            className={`block w-full pl-10 pr-10 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/50 focus:border-blue-500'}`}
                            value={formData.confirmPassword} onChange={handleChange}
                        />
                         <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Strength Meter */}
                {formData.password && (
                    <div className="flex gap-1 h-1.5 mt-1 px-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-500 ${
                              passStrength >= level 
                                ? (passStrength <= 2 ? 'bg-red-500' : passStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500') 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`} 
                          />
                        ))}
                    </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={registerLoading || !isEmailVerified}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
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

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
