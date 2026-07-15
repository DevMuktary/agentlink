'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  Clock, X // Added missing Clock and X imports
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  serviceCode: number;
  isActive: boolean;
  price: number;
};

export default function NinValidationClient({ services }: { services: ServiceData[] }) {
  const [nin, setNin] = useState('');
  const [selectedServiceCode, setSelectedServiceCode] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  
  // State for the new Disclaimer Modal
  const [showModal, setShowModal] = useState(true);

  const activeService = services.find(s => s.serviceCode === Number(selectedServiceCode));
  const isEntireCategoryDown = services.length > 0 && services.every(s => !s.isActive);

  // Helper function to show polished, user-friendly names instead of DB codes
  const getPolishedName = (code: string, fallbackName: string) => {
    switch (code) {
      case 'NIN_VALIDATION_NO_RECORD':
        return 'Standard Validation (No Record)';
      case 'NIN_VALIDATION_UPDATE_RECORD':
        return 'Standard Validation (Update Record)';
      case 'NIN_VALIDATION_VNIN':
        return 'Virtual NIN (VNIN) Validation';
      default:
        return fallbackName;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    const customReference = `DASH-NINVAL-${Date.now()}`;

    try {
      const res = await fetch('/api/v1/identity/nin-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin: nin.trim(),
          service_code: selectedServiceCode,
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to process validation request.');
      }

      setSuccess(data.data);
      setNin('');
      setSelectedServiceCode('');
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
      {/* IMPORTANT DISCLAIMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Important Notice
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  Please ensure the NIN you are submitting actually has an issue that requires deep validation.
                </p>
                <p className="text-orange-700 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-500/10 p-3 rounded-xl border border-orange-100 dark:border-orange-500/20">
                  This service is strictly non-refundable and cannot be canceled once submitted.
                </p>
                <p>
                  The NIN may be successfully validated within 48 hours, however, the official status update on the portal may take 72 hours or more to reflect.
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
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            NIN Deep Validation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Perform a deep database check to validate National Identity Numbers or Virtual NINs.
          </p>
        </div>

        {isEntireCategoryDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                NIN Validation is currently undergoing scheduled maintenance by our provider. Please check back later.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {success ? (
                <div className="text-center py-10 animate-in zoom-in duration-300 relative z-10">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm font-medium">
                    Your validation request has been successfully queued. Deep validations can take a few moments to process.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{success.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Charged:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(success.charged_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 uppercase text-[10px] tracking-wider bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        {success.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                      onClick={() => setSuccess(null)}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Submit Another
                    </button>
                    <Link 
                      href="/dashboard/history/nin/validation"
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Check Status <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400 flex items-start gap-3 shadow-sm">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Validation Category
                      </label>
                      <select 
                        required
                        value={selectedServiceCode}
                        onChange={(e) => setSelectedServiceCode(Number(e.target.value))}
                        disabled={isEntireCategoryDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <option value="" disabled>Select the validation type...</option>
                        {services.map(service => (
                          <option 
                            key={service.id} 
                            value={service.serviceCode}
                            disabled={!service.isActive}
                          >
                            {getPolishedName(service.code, service.name)} {!service.isActive ? '(Disabled for Maintenance)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Target NIN / VNIN Number
                      </label>
                      <input 
                        type="text"
                        required
                        value={nin}
                        onChange={(e) => setNin(e.target.value)}
                        placeholder="Enter the 11-digit NIN or 16-digit VNIN"
                        disabled={isEntireCategoryDown || loading}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {activeService && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Charge</span>
                      <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                        {formatCurrency(activeService.price)}
                      </span>
                    </div>
                  )}

                  {activeService && !activeService.isActive && (
                    <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                      <AlertTriangle size={16} />
                      This specific service is currently disabled.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isEntireCategoryDown || loading || !nin || !selectedServiceCode || (activeService && !activeService.isActive)}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Request...</>
                    ) : (
                      'Submit Validation Request'
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
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  After submitting your request, navigate to your history log to monitor real-time progress and retrieve your validation results.
                </p>
                
                <Link 
                  href="/dashboard/history/nin/validation"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-indigo-200 dark:group-hover:border-indigo-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                </Link>
              </div>
            </div>

            {/* Important Guidelines Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded-md text-blue-600 dark:text-blue-400">
                  <Info size={14} />
                </div>
                Important Guidelines
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  Ensure the NIN or VNIN format is entirely correct before submitting.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  We do not offer refunds once a validation request has been submitted and processing has begun.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  The validation portal takes between 48 to 72 hours (or longer) to reflect status updates.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
