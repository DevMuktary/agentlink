'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passStrength, setPassStrength] = useState(0);

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
      setError("Password is too weak. Please add numbers or symbols.");
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 lg:bg-white">
      
      {/* 1. MOBILE HEADER (Visible only on small screens) */}
      <div className="lg:hidden bg-slate-900 px-6 py-6 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">AgentLink</h1>
        <p className="text-xs text-slate-400 mt-1">API Infrastructure for Developers</p>
      </div>

      {/* 2. DESKTOP SIDEBAR (Visible only on large screens) */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 flex-col justify-between p-12 text-white">
        <div>
          <h1 className="text-4xl font-bold tracking-wider">AgentLink</h1>
          <p className="mt-4 text-lg text-slate-400">The #1 API Infrastructure for Nigerian Service Providers.</p>
        </div>
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-lg">Instant API Access</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Get your production keys immediately after signup. No waiting period.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-lg">Bank-Grade Security</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Your transactions are secured with 256-bit encryption.</p>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-600">
          © 2025 AgentLink Systems.
        </div>
      </div>

      {/* 3. MAIN FORM AREA */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-lg bg-white p-6 sm:p-10 rounded-2xl shadow-sm sm:shadow-none border sm:border-none border-gray-100">
          
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in your details to get started.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Name Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text" name="firstName" required
                  placeholder="e.g. Musa"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text" name="lastName" required
                  placeholder="e.g. Ibrahim"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text" name="businessName" placeholder="e.g. CyberServices Ltd"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.businessName} onChange={handleChange}
              />
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel" name="phoneNumber" required placeholder="080..."
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.phoneNumber} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Website (Optional)</label>
                <input
                  type="url" name="websiteUrl" placeholder="https://"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.websiteUrl} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email" name="email" required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password" name="password" required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.password} onChange={handleChange}
              />
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
                            : 'bg-gray-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {passStrength <= 2 ? 'Weak' : passStrength <= 3 ? 'Medium' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password" name="confirmPassword" required
                className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                value={formData.confirmPassword} onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
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
