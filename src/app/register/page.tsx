'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  
  // Form State
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

  // OTP State
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passStrength, setPassStrength] = useState(0);
  
  // Toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password Logic
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

  // --- OTP HANDLERS ---
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
        alert(`OTP sent to ${formData.email}`);
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
        setIsOtpSent(false); // Hide OTP field
    } catch (err: any) {
        setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
        setVerifyLoading(false);
    }
  };

  // --- SUBMIT ---
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

    setLoading(true);

    try {
      await axios.post('/api/auth/register', formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Eye Icon
  const EyeIcon = ({ visible, onClick }: { visible: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none">
      {visible ? "Hide" : "Show"}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* SIDEBAR (Branding) */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 dark:bg-black flex-col justify-between p-12 text-white border-r border-gray-800">
        <div>
          <h1 className="text-4xl font-bold tracking-wider">AgentHub</h1>
          <p className="mt-4 text-lg text-slate-400">Secure Identity & Utility Infrastructure.</p>
        </div>
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-green-400" />
                <div>
                    <h3 className="font-bold">Verified Access</h3>
                    <p className="text-xs text-slate-400">Email verification required for security.</p>
                </div>
            </div>
        </div>
        <div className="text-xs text-slate-600">© 2026 AgentHub Systems.</div>
      </div>

      {/* FORM AREA */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-lg bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-sm sm:shadow-lg border border-gray-100 dark:border-gray-700">
          
          {success ? (
            <div className="text-center py-8">
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Registration Received!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Your account is currently <strong>Under Review</strong>. <br/>
                We have sent a confirmation email to <strong>{formData.email}</strong>.
              </p>
              <Link href="/login" className="inline-block w-full py-3.5 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Start integrating APIs today.</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" required className="input-field" value={formData.firstName} onChange={handleChange} />
                  <input type="text" name="lastName" placeholder="Last Name" required className="input-field" value={formData.lastName} onChange={handleChange} />
                </div>

                {/* Email Verification Section */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <div className="flex gap-2">
                        <input
                            type="email" name="email" required
                            placeholder="name@company.com"
                            disabled={isEmailVerified || isOtpSent}
                            className={`flex-1 input-field ${isEmailVerified ? 'bg-green-50 border-green-300 text-green-800' : ''}`}
                            value={formData.email} onChange={handleChange}
                        />
                        {!isEmailVerified && !isOtpSent && (
                             <button 
                                type="button" 
                                onClick={sendOtp}
                                disabled={otpLoading || !formData.email}
                                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm whitespace-nowrap"
                             >
                                {otpLoading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Send OTP'}
                             </button>
                        )}
                        {isEmailVerified && (
                            <span className="px-4 py-3 bg-green-100 text-green-700 font-bold rounded-lg text-sm flex items-center">
                                Verified
                            </span>
                        )}
                    </div>
                </div>

                {/* OTP Input (Shown only when sent) */}
                {isOtpSent && !isEmailVerified && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Enter OTP Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text" 
                                placeholder="123456"
                                className="flex-1 input-field text-center tracking-widest font-mono text-lg"
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                            <button 
                                type="button" 
                                onClick={verifyOtp}
                                disabled={verifyLoading || otp.length < 6}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {verifyLoading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Verify'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Check your email inbox (and spam).</p>
                    </div>
                )}

                {/* Other Fields */}
                <input type="text" name="businessName" placeholder="Business Name (Optional)" className="input-field" value={formData.businessName} onChange={handleChange} />
                <input type="tel" name="phoneNumber" placeholder="Phone Number" required className="input-field" value={formData.phoneNumber} onChange={handleChange} />
                
                {/* Passwords */}
                <div className="relative">
                    <input type={showPass ? "text" : "password"} name="password" placeholder="Password" required className="input-field pr-10" value={formData.password} onChange={handleChange} />
                    <EyeIcon visible={showPass} onClick={() => setShowPass(!showPass)} />
                </div>
                
                <div className="relative">
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required className="input-field pr-10" value={formData.confirmPassword} onChange={handleChange} />
                    <EyeIcon visible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isEmailVerified}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : isEmailVerified ? 'Create Account' : 'Verify Email First'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-field {
            @apply appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors;
        }
      `}</style>
    </div>
  );
}
