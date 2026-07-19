'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X, Printer, Hash, User
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function BvnVerificationClient({ service }: { service: ServiceData | null }) {
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success states hold the revealed BVN info
  const [successData, setSuccessData] = useState<any>(null);

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setBvn(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (bvn.length !== 11) {
      return setError('Please enter exactly 11 digits for the BVN.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bvn/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bvn: bvn,
          // Guarantee the reference starts with DASH-
          reference: `DASH-BVN-${Date.now()}`
        })
      });

      const responseData = await res.json();

      if (!res.ok || responseData.status === false) {
        throw new Error(responseData.error || 'Failed to verify BVN.');
      }

      // Store the retrieved data to reveal it on the screen
      setSuccessData({
        reference: responseData.reference,
        charged_amount: responseData.charged_amount,
        target: bvn,
        data: responseData.data
      });
      
      setBvn('');
    } catch (err: any) {
      let errorMsg = err.message;
      if (errorMsg.toLowerCase().includes('provider connection failed') || errorMsg.includes('400')) {
        errorMsg = 'No record found for this BVN or the provider is currently unreachable.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  // Helper to extract nested keys dynamically based on typical BVN API responses
  const getField = (keys: string[]) => {
    if (!successData?.data) return 'N/A';
    for (const key of keys) {
      if (successData.data[key]) return successData.data[key];
    }
    return 'N/A';
  };

  return (
    <>
      {/* Print Styles injection to isolate the Slip when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-bvn-slip, #printable-bvn-slip * {
            visibility: visible;
          }
          #printable-bvn-slip {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 100%;
            max-width: 800px;
            box-shadow: none !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 16px !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* FLOATING ERROR TOAST */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[200] w-[90%] sm:w-auto max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-2xl border border-red-500">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="font-semibold text-sm flex-1 leading-snug">{error}</span>
            <button onClick={() => setError('')} className="p-1.5 hover:bg-red-700 rounded-xl transition-colors shrink-0">
              <X size={16} />
            </button>
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
            BVN Verification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Verify and generate official Bank Verification Number details instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE FORM / REVEALED RESULT */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {successData ? (
                <div className="animate-in zoom-in duration-300 relative z-10">
                  <div className="text-center mb-8 no-print">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <CheckCircle2 size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification Successful!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm font-medium">
                      The BVN details have been successfully retrieved. Review the information below before printing.
                    </p>
                  </div>

                  {/* REVEALED BVN INFORMATION (PRINTABLE) */}
                  <div id="printable-bvn-slip" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-8 relative text-slate-900">
                    {/* Slip Header */}
                    <div className="bg-slate-50 border-b border-slate-200 p-6 text-center">
                       <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">BVN Verification Slip</h2>
                       <p className="text-sm text-slate-500 font-medium mt-1">Official Bank Verification Record</p>
                    </div>
                    
                    <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                      {/* Photo Section */}
                      <div className="shrink-0">
                        <div className="w-32 h-40 bg-slate-100 border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                          {getField(['base64Image', 'photo', 'image']) !== 'N/A' ? (
                            <img 
                              src={getField(['base64Image', 'photo', 'image']).startsWith('data:image') 
                                ? getField(['base64Image', 'photo', 'image']) 
                                : `data:image/jpeg;base64,${getField(['base64Image', 'photo', 'image'])}`
                              } 
                              alt="BVN Photo" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={48} className="text-slate-300" />
                          )}
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">First Name</p>
                          <p className="font-bold text-lg">{getField(['firstName', 'first_name'])}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Last Name</p>
                          <p className="font-bold text-lg">{getField(['lastName', 'last_name'])}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Middle Name</p>
                          <p className="font-bold text-lg">{getField(['middleName', 'middle_name'])}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Date of Birth</p>
                          <p className="font-bold text-lg">{getField(['dateOfBirth', 'dob'])}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                          <p className="font-bold text-lg">{getField(['phoneNumber1', 'phone', 'phoneNumber'])}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">BVN</p>
                          <p className="font-bold text-lg tracking-widest">{successData.target}</p>
                        </div>
                      </div>
                    </div>

                    {/* Slip Footer */}
                    <div className="bg-slate-50 border-t border-slate-200 p-4 text-xs text-slate-500 flex justify-between font-medium">
                      <span>Ref: {successData.reference}</span>
                      <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  
                  {/* BIG ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
                    <button 
                      onClick={handlePrint}
                      className="w-full sm:w-auto py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <Printer size={20} strokeWidth={2.5} /> Print / Save PDF
                    </button>
                    <button 
                      onClick={() => setSuccessData(null)}
                      className="w-full sm:w-auto px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Verify Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Target BVN Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={11}
                        required
                        value={bvn}
                        onChange={handleInputChange}
                        placeholder="Enter 11-digit BVN"
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-mono"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span className={`text-xs font-semibold ${bvn.length === 11 ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {bvn.length}/11 digits
                      </span>
                    </div>
                  </div>

                  {service && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Verification Charge</span>
                      <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  )}

                  {(!service || !service.isActive) && (
                    <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                      <AlertTriangle size={16} />
                      This service is currently disabled.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={!service?.isActive || loading || bvn.length !== 11}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                    ) : (
                      'Verify BVN'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY LINK */}
          <div className="lg:col-span-1 space-y-6 no-print">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Transaction Logs</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Review your previously verified Bank Verification Numbers directly from your secure log.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn/verification"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-blue-200 dark:group-hover:border-blue-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded-md text-blue-600 dark:text-blue-400">
                  <Info size={14} />
                </div>
                How Print Works
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  Clicking "Print / Save PDF" will open your browser's print dialog.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  Select "Save as PDF" as the destination to download the  slip directly to your device.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
