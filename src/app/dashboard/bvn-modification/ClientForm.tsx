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

export default function BvnModificationClient({ bankServices, modServices }: { bankServices: ServiceData[], modServices: ServiceData[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Selections
  const [selectedBankCode, setSelectedBankCode] = useState<number | ''>('');
  const [selectedModCode, setSelectedModCode] = useState<number | ''>('');

  // Identifiers
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');

  // Old Identity Data (Required for all)
  const [oldFirstName, setOldFirstName] = useState('');
  const [oldSurname, setOldSurname] = useState('');
  const [oldMiddleName, setOldMiddleName] = useState('');

  // Change Fields
  const [oldDob, setOldDob] = useState('');
  const [newDob, setNewDob] = useState('');
  const [oldPhone, setOldPhone] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newMiddleName, setNewMiddleName] = useState('');

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const activeModService = modServices.find(s => s.serviceCode === Number(selectedModCode));
  const activeBankService = bankServices.find(s => s.serviceCode === Number(selectedBankCode));

  // Determine which fields to show based on selected service code
  const modCodeStr = activeModService?.code || '';
  const isNameChange = modCodeStr.includes('NAME') || modCodeStr.includes('FULL');
  const isDobChange = modCodeStr.includes('DOB') || modCodeStr.includes('FULL');
  const isPhoneChange = modCodeStr.includes('PHONE') || modCodeStr.includes('FULL');

  // Check for Surcharge (> 5 years)
  let surchargeApplies = false;
  if (isDobChange && oldDob && newDob) {
    const d1 = new Date(oldDob);
    const d2 = new Date(newDob);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      const diffYears = Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 5) surchargeApplies = true;
    }
  }

  const finalCost = (activeModService?.price || 0) + (surchargeApplies ? 4000 : 0);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, limit: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, limit);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (!selectedBankCode) return setError('Please select a Bank.');
    if (!selectedModCode) return setError('Please select a Modification Type.');
    if (nin.length !== 11) return setError('Please enter exactly 11 digits for NIN.');
    if (bvn.length !== 11) return setError('Please enter exactly 11 digits for BVN.');

    setLoading(true);
    const customReference = `DASH-BVNMOD-${Date.now()}`;

    try {
      const payload: any = {
        service_code: selectedModCode,
        bank_code: selectedBankCode,
        reference: customReference,
        nin, bvn,
        old_first_name: oldFirstName,
        old_surname: oldSurname,
        old_middle_name: oldMiddleName
      };

      if (isNameChange) {
        payload.new_first_name = newFirstName;
        payload.new_surname = newSurname;
        payload.new_middle_name = newMiddleName;
      }
      if (isDobChange) {
        payload.old_dob = oldDob;
        payload.new_dob = newDob;
      }
      if (isPhoneChange) {
        payload.old_phone_number = oldPhone;
        payload.new_phone_number = newPhone;
      }

      const res = await fetch('/api/bvn/modification', {
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
        charged_amount: finalCost,
        bank: data.data?.bank || 'Selected Bank',
        serviceName: activeModService?.name
      });
      
      // Reset form
      setNin(''); setBvn(''); 
      setOldFirstName(''); setOldSurname(''); setOldMiddleName('');
      setNewFirstName(''); setNewSurname(''); setNewMiddleName('');
      setOldDob(''); setNewDob('');
      setOldPhone(''); setNewPhone('');
      setSelectedBankCode(''); setSelectedModCode('');
      
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">BVN Modification Terms</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Please read our strict operational guidelines.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <ul className="space-y-4">
                <li><span className="font-bold text-slate-900 dark:text-white">1. Bank Eligibility:</span> Make sure it is an Agency Enrollment or one of the Listed Banks available in the dropdown.</li>
                <li><span className="font-bold text-slate-900 dark:text-white">2. NIN Reflection:</span> If you did a NIN Modification, make sure the modification is reflecting on the VNIN Slip. NIBSS does not do double modifications.</li>
                <li><span className="font-bold text-slate-900 dark:text-white">3. Once-Only Rule:</span> You can only change your details ONCE. E.g., if you modified your name previously, you cannot do it again. You're eligible to modify DOB, Phone Number and so on separately.</li>
              </ul>
              
              <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400">
                <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">4. NO REFUND CONDITIONS</h4>
                <p className="mb-2">There will be NO REFUND if we process your work and find out:</p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li>It's a Bank Enrollment (Except the Listed Banks).</li>
                  <li>You submitted your Old NIN details.</li>
                  <li>You have already done similar Modifications before.</li>
                  <li>It is a Complete Change of Name (All 3 names changed).</li>
                </ul>
                <p className="font-bold">PENALTY:</p>
                <p>You will be charged a <span className="font-bold">₦1000 penalty</span> if we proceed with your work and find out you submitted invalid details or submitted 2 requests as one.</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                I have read and agreed to the Terms
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
              <FileEdit size={26} strokeWidth={2.5} />
            </div>
            BVN Modification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Request manual BVN updates for Name, Date of Birth, or Phone Number.
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Modification Submitted!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your request has been forwarded to our admins for processing. Please check your history log for updates.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Service:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.serviceName}</span>
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
                      href="/dashboard/history/bvn/modification"
                      className="px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-xl text-sm hover:bg-fuchsia-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      View History <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SECTION 1: CONFIGURATION */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                      1. Select Modification Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Bank</label>
                        <select 
                          required value={selectedBankCode} onChange={(e) => setSelectedBankCode(Number(e.target.value))} disabled={loading}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50"
                        >
                          <option value="" disabled>-- Select Listed Bank --</option>
                          {bankServices.map(b => (
                            <option key={b.id} value={b.serviceCode}>{b.name.replace('Bank: ', '')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">What are you changing?</label>
                        <select 
                          required value={selectedModCode} onChange={(e) => setSelectedModCode(Number(e.target.value))} disabled={loading}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50"
                        >
                          <option value="" disabled>-- Select Modification --</option>
                          {modServices.map(m => (
                            <option key={m.id} value={m.serviceCode}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: IDENTIFIERS */}
                  {selectedModCode && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <h3 className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                        2. Target Identifiers & Current Data
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIN (11 Digits)</label>
                          <input type="text" inputMode="numeric" pattern="\d*" maxLength={11} required value={nin} onChange={(e) => handleNumericInput(e, setNin, 11)} disabled={loading} placeholder="00000000000" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">BVN (11 Digits)</label>
                          <input type="text" inputMode="numeric" pattern="\d*" maxLength={11} required value={bvn} onChange={(e) => handleNumericInput(e, setBvn, 11)} disabled={loading} placeholder="00000000000" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old First Name</label>
                          <input type="text" required value={oldFirstName} onChange={(e) => setOldFirstName(e.target.value)} disabled={loading} placeholder="Current first name" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Surname</label>
                          <input type="text" required value={oldSurname} onChange={(e) => setOldSurname(e.target.value)} disabled={loading} placeholder="Current last name" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                          <input type="text" value={oldMiddleName} onChange={(e) => setOldMiddleName(e.target.value)} disabled={loading} placeholder="Current middle name" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: DYNAMIC CHANGE FIELDS */}
                  {selectedModCode && (isNameChange || isDobChange || isPhoneChange) && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                        3. Provide New Data
                      </h3>

                      {isNameChange && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New First Name</label>
                            <input type="text" required value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} disabled={loading} placeholder="Correct first name" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Surname</label>
                            <input type="text" required value={newSurname} onChange={(e) => setNewSurname(e.target.value)} disabled={loading} placeholder="Correct surname" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                            <input type="text" value={newMiddleName} onChange={(e) => setNewMiddleName(e.target.value)} disabled={loading} placeholder="Correct middle name" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                        </div>
                      )}

                      {isDobChange && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Date of Birth</label>
                            <input type="date" required value={oldDob} onChange={(e) => setOldDob(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Date of Birth</label>
                            <input type="date" required value={newDob} onChange={(e) => setNewDob(e.target.value)} disabled={loading} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                        </div>
                      )}

                      {isPhoneChange && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Old Phone Number</label>
                            <input type="text" inputMode="numeric" required value={oldPhone} onChange={(e) => handleNumericInput(e, setOldPhone, 11)} disabled={loading} placeholder="08012345678" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Phone Number</label>
                            <input type="text" inputMode="numeric" required value={newPhone} onChange={(e) => handleNumericInput(e, setNewPhone, 11)} disabled={loading} placeholder="08098765432" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/50" />
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* CHECKOUT SUMMARY */}
                  {selectedModCode && (
                    <div className="space-y-3">
                      {surchargeApplies && (
                        <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm animate-in slide-in-from-bottom-2">
                          <AlertTriangle size={18} className="shrink-0" />
                          <div>
                            A ₦4,000 surcharge has been applied because the age correction exceeds 5 years.
                          </div>
                        </div>
                      )}
                      <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Processing Fee</span>
                        <span className="text-xl font-extrabold text-fuchsia-700 dark:text-fuchsia-400">
                          {formatCurrency(finalCost)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !selectedModCode || !selectedBankCode || nin.length !== 11 || bvn.length !== 11}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Modification...</>
                    ) : (
                      'Submit Modification Request'
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
                  <FileEdit size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  BVN Modifications require careful manual processing by our admins to ensure strict compliance. View your history log to see updates.
                </p>
                <Link 
                  href="/dashboard/history/bvn/modification"
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
                Penalty Notice
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  You will be charged a ₦1,000 penalty if we process your work and discover you submitted invalid details.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  Submitting the same request twice will also result in a penalty deduction from your refund.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
