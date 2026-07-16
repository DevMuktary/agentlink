'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Landmark, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X, User, Building2
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  serviceCode: number;
  price: number;
  isActive: boolean;
};

export default function TaxIdClient({ services }: { services: ServiceData[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Selection
  const [selectedServiceCode, setSelectedServiceCode] = useState<number | ''>('');

  // Fields: Individual
  const [nin, setNin] = useState('');
  const [dob, setDob] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [middleName, setMiddleName] = useState('');

  // Fields: Corporate (Non-Individual)
  const [businessName, setBusinessName] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  const activeService = services.find(s => s.serviceCode === Number(selectedServiceCode));
  const activeCodeStr = activeService?.code || '';
  const isEntireCategoryDown = services.length > 0 && services.every(s => !s.isActive);

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, limit: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, limit);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    setLoading(true);
    const customReference = `DASH-TAX-${Date.now()}`;

    try {
      // Validate based on active category
      if (activeCodeStr === 'TAX_ID_INDIVIDUAL') {
        if (nin.length !== 11) throw new Error("Please enter exactly 11 digits for the NIN.");
        if (!dob || !firstName || !surname) throw new Error("DOB, First Name, and Surname are required.");
      } else if (activeCodeStr === 'TAX_ID_NON_INDIVIDUAL') {
        if (!businessName || !rcNumber) throw new Error("Business Name and RC/BN Number are required.");
      }

      const res = await fetch('/api/corporate/tax-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_code: selectedServiceCode,
          reference: customReference,
          
          // Individual Payload
          nin: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? nin : undefined,
          dob: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? dob : undefined,
          first_name: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? firstName : undefined,
          surname: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? surname : undefined,
          middle_name: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? middleName : undefined,

          // Corporate Payload
          business_name: activeCodeStr === 'TAX_ID_NON_INDIVIDUAL' ? businessName : undefined,
          rc_number: activeCodeStr === 'TAX_ID_NON_INDIVIDUAL' ? rcNumber : undefined,
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit Tax ID request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: activeService?.price || 0,
        serviceName: activeService?.name,
        target: activeCodeStr === 'TAX_ID_INDIVIDUAL' ? `${firstName} ${surname}` : businessName
      });
      
      // Reset Form
      setSelectedServiceCode('');
      setNin(''); setDob(''); setFirstName(''); setSurname(''); setMiddleName('');
      setBusinessName(''); setRcNumber('');
      
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

      {/* MANDATORY TERMS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Landmark size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Tax ID Generation
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are submitting a request to generate an official Tax Identification Number (TIN).
                </p>
                <div className="text-blue-800 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-500/10 p-3.5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                  <p className="uppercase tracking-wider text-[11px] mb-1">Processing Time</p>
                  <p className="text-sm">These requests are manually processed by our administrative team. It typically takes between 24 to 48 hours to receive the generated ID.</p>
                </div>
                <p>
                  Once completed, you can copy your generated Tax ID directly from your history log, and download the official slip if one is provided by the admin.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm w-full"
              >
                I Understand
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
              <Landmark size={26} strokeWidth={2.5} />
            </div>
            Tax Identification Number
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Request an official Tax ID for Individuals or Corporate Businesses.
          </p>
        </div>

        {isEntireCategoryDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                Tax ID generation is currently undergoing scheduled maintenance. Please check back later.
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
                    Your {successData.serviceName} request for <span className="font-bold text-slate-700 dark:text-slate-300">{successData.target}</span> has been queued for admin processing.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Total Charged:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(successData.charged_amount)}</span>
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
                      href="/dashboard/history/corporate/tax-id"
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      View History <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SERVICE SELECTION (Button Grid) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Entity Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map(service => {
                        const isSelected = selectedServiceCode === service.serviceCode;
                        const isDisabled = !service.isActive || loading;
                        
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedServiceCode(service.serviceCode)}
                            disabled={isDisabled}
                            className={`relative p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-500 shadow-sm dark:bg-blue-500/10 dark:border-blue-500 ring-1 ring-blue-500' 
                                : 'bg-slate-50 border-slate-200 hover:border-blue-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-600'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-800' : ''}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                               {service.code === 'TAX_ID_INDIVIDUAL' ? <User className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} /> : <Building2 className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />}
                               <h4 className={`font-bold text-sm leading-snug pr-6 ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                 {service.name.replace('Tax ID: ', '')}
                               </h4>
                            </div>
                            
                            {!service.isActive && (
                                <span className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-md inline-block w-max">
                                  Maintenance
                                </span>
                            )}
                            {isSelected && (
                              <div className="absolute top-4 right-3 text-blue-500 dark:text-blue-400 animate-in zoom-in">
                                <CheckCircle2 size={18} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DYNAMIC FIELDS */}
                  {selectedServiceCode && (
                    <div className="space-y-5 animate-in slide-in-from-top-4 duration-300 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      
                      {/* INDIVIDUAL FIELDS */}
                      {activeCodeStr === 'TAX_ID_INDIVIDUAL' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Surname</label>
                            <input type="text" required value={surname} onChange={(e) => setSurname(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Middle Name <span className="font-normal text-slate-400">(Optional)</span></label>
                            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label>
                              <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIN (11 Digits)</label>
                              <input type="text" inputMode="numeric" required maxLength={11} value={nin} onChange={(e) => handleNumericInput(e, setNin, 11)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50 font-mono" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* CORPORATE FIELDS */}
                      {activeCodeStr === 'TAX_ID_NON_INDIVIDUAL' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Business / Company Name</label>
                            <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">RC Number or BN Number</label>
                            <input type="text" required value={rcNumber} onChange={(e) => setRcNumber(e.target.value.toUpperCase())} placeholder="e.g. RC123456 or BN123456" disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-blue-500/50 font-mono uppercase" />
                          </div>
                        </>
                      )}

                    </div>
                  )}

                  {activeService && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Generation Fee</span>
                      <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                        {formatCurrency(activeService.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !selectedServiceCode || (activeCodeStr === 'TAX_ID_INDIVIDUAL' && nin.length < 11)}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Request...</>
                    ) : (
                      'Submit Tax ID Request'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Landmark size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Processing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Tax IDs are generated by our admin team. Check your history log to view and copy the generated 13-digit number once completed.
                </p>
                
                <Link 
                  href="/dashboard/history/corporate/tax-id"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-blue-200 dark:group-hover:border-blue-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
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
                  Ensure the names provided match official documents (NIN for individuals, CAC for corporates).
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  If the generation fails due to unmatched or invalid data, your wallet will be fully refunded by the admin.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
