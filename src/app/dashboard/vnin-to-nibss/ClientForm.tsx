'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Landmark, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X 
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function VninToNibssClient({ service }: { service: ServiceData | null }) {
  const [ticketId, setTicketId] = useState('');
  const [fullName, setFullName] = useState('');
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  
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

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (nin.length !== 11) {
      setError('Please enter exactly 11 digits for the NIN.');
      return;
    }
    if (bvn.length !== 11) {
      setError('Please enter exactly 11 digits for the BVN.');
      return;
    }
    if (ticketId.trim().length < 5) {
      setError('Please enter a valid Ticket ID.');
      return;
    }

    setLoading(true);

    const customReference = `DASH-NIBSS-${Date.now()}`;

    try {
      const res = await fetch('/api/bvn/vnin-to-nibss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId.trim(),
          full_name: fullName.trim(),
          nin: nin,
          bvn: bvn,
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: service?.price || 0,
        nin: nin,
        bvn: bvn
      });
      
      // Reset form
      setTicketId(''); setFullName(''); setNin(''); setBvn('');
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
              <div className="w-14 h-14 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Terms of Service
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  Kindly note that our work is <span className="font-bold text-slate-800 dark:text-slate-200">only to send your VNIN slip to NIBSS</span>. Please make sure all details provided are 100% correct.
                </p>
                <p>
                  This service will be processed within <span className="font-bold text-slate-800 dark:text-slate-200">24-48 hours</span>. We will communicate with Nora (NIBSS) and provide confirmation once your VNIN is received by NIBSS.
                </p>
                <div className="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-100 dark:border-red-500/20">
                  <p className="uppercase tracking-wider text-[11px] mb-1">Strict No Refund Policy</p>
                  <p className="text-sm">There is absolutely no refund for this service if you submit a wrong ticket ID.</p>
                </div>
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
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
              <Landmark size={26} strokeWidth={2.5} />
            </div>
            VNIN to NIBSS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Submit your VNIN slip directly to NIBSS (Nora) for BVN synchronization.
          </p>
        </div>

        {isServiceDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                This service is currently undergoing scheduled maintenance. Please check back later.
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submission Successful!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your request has been queued. Our admins will forward it to NIBSS within 24-48 hours.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Target BVN:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{successData.bvn}</span>
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
                      href="/dashboard/history/bvn/vnin-to-nibss"
                      className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl text-sm hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Check Status <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Ticket ID
                      </label>
                      <input 
                        type="text" required value={ticketId}
                        onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                        placeholder="Enter your Ticket ID" disabled={isServiceDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 uppercase"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input 
                        type="text" required value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter Exact Full Name on NIN/BVN" disabled={isServiceDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        NIN (11 Digits)
                      </label>
                      <input 
                        type="text" inputMode="numeric" pattern="\d*" maxLength={11} required
                        value={nin} onChange={(e) => handleNumericInput(e, setNin)}
                        placeholder="00000000000" disabled={isServiceDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[11px] font-semibold ${nin.length === 11 ? 'text-green-500' : 'text-slate-400'}`}>{nin.length}/11 digits</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        BVN (11 Digits)
                      </label>
                      <input 
                        type="text" inputMode="numeric" pattern="\d*" maxLength={11} required
                        value={bvn} onChange={(e) => handleNumericInput(e, setBvn)}
                        placeholder="00000000000" disabled={isServiceDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[11px] font-semibold ${bvn.length === 11 ? 'text-green-500' : 'text-slate-400'}`}>{bvn.length}/11 digits</span>
                      </div>
                    </div>

                  </div>

                  {service && (
                    <div className="p-4 bg-cyan-50/50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Processing Fee</span>
                      <span className="text-xl font-extrabold text-cyan-700 dark:text-cyan-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isServiceDown || loading || nin.length !== 11 || bvn.length !== 11 || ticketId.length < 5}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                    ) : (
                      'Submit to NIBSS'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY LINK */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Landmark size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  This service is manually forwarded. Use the <span className="font-bold text-slate-700 dark:text-slate-300">"Check Status"</span> button in your history to see when Nora (NIBSS) acknowledges it.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn/vnin-to-nibss"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-cyan-200 dark:group-hover:border-cyan-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-cyan-500 transition-all" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-red-100 dark:bg-red-500/20 rounded-md text-red-600 dark:text-red-400">
                  <Info size={14} />
                </div>
                Important Rules
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  Our work is solely to forward your request to NIBSS. We do not modify the data.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  There is absolutely NO refund for this service if wrong ticket ID is submitted.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  Processing requires 24-48 hours before NIBSS confirms receipt.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
