'use client';

import { useState, Suspense } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/login', formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm lg:w-96 bg-white p-6 sm:p-10 rounded-2xl shadow-sm sm:shadow-none border sm:border-none border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please enter your details to sign in.
          </p>
        </div>

        {registered && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-200">
            Account created successfully! Please log in.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          <div className="text-center mt-2">
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 lg:bg-white">
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-slate-900 px-6 py-6 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">AgentLink</h1>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 flex-col justify-center p-12 text-white">
        <div>
          <h1 className="text-4xl font-bold tracking-wider mb-6">AgentLink</h1>
          <p className="text-lg text-slate-400">Secure, Reliable, and Fast API Infrastructure.</p>
        </div>
      </div>

      {/* FORM AREA */}
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
