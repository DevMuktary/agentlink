'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, 
  Loader2, X, Fingerprint, Phone, User, 
  MapPin, Calendar, ImageIcon, History, ArrowRight 
} from 'lucide-react';

export default function NinVerificationClient({ services }: { services: any }) {
  const [searchMode, setSearchMode] = useState<'NIN' | 'PHONE'>('NIN');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Verification Result Data
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  // Slip Generation States
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [generatingSlip, setGeneratingSlip] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 15);
    setSearchValue(numericValue);
  };

  // Step 1: Verify and display raw data
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationResult(null);
    
    if (searchMode === 'NIN' && searchValue.length !== 11) return setError('NIN must be 11 digits.');
    if (searchMode === 'PHONE' && searchValue.length < 10) return setError('Invalid Phone Number.');

    setLoading(true);

    const reference = `DASH-VERIFY-${Date.now()}`;
    const endpoint = searchMode === 'NIN' ? '/api/v1/identity/nin-verify' : '/api/v1/identity/phone-verify';
    
    const payload = searchMode === 'NIN' 
      ? { nin: searchValue, reference } 
      : { phone: searchValue, reference };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.status === false) throw new Error(data.error || 'Verification Failed');

      setVerificationResult({
        ...data.data,
        request_id: data.request_id || reference
      });
      
    } catch (err: any) {
      let errorMsg = err.message;
      if (errorMsg.includes('400') || errorMsg.includes('not found')) {
        errorMsg = `No record found for this ${searchMode === 'NIN' ? 'NIN' : 'Phone Number'}.`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate Slip from Cached JSON
  const handleGenerateSlip = async () => {
    if (!selectedSlip || !verificationResult) return;
    
    setGeneratingSlip(true);
    setError('');

    const slipReference = `DASH-SLIP-${Date.now()}`;

    try {
      const res = await fetch('/api/dashboard/identity/generate-cached-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_reference: verificationResult.request_id,
          service_code: selectedSlip.serviceCode,
          reference: slipReference
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === false) throw new Error(data.error || 'Failed to generate slip');

      // Download PDF immediately
      const linkSource = `data:application/pdf;base64,${data.pdf_base64}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = `NIN_${selectedSlip.name.replace(/\s+/g, '_')}.pdf`;
      downloadLink.click();

      setSelectedSlip(null);
    } catch (err: any) {
      setError(err.message);
      setSelectedSlip(null);
    } finally {
      setGeneratingSlip(false);
    }
  };

  const activeVerifyService = services?.verifications?.find((s: any) => 
    s.code === (searchMode === 'NIN' ? 'NIN_VERIFICATION' : 'NIN_SEARCH_BY_PHONE')
  );

  return (
    <>
      {/* FLOATING ERROR TOAST */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-bottom-10 fade-in">
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-2xl">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="font-semibold text-sm flex-1">{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* SLIP CONFIRMATION MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirm Slip Generation</h3>
              <button onClick={() => setSelectedSlip(null)} disabled={generatingSlip} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                <img 
                  src={`/nin_${selectedSlip.name.split('(')[1]?.replace(')', '').toLowerCase()}_example.png`} 
                  alt="Slip Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-400">
                  <ImageIcon size={32} />
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center shadow-sm">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{selectedSlip.name}</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">₦{selectedSlip.price}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 flex gap-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setSelectedSlip(null)}
                disabled={generatingSlip}
                className="flex-1 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSlip}
                disabled={generatingSlip}
                className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                {generatingSlip ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            NIN Verification & Slips
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Verify identity details instantly and optionally generate an official formatted slip.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: SEARCH */}
            {!verificationResult && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 max-w-md border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => { setSearchMode('NIN'); setSearchValue(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${searchMode === 'NIN' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <Fingerprint size={18} /> By NIN
                  </button>
                  <button
                    onClick={() => { setSearchMode('PHONE'); setSearchValue(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${searchMode === 'PHONE' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <Phone size={18} /> By Phone
                  </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {searchMode === 'NIN' ? 'Target NIN Number' : 'Target Phone Number'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {searchMode === 'NIN' ? <Fingerprint className="h-5 w-5 text-slate-400" /> : <Phone className="h-5 w-5 text-slate-400" />}
                      </div>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={15}
                        value={searchValue} 
                        onChange={handleInputChange} 
                        required
                        placeholder={searchMode === 'NIN' ? "Enter 11-digit NIN" : "Enter Phone Number"}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {activeVerifyService && (
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm animate-in fade-in">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Verification Fee</span>
                      <span className="text-xl font-black text-blue-700 dark:text-blue-400">₦{activeVerifyService.price}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !activeVerifyService?.isActive || (searchMode === 'NIN' && searchValue.length !== 11)} 
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 flex justify-center items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Identity...</> : 'Verify Identity'}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: REVEAL DATA & UPSell SLIPS */}
            {verificationResult && (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                
                {/* Raw Data Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                  <div className="shrink-0 flex flex-col items-center">
                     <div className="w-32 h-40 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                       {verificationResult.photo ? (
                         <img 
                           src={verificationResult.photo.startsWith('data:') ? verificationResult.photo : `data:image/jpeg;base64,${verificationResult.photo}`} 
                           className="w-full h-full object-cover" 
                           alt="NIN Photo"
                         />
                       ) : <User size={48} className="text-slate-300 dark:text-slate-600" />}
                     </div>
                     <span className="mt-4 text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full flex items-center gap-1.5 shadow-sm">
                       <CheckCircle2 size={14} strokeWidth={3}/> Verified Data
                     </span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <DetailBox label="First Name" value={verificationResult.firstname} />
                     <DetailBox label="Surname" value={verificationResult.surname} />
                     <DetailBox label="Middle Name" value={verificationResult.middlename} />
                     <DetailBox label="Gender" value={verificationResult.gender} />
                     
                     <div className="col-span-1 sm:col-span-2 border-t border-dashed border-slate-200 dark:border-slate-800 my-1"></div>
                     
                     <DetailBox label="Date of Birth" value={verificationResult.birthdate} icon={Calendar} />
                     <DetailBox label="Phone" value={verificationResult.telephoneno} icon={Phone} />
                     <DetailBox label="Address" value={verificationResult.residence_AdressLine1} icon={MapPin} />
                     <DetailBox label="NIN" value={verificationResult.nin} />
                  </div>
                </div>

                {/* Upsell: Slip Options */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ImageIcon size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Generate Official Slip</h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">Download a beautifully formatted, printable PDF document of this record.</p>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {services?.slips?.filter((s: any) => s.isActive).map((slip: any) => (
                       <button 
                         key={slip.code}
                         onClick={() => setSelectedSlip(slip)}
                         className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1"
                       >
                         <span className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{slip.name}</span>
                         <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-auto pt-4">₦{slip.price}</span>
                       </button>
                     ))}
                   </div>
                   
                   <div className="mt-8">
                     <button 
                       onClick={() => setVerificationResult(null)} 
                       className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline underline-offset-4 transition-colors"
                     >
                       Cancel & Verify Another
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            
            {/* Verification History Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verification Logs</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Review your previously verified NIN identity records directly from your secure log.
                </p>
                
                <Link 
                  href="/dashboard/history/nin-verification"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-blue-200 dark:group-hover:border-blue-800 shadow-sm"
                >
                  View Verifications <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

function DetailBox({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white block truncate text-sm">
        {value || 'N/A'}
      </span>
    </div>
  );
}
