'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Key, Copy, RefreshCw, CheckCircle2, AlertTriangle, 
  Eye, EyeOff, Loader2, Terminal, ArrowRight, BookOpen, Coins,
  Lock, Globe, Building2, Server, Save, Clock
} from 'lucide-react';

export default function DevelopersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form States for Request Access
  const [bizName, setBizName] = useState('');
  const [webLink, setWebLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);

  // Local notifications
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await axios.get('/api/user/credentials');
      setData(res.data);
      if (res.data?.webhookUrl) {
        setWebhookUrl(res.data.webhookUrl);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Request Handler
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !webLink) return;
    
    setSubmitLoading(true);
    setErrorToast('');

    try {
      const res = await axios.post('/api/user/credentials', {
        action: 'SUBMIT_REQUEST',
        businessName: bizName,
        websiteUrl: webLink // Synced with DB Schema
      });

      if (res.data?.status) {
        setData({
          ...data,
          apiStatus: 'PENDING', // Synced with DB Schema
          businessName: bizName,
          websiteUrl: webLink
        });
      }
    } catch (err: any) {
      setErrorToast(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Save Webhook URL Handler
  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookLoading(true);
    setWebhookSuccess(false);
    setErrorToast('');

    try {
      await axios.patch('/api/user/credentials', { webhookUrl });
      setWebhookSuccess(true);
      setTimeout(() => setWebhookSuccess(false), 3000);
    } catch (err: any) {
      setErrorToast(err.response?.data?.error || 'Failed to update webhook URL.');
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleRotateKeys = async () => {
    if (!confirm("⚠️ WARNING: Rotating your key will immediately invalidate the old one.\n\nAny production scripts using the old key will STOP working immediately.\n\nAre you sure?")) return;
    
    setRotating(true);
    try {
      const res = await axios.post('/api/user/credentials');
      setData({ ...data, ...res.data });
      alert('New API Keys rotated successfully.');
    } catch (error) {
      alert('Failed to rotate keys. Please try again.');
    } finally {
      setRotating(false);
    }
  };

  if (loading) return <GlobalLoader />;

  const currentStatus = data?.apiStatus || 'NONE';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* FLOATING ERROR TOAST */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-xl border border-red-500 text-sm font-semibold">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorToast}</span>
            <button onClick={() => setErrorToast('')} className="ml-auto p-1 hover:bg-red-700 rounded-lg">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Developer Gateway</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            Integrate verification channels directly into your enterprise solutions.
          </p>
        </div>
        
        {/* TOP ACTIONS - Dynamic Visibility */}
        <div className="flex gap-3">
          <Link 
            href="/pricing"
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Coins size={16} className="text-amber-500" /> View Pricing
          </Link>

          {currentStatus === 'APPROVED' ? (
            <Link 
              href="https://documenter.getpostman.com/view/51812173/2sBXVmeod9" 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/15"
            >
              <BookOpen size={16} /> Read Docs
            </Link>
          ) : (
            <div 
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed select-none border border-slate-200 dark:border-slate-700"
              title="API documentation is locked until access is approved."
            >
              <Lock size={15} /> Docs Locked
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* ============================================================ */}
      {/* STATE A: NOT REQUESTED YET (NONE) */}
      {/* ============================================================ */}
      {currentStatus === 'NONE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Request Production API Access</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              Fill in your deployment environment details below. Our technical administrators will review and approve your staging credentials within 24 hours.
            </p>

            <form onSubmit={handleRequestAccess} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Registered Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Building2 size={18} />
                  </div>
                  <input 
                    type="text" required value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="e.g. Acme Tech Solutions Ltd"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Platform Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Globe size={18} />
                  </div>
                  <input 
                    type="url" required value={webLink} onChange={(e) => setWebLink(e.target.value)} placeholder="https://yourplatform.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Access Request'}
              </button>
            </form>
          </div>

          <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
             <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
                <Lock size={20} strokeWidth={2.5} />
             </div>
             <h4 className="font-bold text-sm text-slate-900 dark:text-white">Credentials Encrypted</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
               Your private API endpoints and Postman collection linkages remain protected until your organization environment undergoes verification clearance.
             </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATE B: UNDER REVIEW (PENDING) */}
      {/* ============================================================ */}
      {currentStatus === 'PENDING' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm animate-in zoom-in-95 duration-300">
           <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/30">
              <Clock className="w-8 h-8 animate-pulse" />
           </div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Request Pending Review</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-6">
              Our engineering support team is evaluating the environment configuration submitted for <span className="font-bold text-slate-800 dark:text-slate-200">"{data?.businessName}"</span>. Production access tokens will generate automatically upon verification.
           </p>
           <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono shadow-inner">
              <Terminal size={14} className="text-slate-400" /> STATUS_CODE: AWAITING_ADMIN_CLEARANCE
           </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATE C: VERIFIED & ACTIVE (APPROVED) */}
      {/* ============================================================ */}
      {currentStatus === 'APPROVED' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* API SECRET CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Live Authorization Header</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bearer Token integration parameter (x-api-key)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold uppercase tracking-wide rounded-md border border-green-100 dark:border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                Active
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secret Private Key</label>
                  <div className="relative">
                    <div className="flex rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                      <div className="relative flex-1 bg-slate-50 dark:bg-slate-950">
                        <input 
                          type={showSecret ? "text" : "password"} 
                          readOnly 
                          value={data?.apiKeySecret || ''} 
                          className="block w-full pl-4 pr-12 py-3.5 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-base sm:text-sm focus:outline-none tracking-wide"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleCopy(data?.apiKeySecret)}
                        className="flex items-center gap-2 px-5 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors text-xs uppercase tracking-wider min-w-[100px] justify-center"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/20 rounded-xl text-amber-800 dark:text-amber-400">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs font-medium leading-relaxed">
                    <p className="font-bold mb-0.5">Wallet API Liability Protection</p>
                    <p className="opacity-90">This signature directly handles server wallet drawdowns. Do not inject tokens into client bundles, GitHub code trees, or public mobile configurations.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={handleRotateKeys}
                disabled={rotating}
                className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 font-bold uppercase tracking-wider"
              >
                {rotating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Roll Key Token
              </button>
            </div>
          </div>

          {/* WEBHOOK URL MANAGER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-4 duration-400">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shadow-inner">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Event Webhook Callback</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive asynchronous verification data streams</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
               <form onSubmit={handleSaveWebhook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Endpoint URL</label>
                    <div className="flex rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
                       <input 
                         type="url"
                         value={webhookUrl}
                         onChange={(e) => setWebhookUrl(e.target.value)}
                         placeholder="https://api.yourdomain.com/v1/webhooks"
                         className="flex-1 px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 focus:ring-0 text-base sm:text-sm font-medium font-mono text-slate-900 dark:text-white focus:outline-none"
                       />
                       <button
                         type="submit"
                         disabled={webhookLoading}
                         className="flex items-center gap-2 px-5 bg-white dark:bg-slate-900 border-0 border-l border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider min-w-[120px] justify-center disabled:opacity-50"
                       >
                          {webhookLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : webhookSuccess ? (
                            <><Check size={16} className="text-green-500" /> Saved</>
                          ) : (
                            <><Save size={16} /> Save URL</>
                          )}
                       </button>
                    </div>
                  </div>
               </form>
            </div>
          </div>

          {/* LOWER GRID: ADDITIONAL INFO LINKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="https://documenter.getpostman.com/view/51812173/2sBXVmeod9" target="_blank" className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="relative z-10">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                      <Terminal size={20} className="text-blue-300" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
                      API Specifications <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                      Examine our core Postman schemas, validation schemas, response wrappers, and live callback arrays.
                  </p>
              </div>
              <div className="absolute right-0 top-0 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </Link>

            <Link href="/pricing" className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                  <Coins size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1 flex items-center gap-2">
                  Channel Pricing  <ArrowRight size={16} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  Review direct endpoint margins for premium identity checking matrices, utilities vending arrays, and corporate registries.
              </p>
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
