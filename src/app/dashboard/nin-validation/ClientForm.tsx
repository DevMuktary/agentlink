'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info 
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

  // Find the currently selected service to display its price and status
  const activeService = services.find(s => s.serviceCode === Number(selectedServiceCode));

  // Determine if the entire category is down (all services inactive)
  const isEntireCategoryDown = services.length > 0 && services.every(s => !s.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    // Generate a Dashboard-specific reference so Admin knows where it came from
    const customReference = `DASH-NINVAL-${Date.now()}`;

    try {
      // Calling your exact v1 API endpoint directly
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

      // Success
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
            <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1">
              NIN Validation is currently undergoing scheduled maintenance by the NIMC provider. Please check back later.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE FORM */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {success ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
                  Your validation request has been successfully queued. Deep validations can take a few moments to process.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 max-w-sm mx-auto mb-8 text-left border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Reference:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{success.reference}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Amount Charged:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(success.charged_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Status:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase text-xs bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {success.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setSuccess(null)}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Submit Another
                  </button>
                  <Link 
                    href="/dashboard/history/nin/validation"
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Check Status in History <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Validation Type
                    </label>
                    <select 
                      required
                      value={selectedServiceCode}
                      onChange={(e) => setSelectedServiceCode(Number(e.target.value))}
                      disabled={isEntireCategoryDown || loading}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="" disabled>Select the validation type...</option>
                      {services.map(service => (
                        <option 
                          key={service.id} 
                          value={service.serviceCode}
                          disabled={!service.isActive} // Disables specifically if this single service is maintained
                        >
                          {service.name} {!service.isActive ? '(Under Maintenance)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Target NIN / VNIN
                    </label>
                    <input 
                      type="text"
                      required
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                      placeholder="Enter the 11-digit NIN or 16-digit VNIN"
                      disabled={isEntireCategoryDown || loading}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>

                {activeService && (
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Service Charge</span>
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {formatCurrency(activeService.price)}
                    </span>
                  </div>
                )}

                {activeService && !activeService.isActive && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-xs text-orange-700 dark:text-orange-400 font-medium flex items-center gap-2 border border-orange-200 dark:border-orange-500/20">
                    <AlertTriangle size={14} />
                    This specific validation type is currently disabled by the admin.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isEntireCategoryDown || loading || !nin || !selectedServiceCode || (activeService && !activeService.isActive)}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing Validation...</>
                  ) : (
                    'Validate Identity Record'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY LINK */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:scale-110 transition-transform duration-500">
              <History size={100} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Deep database validations run asynchronously. Once submitted, head over to your history log to view the real-time status and download the final report when completed.
              </p>
              
              <Link 
                href="/dashboard/history/nin/validation"
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-indigo-200 dark:group-hover:border-indigo-800"
              >
                View Validation History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info size={16} className="text-blue-500" /> Important Guidelines
            </h3>
            <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                Ensure the NIN/VNIN is correctly formatted before submission.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                Charges are non-refundable once the provider begins processing the request.
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                Requests flagged as 'NO_RECORD' indicate the target identity does not exist in the national database.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
