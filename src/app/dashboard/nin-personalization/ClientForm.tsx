'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  Clock, X 
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function NinPersonalizationClient({ service }: { service: ServiceData | null }) {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Auto-hide error banner after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isServiceDown = !service || !service.isActive;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (trackingId.trim().length < 10) {
      setError('Please enter a valid NIMC Tracking ID.');
      return;
    }

    setLoading(true);

    const customReference = `DASH-PERS-${Date.now()}`;

    try {
      const res = await fetch('/api/v1/identity/nin-personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: trackingId.trim(),
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit personalization request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: service?.price || 0,
        trackingId: trackingId
      });
      setTrackingId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <>
      {/* FLOATING ERROR TOAST BANNER */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[200] w-[90%] sm:w-auto max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="font-semibold text-sm flex-1 leading-snug">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="p-1.5 hover:bg-red-700 rounded-xl transition-colors shrink-0"
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* IMPORTANT DISCLAIMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Important Notice
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are about to submit a NIN Personalization request to push a record to the national verification database.
                </p>
                <p className="text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-100 dark:border-purple-500/20">
                  This process is asynchronous and may take anywhere from 24 to 72 hours to reflect on the NIMC portal.
                </p>
                <p>
                  If the provider rejects the Tracking ID instantly, your wallet will be refunded. Once processing begins, it is non-refundable.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm w-full"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE CONTENT */}
      <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
              <Users size={26} strokeWidth={2.5} />
            </div>
            NIN Personalization
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Push NIN records to the verification database using a Tracking ID.
          </p>
        </div>

        {isServiceDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                NIN Personalization is currently undergoing scheduled maintenance by our provider. Please check back later.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {successData ? (
                <div className="text-center py-6 animate-in zoom-in duration-300 relative z-10">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    The personalization request has been forwarded to the database. Monitor its progress in your history.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Tracking ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{successData.trackingId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Charged:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(successData.charged_amount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                      onClick={() => setSuccessData(null)}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Submit Another
                    </button>
                    <Link 
                      href="/dashboard/history/nin/personalization"
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Check Status <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-5">
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        NIMC Tracking ID
                      </label>
                      <input 
                        type="text"
                        required
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                        placeholder="Enter the Tracking ID from the enrollment slip"
                        disabled={isServiceDown || loading}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-mono uppercase"
                      />
                    </div>
                  </div>

                  {service && (
                    <div className="p-4 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Processing Fee</span>
                      <span className="text-xl font-extrabold text-purple-700 dark:text-purple-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  )}

                  {isServiceDown && (
                    <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                      <AlertTriangle size={16} />
                      Personalization service is currently disabled.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isServiceDown || loading || trackingId.trim().length < 10}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                    ) : (
                      'Submit Personalization'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY LINK */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Status Tracker Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Personalization requires time to synchronize across national servers. Check your history log to monitor real-time progress.
                </p>
                
                <Link 
                  href="/dashboard/history/nin/personalization"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-purple-200 dark:group-hover:border-purple-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-purple-500 transition-all" />
                </Link>
              </div>
            </div>

            {/* Important Guidelines Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-purple-100 dark:bg-purple-500/20 rounded-md text-purple-600 dark:text-purple-400">
                  <Info size={14} />
                </div>
                Important Guidelines
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 mt-1.5 shrink-0" />
                  Double-check the Tracking ID to ensure accuracy before submission.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 mt-1.5 shrink-0" />
                  If the request fails instantly during submission, your wallet is automatically refunded.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 mt-1.5 shrink-0" />
                  Once queued, the request cannot be canceled.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
