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

  // Password Strength Logic
  useEffect(() => {
    const p = formData.password;
    let score = 0;
    if (!p) { setPassStrength(0); return; }
    if (p.length > 6) score += 1;
    if (p.length > 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    setPassStrength(score); // Max 5
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passStrength < 3) {
      setError("Password is too weak. Include numbers and symbols.");
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 flex-col justify-between p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-wider">AgentLink</h1>
          <p className="mt-4 text-slate-400">The #1 API Infrastructure for Nigerian Service Providers.</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
            <div>
              <h3 className="font-semibold">Instant API Access</h3>
              <p className="text-sm text-slate-400">Get your keys immediately after signup.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">2</div>
            <div>
              <h3 className="font-semibold">Best-in-Class Security</h3>
              <p className="text-sm text-slate-400">Bank-grade encryption for all requests.</p>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          © 2025 AgentLink Infrastructure.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Start integrating Identity & Utility APIs today.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Name Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text" name="firstName" required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text" name="lastName" required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.lastName} onChange={handleChange}
                />
              </div>
            </div>

            {/* Business Info */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Business Name</label>
              <input
                type="text" name="businessName" placeholder="e.g. CyberServices Ltd"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.businessName} onChange={handleChange}
              />
            </div>

            {/* Contact Info Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel" name="phoneNumber" required placeholder="08012345678"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.phoneNumber} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Website URL (Optional)</label>
                <input
                  type="url" name="websiteUrl" placeholder="https://..."
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.websiteUrl} onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email" name="email" required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.email} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password" name="password" required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.password} onChange={handleChange}
              />
              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2 flex space-x-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        passStrength >= level 
                          ? (passStrength <= 2 ? 'bg-red-500' : passStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500') 
                          : 'bg-slate-200'
                      }`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password" name="confirmPassword" required
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                value={formData.confirmPassword} onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Already registered? </span>
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
