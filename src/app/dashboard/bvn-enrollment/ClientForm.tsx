'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserPlus, History, AlertTriangle, 
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

export default function BvnEnrollmentClient({ service }: { service: ServiceData | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);

  // Form Fields - Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bvn, setBvn] = useState('');

  // Form Fields - Location
  const [homeAddress, setHomeAddress] = useState('');
  const [stateResidence, setStateResidence] = useState('');
  const [lga, setLga] = useState('');
  const [senatorial, setSenatorial] = useState('');
  const [agentLocation, setAgentLocation] = useState('');

  // Form Fields - Financial
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [parkwayWalletId, setParkwayWalletId] = useState('');

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isServiceDown = !service || !service.isActive;

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, limit: number) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, limit);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    
    if (bvn.length !== 11) return setError('Please enter exactly 11 digits for the BVN.');
    if (accountNumber.length !== 10) return setError('Please enter exactly 10 digits for Account Number.');

    setLoading(true);

    const customReference = `DASH-ENR-${Date.now()}`;

    try {
      const res = await fetch('/api/bvn/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parkway_wallet_id: parkwayWalletId,
          bvn: bvn,
          agent_location: agentLocation,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          home_address: homeAddress,
          state_of_residence: stateResidence,
          date_of_birth: dob,
          local_government: lga,
          senatorial_district: senatorial,
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to submit enrollment request.');
      }

      setSuccessData({
        reference: customReference,
        charged_amount: service?.price || 0,
        name: `${firstName} ${lastName}`
      });
      
      // Reset Form
      setFirstName(''); setLastName(''); setDob(''); setEmail(''); setPhone(''); setBvn('');
      setHomeAddress(''); setStateResidence(''); setLga(''); setSenatorial(''); setAgentLocation('');
      setBankName(''); setAccountNumber(''); setAccountName(''); setParkwayWalletId('');
      
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
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Important Enrollment Rules
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are applying for <span className="font-bold text-slate-800 dark:text-slate-200">Android BVN Enrollment Portal Access</span>.
                </p>
                <div className="text-violet-800 dark:text-violet-300 font-bold bg-violet-50 dark:bg-violet-500/10 p-3.5 rounded-xl border border-violet-100 dark:border-violet-500/20">
                  <p className="uppercase tracking-wider text-[11px] mb-1">Critical Requirement</p>
                  <p className="text-sm">Ensure you provide a completely NEW email address and phone number that have never been used before for any Android BVN Enrollment request.</p>
                </div>
                <p>
                  <span className="font-bold">Processing Time:</span> You will receive your User Login Details via your Email within <span className="font-bold text-slate-800 dark:text-slate-200">5 working days</span>.
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
            <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
              <UserPlus size={26} strokeWidth={2.5} />
            </div>
            Android BVN Enrollment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Register to get your portal credentials for enrolling BVNs for customers.
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your application is being processed. You will receive your login details via email within 5 working days.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Applicant:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.name}</span>
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
                      href="/dashboard/history/bvn/enrollment"
                      className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl text-sm hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      View History <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SECTION 1: PERSONAL DETAILS */}
                  <div>
                    <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isServiceDown || loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isServiceDown || loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label>
                        <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} disabled={isServiceDown || loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your BVN</label>
                        <input type="text" inputMode="numeric" pattern="\d*" maxLength={11} required value={bvn} onChange={(e) => handleNumericInput(e, setBvn, 11)} disabled={isServiceDown || loading} placeholder="11 digits" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address (Must be NEW)</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isServiceDown || loading} placeholder="New Email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number (Must be NEW)</label>
                        <input type="text" inputMode="numeric" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isServiceDown || loading} placeholder="08012345678" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: LOCATION DETAILS */}
                  <div>
                    <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Location Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Home Address</label>
                        <input type="text" required value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} disabled={isServiceDown || loading} placeholder="Full street address" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Agent Location (Business Address)</label>
                        <input type="text" required value={agentLocation} onChange={(e) => setAgentLocation(e.target.value)} disabled={isServiceDown || loading} placeholder="Where will you operate?" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">State of Residence</label>
                        <input type="text" required value={stateResidence} onChange={(e) => setStateResidence(e.target.value)} disabled={isServiceDown || loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Local Government Area</label>
                        <input type="text" required value={lga} onChange={(e) => setLga(e.target.value)} disabled={isServiceDown || loading} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Senatorial District</label>
                        <input type="text" required value={senatorial} onChange={(e) => setSenatorial(e.target.value)} disabled={isServiceDown || loading} placeholder="e.g. Lagos West" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: FINANCIAL DETAILS */}
                  <div>
                    <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Parkway Wallet ID</label>
                        <input type="text" required value={parkwayWalletId} onChange={(e) => setParkwayWalletId(e.target.value)} disabled={isServiceDown || loading} placeholder="Your Parkway Wallet ID" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bank Name</label>
                        <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isServiceDown || loading} placeholder="e.g. Access Bank" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Number (10 Digits)</label>
                        <input type="text" inputMode="numeric" pattern="\d*" maxLength={10} required value={accountNumber} onChange={(e) => handleNumericInput(e, setAccountNumber, 10)} disabled={isServiceDown || loading} placeholder="0123456789" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Name</label>
                        <input type="text" required value={accountName} onChange={(e) => setAccountName(e.target.value)} disabled={isServiceDown || loading} placeholder="Name matching your account" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-medium focus:ring-2 focus:ring-violet-500/50" />
                      </div>
                    </div>
                  </div>

                  {service && (
                    <div className="p-4 bg-violet-50/50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration Fee</span>
                      <span className="text-xl font-extrabold text-violet-700 dark:text-violet-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isServiceDown || loading || bvn.length !== 11 || accountNumber.length !== 10}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
                    ) : (
                      'Submit Registration'
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
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <UserPlus size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Enrollment applications require manual processing by our admins and take up to 5 working days. You can view your progress in your history.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn/enrollment"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-violet-200 dark:group-hover:border-violet-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-violet-500 transition-all" />
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
                  Your Email and Phone Number must be completely new. Applications with previously used details will be rejected.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  Credentials will be sent directly to your registered email address upon completion.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
