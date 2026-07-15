'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileCog, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X 
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  serviceCode: number;
  isActive: boolean;
  price: number;
};

export default function NinModificationClient({ services }: { services: ServiceData[] }) {
  // Base State
  const [selectedServiceCode, setSelectedServiceCode] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  
  // Terms Modal State
  const [showModal, setShowModal] = useState(true);

  // Form Fields State
  const [nin, setNin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [newFirstName, setNewFirstName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newMiddleName, setNewMiddleName] = useState('');
  
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const activeService = services.find(s => s.serviceCode === Number(selectedServiceCode));
  const isEntireCategoryDown = services.length > 0 && services.every(s => !s.isActive);

  // Helper to rename database codes to user-friendly names
  const getPolishedName = (code: string, fallbackName: string) => {
    switch (code) {
      case 'NIN_MODIFICATION_NAME': return 'Change of Name';
      case 'NIN_MODIFICATION_PHONE': return 'Change of Phone Number';
      case 'NIN_MODIFICATION_ADDRESS': return 'Change of Address';
      default: return fallbackName;
    }
  };

  const handleNinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setNin(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (nin.length !== 11) {
      setError('Please enter exactly 11 digits for the NIN.');
      return;
    }

    setLoading(true);

    const customReference = `DASH-MOD-${Date.now()}`;

    // Build payload dynamically based on API requirements
    const payload: any = {
      service_code: selectedServiceCode,
      nin: nin,
      reference: customReference
    };

    if (selectedServiceCode === 501) {
      payload.phone_number = phoneNumber;
      payload.new_first_name = newFirstName;
      payload.new_surname = newSurname;
      payload.new_middle_name = newMiddleName;
    } else if (selectedServiceCode === 502) {
      payload.full_name = fullName;
      payload.new_phone_number = newPhoneNumber;
    } else if (selectedServiceCode === 503) {
      payload.phone_number = phoneNumber;
      payload.full_name = fullName;
      payload.new_address = newAddress;
    }

    try {
      const res = await fetch('/api/v1/identity/nin-modification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit modification request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: activeService?.price || 0,
        serviceName: getPolishedName(activeService?.code || '', 'Modification')
      });
      
      // Reset form
      setNin(''); setPhoneNumber(''); setFullName('');
      setNewFirstName(''); setNewSurname(''); setNewMiddleName('');
      setNewPhoneNumber(''); setNewAddress('');
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

      {/* MANDATORY TERMS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Agreement</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please read and agree before proceeding.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Authorization to Act on Your Behalf</h4>
                <p>I, the user, authorize AgentHub and its trusted agents to access and use my personal data, including my NIN, to process the modification requested. I understand that AgentHub is an independent agent and is not affiliated with NIMC.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Your Voluntary Consent</h4>
                <p>NIMC recommends that NIN modifications be done personally. By agreeing, I confirm that due to technical difficulty, illiteracy, or convenience, I voluntarily authorize AgentHub to perform this modification on my behalf. This applies whether I am the NIN owner or an agent acting with the full consent of the owner.</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20">
                <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">3. Service Fees & No-Refund Policy</h4>
                <p className="text-orange-700 dark:text-orange-400">I agree to pay the non-refundable service fee. I understand that wallet funds are non-withdrawable. If a service fails due to an Admin or provider error (as specified in our auto-refund logic), the fee will be credited to my wallet, but it cannot be withdrawn. A ₦500 charge for wrong submissions will be deducted from any refund.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">4. Your Responsibilities</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>I confirm all information I provide (like "New First Name" or "New Address") is 100% correct.</li>
                  <li>I will not submit the same request on another platform while it is PROCESSING here. Doing so will forfeit my payment.</li>
                  <li>If submitting for someone else, I confirm I have the NIN owner's full legal authorization.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">5. Provider Delays & Service Terms</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-semibold">Bank/SIM Updates:</span> I understand that modifications reflect immediately on the NIMC portal, but banks and SIM providers may take a long time to sync. If I need this for an urgent bank transaction, I will not proceed.</li>
                  <li><span className="font-semibold">NIMC Delays:</span> If NIMC's network is down, I agree to wait patiently and will not submit duplicate requests.</li>
                  <li><span className="font-semibold">Alias Emails:</span> I understand that this platform uses secure, platform-owned "alias emails" to process all modifications.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                I have read, understood, and agreed to all terms
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
            <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
              <FileCog size={26} strokeWidth={2.5} />
            </div>
            NIN Data Modification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Update Name, Phone Number, or Address records on the national database.
          </p>
        </div>

        {isEntireCategoryDown && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Service Currently Unavailable</h3>
              <p className="text-sm text-red-700 dark:text-red-400/80 mt-1 font-medium">
                NIN Modification services are currently undergoing maintenance by NIMC. Please check back later.
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Modification Submitted!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your request for {successData.serviceName} has been queued. Please monitor your history log for progress.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
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
                      href="/dashboard/history/nin/modification"
                      className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl text-sm hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Track Status <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-5">
                    
                    {/* SERVICE SELECTOR */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        What would you like to modify?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {services.map(service => {
                          const isSelected = selectedServiceCode === service.serviceCode;
                          const isDisabled = !service.isActive || isEntireCategoryDown || loading;

                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => setSelectedServiceCode(service.serviceCode)}
                              disabled={isDisabled}
                              className={`relative p-4 rounded-xl border text-left transition-all ${
                                isSelected 
                                  ? 'bg-orange-50 border-orange-500 shadow-sm dark:bg-orange-500/10 dark:border-orange-500' 
                                  : 'bg-slate-50 border-slate-200 hover:border-orange-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-600'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-800' : ''}`}
                            >
                              <h4 className={`font-bold text-sm leading-snug ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {getPolishedName(service.code, service.name)}
                              </h4>
                              {!service.isActive && (
                                <span className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-md inline-block">
                                  Maintenance
                                </span>
                              )}
                              {isSelected && (
                                <div className="absolute top-4 right-3 text-orange-500 dark:text-orange-400 animate-in zoom-in">
                                  <CheckCircle2 size={18} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DYNAMIC FORM FIELDS */}
                    {selectedServiceCode && (
                      <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target NIN</label>
                          <input 
                            type="text" inputMode="numeric" pattern="\d*" maxLength={11} required
                            value={nin} onChange={handleNinChange}
                            placeholder="11-digit NIN" disabled={loading}
                            className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50"
                          />
                        </div>

                        {/* IF 501: CHANGE OF NAME */}
                        {selectedServiceCode === 501 && (
                          <>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Phone Number linked to NIN</label>
                              <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08012345678" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New First Name</label>
                                <input type="text" required value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Enter new first name" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Surname</label>
                                <input type="text" required value={newSurname} onChange={(e) => setNewSurname(e.target.value)} placeholder="Enter new surname" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                              <input type="text" value={newMiddleName} onChange={(e) => setNewMiddleName(e.target.value)} placeholder="Enter new middle name" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                            </div>
                          </>
                        )}

                        {/* IF 502: CHANGE OF PHONE */}
                        {selectedServiceCode === 502 && (
                          <>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Full Name on NIN</label>
                              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First Last" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Phone Number to Link</label>
                              <input type="text" required value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} placeholder="08012345678" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                            </div>
                          </>
                        )}

                        {/* IF 503: CHANGE OF ADDRESS */}
                        {selectedServiceCode === 503 && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Full Name</label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First Last" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Phone Number</label>
                                <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08012345678" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Address</label>
                              <input type="text" required value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Enter full new residential address" disabled={loading} className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/50" />
                            </div>
                          </>
                        )}

                      </div>
                    )}
                  </div>

                  {activeService && (
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Modification Fee</span>
                      <span className="text-xl font-extrabold text-orange-700 dark:text-orange-400">
                        {formatCurrency(activeService.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isEntireCategoryDown || loading || nin.length !== 11 || !selectedServiceCode}
                    className="w-full py-4 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                    ) : (
                      'Submit Modification Request'
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
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Modifications are processed by the national database and require time to verify. Check your history log to track progress.
                </p>
                
                <Link 
                  href="/dashboard/history/nin/modification"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-orange-200 dark:group-hover:border-orange-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
                </Link>
              </div>
            </div>

            {/* Important Guidelines Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-red-100 dark:bg-red-500/20 rounded-md text-red-600 dark:text-red-400">
                  <Info size={14} />
                </div>
                Important Reminder
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  Ensure you have legal authorization before submitting records on behalf of others.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  If your request fails due to an invalid submission, a ₦500 penalty charge will be deducted from your refund.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
