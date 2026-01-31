'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Key, Copy, RefreshCw, CheckCircle2, AlertTriangle, 
  Eye, EyeOff, Loader2, Terminal, ArrowRight, BookOpen, Coins
} from 'lucide-react';

export default function DevelopersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await axios.get('/api/user/credentials');
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKeys = async () => {
    if (!confirm("⚠️ WARNING: Rotating your key will immediately invalidate the old one.\n\nAny script using the old key will STOP working until you update it.\n\nAre you sure?")) return;
    
    setRotating(true);
    try {
      const res = await axios.post('/api/user/credentials');
      setData({ ...data, ...res.data });
      alert('New API Key generated successfully.');
    } catch (error) {
      alert('Failed to rotate keys. Please try again.');
    } finally {
      setRotating(false);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Developer Settings</h1>
            <p className="text-slate-500 mt-1">Manage your API keys and integration settings.</p>
        </div>
        <div className="flex gap-3">
            <Link 
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
                <Coins size={16} className="text-amber-500" /> View Pricing
            </Link>
            <Link 
                href="https://documenter.getpostman.com/view/51812173/2sBXVmeod9"
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
                <BookOpen size={16} /> Read Docs
            </Link>
        </div>
      </div>

      {/* 2. API KEY CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Live Secret Key</h3>
              <p className="text-xs text-slate-500">Standard API Key (x-api-key)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            Active
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Key Display Area */}
          <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Secret Key</label>
              <div className="relative group">
                <div className="flex rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                  
                  {/* Input Field */}
                  <div className="relative flex-1 bg-slate-50">
                    <input 
                      type={showSecret ? "text" : "password"} 
                      readOnly 
                      value={data?.apiKeySecret || ''} 
                      className="block w-full pl-4 pr-12 py-3.5 bg-transparent text-slate-800 font-mono text-sm focus:outline-none tracking-wide"
                    />
                    <button 
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showSecret ? "Hide Key" : "Show Key"}
                    >
                      {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button 
                    onClick={() => handleCopy(data?.apiKeySecret)}
                    className="flex items-center gap-2 px-6 bg-white border-l border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors min-w-[100px] justify-center"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
          </div>

          {/* Warning Box */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
                <p className="font-bold mb-1">Security Warning</p>
                <p className="text-amber-700/80 leading-relaxed">
                    This key grants full access to your wallet and services. 
                    Never share it in client-side code (frontend apps) or public repositories like GitHub. 
                    Always keep it server-side.
                </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleRotateKeys}
            disabled={rotating}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-100 font-medium"
          >
            {rotating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Roll Key
          </button>
        </div>
      </div>

      {/* 3. DOCUMENTATION & RESOURCES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Docs Card */}
          <Link href="https://documenter.getpostman.com/view/51812173/2sBXVmeod9" target="_blank" className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="relative z-10">
                <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Terminal size={20} className="text-blue-300" />
                </div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    API Documentation <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Access comprehensive guides, API references, and code snippets to integrate our services seamlessly.
                </p>
            </div>
            <div className="absolute right-0 top-0 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
          </Link>

          {/* Pricing Card */}
          <Link href="/pricing" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Coins size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
                Service Pricing <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                Check the latest rates for NIN verification, BVN services, Airtime, Data, and more.
            </p>
          </Link>

      </div>

    </div>
  );
}
