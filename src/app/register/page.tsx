'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
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

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passStrength, setPassStrength] = useState(0);
  
  // Visibility Toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password Strength Logic
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Eye Icon
  const EyeIcon = ({ visible, onClick }: { visible: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
    >
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-slate-900 dark:bg-black px-6 py-6 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">AgentLink</h1>
        <p className="text-xs text-slate-400 mt-1">API Infrastructure</p>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 dark:bg-black flex-col justify-between p-12 text-white border-r border-gray-800">
        <div>
          <h1 className="text-4xl font-bold tracking-wider">AgentLink</h1>
          <p className="mt-4 text-lg text-slate-400">The #1 API Infrastructure for Nigerian Service Providers.</p>
        </div>
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-lg">Instant Keys</h3>
              <p className="text-sm text-slate-400">Get production access instantly.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-lg">Secure</h3>
              <p className="text-sm text-slate-400">Bank-grade encryption.</p>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-600">© 2025 AgentLink Systems.</div>
      </div>

      {/* MAIN FORM */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-lg bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-sm sm:shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
          
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Start integrating Identity & Utility APIs.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Name Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text" name="firstName" required
                  className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text" name="lastName" required
                  className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
              <input
                type="text" name="businessName" placeholder="e.g. CyberServices Ltd"
                className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                value={formData.businessName} onChange={handleChange}
              />
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel" name="phoneNumber" required
                  className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData.phoneNumber} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Website (Optional)</label>
                <input
                  type="url" name="websiteUrl" placeholder="https://"
                  className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={formData.websiteUrl} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email" name="email" required
                className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} name="password" required
                  className="input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors pr-10"
                  value={formData.password} onChange={handleChange}
                />
                <EyeIcon visible={showPass} onClick={() => setShowPass(!showPass)} />
              </div>
              {/* Strength Meter */}
              {formData.password && (
                <div className="mt-2">
                   <div className="flex space-x-1 h-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passStrength >= level 
                            ? (passStrength <= 2 ? 'bg-red-500' : passStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500') 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"} name="confirmPassword" required
                  className={`input-sharp appearance-none block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none pr-10 transition-colors ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={formData.confirmPassword} onChange={handleChange}
                />
                <EyeIcon visible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
