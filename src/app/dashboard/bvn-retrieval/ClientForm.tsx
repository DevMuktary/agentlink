'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X, UploadCloud
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  serviceCode: number;
  price: number;
  isActive: boolean;
};

export default function BvnRetrievalClient({ services }: { services: ServiceData[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Selection
  const [selectedServiceCode, setSelectedServiceCode] = useState<number | ''>('');

  // Fields: Category A (Phone)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');

  // Fields: Category B (CRM)
  const [agentCode, setAgentCode] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [bmsTicket, setBmsTicket] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const activeService = services.find(s => s.serviceCode === Number(selectedServiceCode));
  const activeCodeStr = activeService?.code || '';
  const isEntireCategoryDown = services.length > 0 && services.every(s => !s.isActive);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB.");
        setScreenshot(null);
        e.target.value = '';
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    setLoading(true);
    const customReference = `DASH-RET-${Date.now()}`;

    try {
      // Because we have a file, we MUST use FormData instead of JSON
      const formData = new FormData();
      formData.append('service_code', String(selectedServiceCode));
      formData.append('reference', customReference);

      if (activeCodeStr === 'BVN_RETRIEVAL_PHONE') {
        if (!phoneNumber || !fullName) throw new Error("Phone number and Full Name are required.");
        formData.append('phone_number', phoneNumber);
        formData.append('full_name', fullName);
      } 
      else if (activeCodeStr === 'BVN_RETRIEVAL_CRM') {
        if (!agentCode || !ticketId || !bmsTicket || !screenshot) {
          throw new Error("All CRM fields and a screenshot are required.");
        }
        formData.append('agent_code', agentCode);
        formData.append('ticket_id', ticketId);
        formData.append('bms_ticket', bmsTicket);
        formData.append('screenshot', screenshot);
      }

      // Important: Do not set Content-Type manually when using FormData
      const res = await fetch('/api/bvn/retrieval', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit retrieval request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: activeService?.price || 0,
        serviceName: activeService?.name
      });
      
      // Reset Form
      setSelectedServiceCode('');
      setPhoneNumber(''); setFullName('');
      setAgentCode(''); setTicketId(''); setBmsTicket(''); setScreenshot(null);
      
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
              <div className="w-14 h-14 bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Retrieval Terms
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are submitting a request to manually retrieve a BVN record from the database.
                </p>
                <div className="text-fuchsia-800 dark:text-fuchsia-300 font-bold bg-fuchsia-50 dark:bg-fuchsia-500/10 p-3.5 rounded-xl border border-fuchsia-100 dark:border-fuchsia-500/20">
                  <p className="uppercase tracking-wider text-[11px] mb-1">Important</p>
                  <p className="text-sm">For CRM retrievals, you must upload a clear screenshot as proof. Blurry or irrelevant images will be instantly rejected.</p>
                </div>
                <p>
                  Requests are processed by our admins. You can check the final result (the retrieved 11-digit BVN) directly from your history log.
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
            <div className="p-2.5 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-xl text-fuchsia-600 dark:text-fuchsia-400">
              <Database size={26} strokeWidth={2.5} />
            </div>
            BVN Retrieval
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Request manual BVN retrieval using Phone Number or CRM details.
          </p>
        </div>

        {isEntireCategoryDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                BVN Retrieval services are undergoing scheduled maintenance. Please check back later.
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
                    Your {successData.serviceName} request has been queued. Our admin team will process it shortly.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Total Charged:</span>
                      <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{formatCurrency(successData.charged_amount)}</span>
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
                      href="/dashboard/history/bvn/retrieval"
                      className="px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-xl text-sm hover:bg-fuchsia-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      View History <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SERVICE SELECTION (Button Grid) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">How would you like to retrieve?</label>
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
                            className={`relative p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-fuchsia-50 border-fuchsia-500 shadow-sm dark:bg-fuchsia-500/10 dark:border-fuchsia-500 ring-1 ring-fuchsia-500' 
                                : 'bg-slate-50 border-slate-200 hover:border-fuchsia-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-600'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-800' : ''}`}
                          >
                            <h4 className={`font-bold text-sm leading-snug pr-6 ${isSelected ? 'text-fuchsia-700 dark:text-fuchsia-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {service.name.replace('BVN Retrieval: ', 'By ')}
                            </h4>
                            {!service.isActive && (
                                <span className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-md inline-block">
                                  Maintenance
                                </span>
                            )}
                            {isSelected && (
                              <div className="absolute top-4 right-3 text-fuchsia-500 dark:text-fuchsia-400 animate-in zoom-in">
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
                      
                      {activeCodeStr === 'BVN_RETRIEVAL_PHONE' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Registered Phone Number</label>
                            <input type="text" inputMode="numeric" required maxLength={11} value={phoneNumber} onChange={(e) => handleNumericInput(e, setPhoneNumber, 11)} placeholder="08012345678" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-fuchsia-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name (As on record)</label>
                            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First Last" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-fuchsia-500/50" />
                          </div>
                        </>
                      )}

                      {activeCodeStr === 'BVN_RETRIEVAL_CRM' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Agent Code</label>
                              <input type="text" required value={agentCode} onChange={(e) => setAgentCode(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-fuchsia-500/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ticket ID</label>
                              <input type="text" required value={ticketId} onChange={(e) => setTicketId(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-fuchsia-500/50" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">BMS Ticket Reference</label>
                            <input type="text" required value={bmsTicket} onChange={(e) => setBmsTicket(e.target.value)} disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-fuchsia-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Upload Screenshot Proof</label>
                            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <UploadCloud className="w-8 h-8 text-fuchsia-500 mb-2" />
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {screenshot ? screenshot.name : "Tap to upload image (Max 5MB)"}
                              </span>
                              <input 
                                type="file" required accept="image/*" onChange={handleFileChange} disabled={loading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  )}

                  {activeService && (
                    <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Retrieval Fee</span>
                      <span className="text-xl font-extrabold text-fuchsia-700 dark:text-fuchsia-400">
                        {formatCurrency(activeService.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !selectedServiceCode || (activeCodeStr === 'BVN_RETRIEVAL_PHONE' && phone.length < 10) || (activeCodeStr === 'BVN_RETRIEVAL_CRM' && !screenshot)}
                    className="w-full py-4 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Request...</>
                    ) : (
                      'Submit Retrieval Request'
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
                <div className="w-12 h-12 bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Database size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Admin Processing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Retrievals are processed by our admin team. Check your history log to view the retrieved BVN once completed.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn/retrieval"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-fuchsia-500 transition-all" />
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
                  CRM requests without a valid and clear screenshot will be instantly rejected.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  If the retrieval fails (e.g. record not found), your wallet will be fully refunded by the admin. Expect update within 24hours
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
