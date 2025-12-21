'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export default function DevelopersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  // Actions states
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(''); // 'public' or 'secret'
  
  // Feedback states
  const [webhookStatus, setWebhookStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await axios.get('/api/user/credentials');
      setData(res.data);
      setWebhookUrl(res.data.webhookUrl || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    setWebhookStatus(null);
    try {
      await axios.patch('/api/user/credentials', { webhookUrl });
      setWebhookStatus({ type: 'success', msg: 'Webhook URL updated successfully.' });
    } catch (error: any) {
      setWebhookStatus({ 
        type: 'error', 
        msg: error.response?.data?.error || 'Failed to save webhook. Ensure URL starts with https://' 
      });
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleRotateKeys = async () => {
    if (!confirm("Are you sure? This will STOP all your existing integrations immediately until you replace the keys.")) return;
    
    setRotating(true);
    try {
      const res = await axios.post('/api/user/credentials');
      setData({ ...data, ...res.data });
      alert('New API Keys generated.');
    } catch (error) {
      alert('Failed to rotate keys.');
    } finally {
      setRotating(false);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Integration</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your keys and webhooks to connect AgentLink to your platform.</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
      </div>

      {/* DOCUMENTATION CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg text-white overflow-hidden relative">
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="p-2 bg-white/20 inline-block rounded-lg mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Read the Documentation</h3>
              <p className="mt-2 text-blue-100 max-w-lg">
                Learn how to integrate our APIs for Airtime, Data, NIN Verification, and more. 
                Full references, code examples, and SDKs available.
              </p>
            </div>
            <Link 
              href="https://docs.agentlink.ng" 
              target="_blank"
              className="hidden md:flex bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-lg font-bold items-center transition-colors"
            >
              Go to Docs
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          {/* Mobile Button */}
          <Link 
            href="https://docs.agentlink.ng" 
            target="_blank"
            className="md:hidden mt-6 bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-lg font-bold flex items-center justify-center transition-colors"
          >
            Go to Docs
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        {/* Decorative Circle */}
        <div className="absolute right-0 bottom-0 h-64 w-64 bg-white/10 rounded-full -mr-16 -mb-16 pointer-events-none"></div>
      </div>

      {/* API KEYS CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">API Credentials</h3>
          </div>
          <button 
            onClick={handleRotateKeys}
            disabled={rotating}
            className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors"
          >
            {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Rotate Keys</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Public Key (Live)</label>
            <div className="flex rounded-md shadow-sm">
              <input 
                type="text" 
                readOnly 
                value={data?.apiKeyPublic} 
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300 sm:text-sm focus:outline-none font-mono"
              />
              <button 
                onClick={() => handleCopy(data?.apiKeyPublic, 'public')}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {copied === 'public' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2 text-sm">{copied === 'public' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secret Key (Live)</label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-1">
                <input 
                  type={showSecret ? "text" : "password"} 
                  readOnly 
                  value={data?.apiKeySecret} 
                  className="block w-full px-4 py-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300 sm:text-sm focus:outline-none font-mono"
                />
              </div>
              <button 
                onClick={() => setShowSecret(!showSecret)}
                className="inline-flex items-center px-3 border-y border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleCopy(data?.apiKeySecret, 'secret')}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {copied === 'secret' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2 text-sm">{copied === 'secret' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Never share your secret key. It gives full access to your funds.
            </p>
          </div>
        </div>
      </div>

      {/* WEBHOOK CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Webhook Configuration</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-12">
            We will send POST requests to this URL when a manual service (like CAC) changes status.
          </p>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook URL</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="url"
              placeholder="https://your-website.com/api/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
            <button 
              onClick={handleSaveWebhook}
              disabled={savingWebhook}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {savingWebhook ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Status Message */}
          {webhookStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${
              webhookStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {webhookStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {webhookStatus.msg}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
