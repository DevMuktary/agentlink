'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileEdit, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X 
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  serviceCode: number;
  price: number;
};

export default function BvnModificationClient({ 
  modServices, banks 
}: { 
  modServices: ServiceData[], banks: ServiceData[] 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Global selections
  const [selectedModCode, setSelectedModCode] = useState<number | ''>('');
  const [selectedBankCode, setSelectedBankCode] = useState<number | ''>('');
  
  // Required Identifiers
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [oldFirstName, setOldFirstName] = useState('');
  const [oldSurname, setOldSurname] = useState('');
  const [oldMiddleName, setOldMiddleName] = useState('');

  // Dynamic Change Fields
  const [newFirstName, setNewFirstName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newMiddleName, setNewMiddleName] = useState('');
  const [oldDob, setOldDob] = useState('');
  const [newDob, setNewDob] = useState('');
  const [oldPhone, setOldPhone] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Surcharge logic
  const SURCHARGE_AMOUNT = 4000;
  const [surchargeApplies, setSurchargeApplies] = useState(false);

  const activeService = modServices.find(s => s.serviceCode === Number(selectedModCode));
  const activeCodeStr = activeService?.code || '';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Calculate Age Surcharge dynamically
  useEffect(() => {
    if ((activeCodeStr.includes('DOB') || activeCodeStr.includes('FULL')) && oldDob && newDob) {
      const d1 = new Date(oldDob).getTime();
      const d2 = new Date(newDob).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        const diffYears = Math.abs(d2 - d1) / (1000 * 60 * 60 * 24 * 365);
        setSurchargeApplies(diffYears > 5);
      } else {
        setSurchargeApplies(false);
      }
    } else {
      setSurchargeApplies(false);
    }
  }, [oldDob, newDob, activeCodeStr]);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, limit: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, limit);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (nin.length !== 11) return setError('Please enter exactly 11 digits for NIN.');
    if (bvn.length !== 11) return setError('Please enter exactly 11 digits for BVN.');

    setLoading(true);

    const customReference = `DASH-BVNMOD-${Date.now()}`;

    try {
      const res = await fetch('/api/bvn/modification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_code: selectedModCode,
          bank_code: selectedBankCode,
          reference: customReference,
          nin, bvn,
          old_first_name: oldFirstName,
          old_surname: oldSurname,
          old_middle_name: oldMiddleName,
          old_dob: oldDob, new_dob: newDob,
          old_phone_number: oldPhone, new_phone_number: newPhone,
          new_first_name: newFirstName, new_surname: newSurname, new_middle_name: newMiddleName
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit modification request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: data.data?.charged_amount || (activeService?.price || 0),
        bank: data.data?.bank,
        note: data.data?.note,
        serviceName: activeService?.name
      });
      
      // Reset Form
      setNin(''); setBvn(''); setOldFirstName(''); setOldSurname(''); setOldMiddleName('');
      setNewFirstName(''); setNewSurname(''); setNewMiddleName('');
      setOldDob(''); setNewDob(''); setOldPhone(''); setNewPhone('');
      setSelectedModCode(''); setSelectedBankCode('');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const totalCost = (activeService?.price || 0) + (surchargeApplies ? SURCHARGE_AMOUNT : 0);

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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Modification Terms</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Strict rules apply. Read carefully.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <ul className="space-y-3 list-decimal pl-4">
                <li><span className="font-bold text-slate-800 dark:text-slate-200">Valid Banks Only:</span> Make sure it is an Agency Enrollment or one of our listed banks.</li>
                <li><span className="font-bold text-slate-800 dark:text-slate-200">Reflect on VNIN:</span> If you did a NIN modification first, ensure it is fully reflecting on your VNIN Slip. NIBSS does not process double modifications.</li>
                <li><span className="font-bold text-slate-800 dark:text-slate-200">One-Time Rule:</span> You can only change your details once.</li>
              </ul>

              <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400">
                <h4 className="font-bold mb-2">NO REFUND IF:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>It's a Bank Enrollment not on our listed banks.</li>
                  <li>You submit your Old NIN details.</li>
                  <li>You have previously done similar modifications.</li>
                  <li>It is a Complete Change of Name.</li>
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20 text-orange-800 dark:text-orange-400">
                <h4 className="font-bold mb-1">₦1,000 PENALTY IF:</h4>
                <p>You submit invalid details or submit duplicate requests as one.</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
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
            <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
              <FileEdit size={26} strokeWidth={2.5} />
            </div>
            BVN Data Modification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Request manual updates to your BVN records via our authorized channels.
          </p>
        </div>

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
                    Your {successData.serviceName} request for <span className="font-bold">{successData.bank}</span> has been routed to our admins.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Total Charged:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(successData.charged_amount)}</span>
                    </div>
                    {successData.note && (
                      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-orange-600 dark:text-orange-400 font-semibold italic text-center">
                        * {successData.note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                      onClick={() => setSuccessData(null)}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Submit Another
                    </button>
                    <Link 
                      href="/dashboard/history/bvn/modification"
                      className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      View History <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SELECTION ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Bank / Enrollment</label>
                        <select 
                          required value={selectedBankCode} onChange={(e) => setSelectedBankCode(Number(e.target.value))}
                          disabled={loading}
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500/50"
                        >
                          <option value="">-- Choose Option --</option>
                          {banks.map(b => <option key={b.id} value={b.serviceCode}>{b.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What to Modify</label>
                        <select 
                          required value={selectedModCode} onChange={(e) => setSelectedModCode(Number(e.target.value))}
                          disabled={loading}
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500/50"
                        >
                          <option value="">-- Choose Service --</option>
                          {modServices.map(s => <option key={s.id} value={s.serviceCode}>{s.name}</option>)}
                        </select>
                     </div>
                  </div>

                  {/* IDENTIFIERS */}
                  {selectedModCode && selectedBankCode && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                      
                      <div>
                        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                          Primary Identifiers
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIN (11 Digits)</label>
                            <input type="text" inputMode="numeric" required maxLength={11} value={nin} onChange={(e) => handleNumericInput(e, setNin, 11)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">BVN (11 Digits)</label>
                            <input type="text" inputMode="numeric" required maxLength={11} value={bvn} onChange={(e) => handleNumericInput(e, setBvn, 11)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old First Name (As on BVN)</label>
                            <input type="text" required value={oldFirstName} onChange={(e) => setOldFirstName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Surname (As on BVN)</label>
                            <input type="text" required value={oldSurname} onChange={(e) => setOldSurname(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                            <input type="text" value={oldMiddleName} onChange={(e) => setOldMiddleName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                          </div>
                        </div>
                      </div>

                      {/* DYNAMIC FIELDS */}
                      <div>
                        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                          Modification Data
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                          
                          {(activeCodeStr.includes('NAME') || activeCodeStr.includes('FULL')) && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New First Name</label>
                                <input type="text" required value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Surname</label>
                                <input type="text" required value={newSurname} onChange={(e) => setNewSurname(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input type="text" value={newMiddleName} onChange={(e) => setNewMiddleName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                            </>
                          )}

                          {(activeCodeStr.includes('DOB') || activeCodeStr.includes('FULL')) && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Date of Birth</label>
                                <input type="date" required value={oldDob} onChange={(e) => setOldDob(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Date of Birth</label>
                                <input type="date" required value={newDob} onChange={(e) => setNewDob(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                            </>
                          )}

                          {(activeCodeStr.includes('PHONE') || activeCodeStr.includes('FULL')) && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Phone Number</label>
                                <input type="text" inputMode="numeric" required value={oldPhone} onChange={(e) => handleNumericInput(e, setOldPhone, 11)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Phone Number</label>
                                <input type="text" inputMode="numeric" required value={newPhone} onChange={(e) => handleNumericInput(e, setNewPhone, 11)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-rose-500/50" />
                              </div>
                            </>
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                  {/* PRICE SUMMARY */}
                  {activeService && selectedBankCode && (
                    <div className="space-y-3 animate-in fade-in">
                      {surchargeApplies && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-xl border border-orange-200 dark:border-orange-500/20 flex items-center gap-2">
                          <AlertTriangle size={16} className="shrink-0" />
                          A ₦{SURCHARGE_AMOUNT.toLocaleString()} surcharge is added for age corrections exceeding 5 years.
                        </div>
                      )}
                      <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Modification Fee</span>
                        <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400">
                          {formatCurrency(totalCost)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || nin.length !== 11 || bvn.length !== 11 || !selectedModCode || !selectedBankCode}
                    className="w-full py-4 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Request...</>
                    ) : (
                      'Submit Modification'
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
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <FileEdit size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Admin Processing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Modifications are processed by our admin team manually. Please check your history log to view admin notes and feedback.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn/modification"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-rose-200 dark:group-hover:border-rose-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-rose-500 transition-all" />
                </Link>
              </div>
            </div>

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
                  If your request fails due to an invalid submission or rule violation, a ₦1,000 penalty charge will be deducted from your refund.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  A ₦4,000 provider surcharge is automatically added if you are correcting an age difference greater than 5 years.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
