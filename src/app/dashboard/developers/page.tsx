'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Key, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Terminal,
  ArrowRight
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Developer Settings</h1>
        <p className="text-slate-500 mt-1">Manage your API credentials for integration.</p>
      </div>

      {/* 2. API KEY CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Live Secret Key</h3>
              <p className="text-xs text-slate-500">Use this key to authenticate your requests.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200 self-start md:self-center">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
            Active
          </div>
        </div>

        <div className="p-6 md:p-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">Your API Key</label>
          
          <div className="relative group">
            <div className="flex rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              {/* Input Field */}
              <div className="relative flex-1 bg-slate-50">
                <input 
                  type={showSecret ? "text" : "password"} 
                  readOnly 
                  value={data?.apiKeySecret || ''} 
                  className="block w-full pl-4 pr-12 py-3.5 bg-transparent text-slate-600 font-mono text-sm focus:outline-none"
                />
                {/* Reveal Toggle */}
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
                className="flex items-center gap-2 px-5 bg-white border-l border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <p>
              <strong>Security Warning:</strong> This key grants full access to your wallet. 
              Never share it in client-side code (frontend) or public repositories.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleRotateKeys}
            disabled={rotating}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-100"
          >
            {rotating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>Rotate Key</span>
          </button>
        </div>
      </div>

      {/* 3. DOCUMENTATION LINK */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-300">
              <Terminal size={20} />
              <span className="font-mono text-sm tracking-wide uppercase">Developer Docs</span>
            </div>
            <h3 className="text-xl font-bold">Ready to build?</h3>
            <p className="mt-2 text-slate-300 text-sm max-w-md leading-relaxed">
              Explore our comprehensive documentation. Get code samples, SDKs, and integration guides for NIN, BVN, and more.
            </p>
          </div>
          
          <Link 
            href="https://docs.agentlink.ng" 
            target="_blank"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-500/20 whitespace-nowrap"
          >
            View Documentation
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 h-32 w-32 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

    </div>
  );
}
