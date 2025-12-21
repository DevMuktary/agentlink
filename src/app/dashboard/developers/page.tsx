'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
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
    try {
      await axios.patch('/api/user/credentials', { webhookUrl });
      alert('Webhook URL saved successfully!');
    } catch (error) {
      alert('Failed to save webhook.');
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Developer Settings...</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Integration</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your keys and webhooks to connect AgentLink to your platform.</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Status: Active</span>
        </div>
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
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300 sm:text-sm focus:outline-none"
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
                  className="block w-full px-4 py-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300 sm:text-sm focus:outline-none"
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
          <div className="flex gap-4">
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {savingWebhook ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
