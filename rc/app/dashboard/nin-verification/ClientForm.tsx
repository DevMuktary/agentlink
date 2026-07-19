'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, 
  Loader2, X, Fingerprint, Phone, User, MapPin, Calendar, Image as ImageIcon
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

    // Enforce DASH- prefix
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
        request_id: data.request_id || reference // Track this to link the slip later
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate Slip from Cached JSON
  const handleGenerateSlip = async () => {
    if (!selectedSlip || !verificationResult) return;
    
    setGeneratingSlip(true);
    setError('');

    // Enforce DASH- prefix for slip generation
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
      // Optional: Show success toast here
    } catch (err: any) {
      setError(err.message);
      setSelectedSlip(null);
    } finally {
      setGeneratingSlip(false);
    }
  };

  const activeVerifyService = services.verifications.find((s: any) => 
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirm Slip Generation</h3>
              <button onClick={() => setSelectedSlip(null)} disabled={generatingSlip}><X size={20} className="text-slate-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                {/* Dynamically load the preview image based on the slip code */}
                <img 
                  src={`/nin_${selectedSlip.name.split('(')[1].replace(')', '').toLowerCase()}_example.png`} 
                  alt="Slip Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-400">
                  <ImageIcon size={32} />
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{selectedSlip.name}</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">₦{selectedSlip.price}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 flex gap-3">
              <button 
                onClick={() => setSelectedSlip(null)}
                disabled={generatingSlip}
                className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateSlip}
                disabled={generatingSlip}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {generatingSlip ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><ShieldCheck size={26} /></div>
            NIN Verification & Slips
          </h1>
          <p className="text-slate-500 mt-2">Verify identity details and generate official formatted slips.</p>
        </div>

        {/* STEP 1: SEARCH */}
        {!verificationResult && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6 max-w-md">
              <button
                onClick={() => { setSearchMode('NIN'); setSearchValue(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl ${searchMode === 'NIN' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <Fingerprint size={18} /> By NIN
              </button>
              <button
                onClick={() => { setSearchMode('PHONE'); setSearchValue(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl ${searchMode === 'PHONE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <Phone size={18} /> By Phone
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {searchMode === 'NIN' ? 'NIN Number' : 'Phone Number'}
                </label>
                <input 
                  type="text" value={searchValue} onChange={handleInputChange} required
                  placeholder={searchMode === 'NIN' ? "Enter 11-digit NIN" : "Enter Phone Number"}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              {activeVerifyService && (
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Verification Fee</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">₦{activeVerifyService.price}</span>
                </div>
              )}

              <button type="submit" disabled={loading || !activeVerifyService?.isActive} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Identity'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: REVEAL DATA & UPSell SLIPS */}
        {verificationResult && (
          <div className="space-y-6 animate-in fade-in">
            {/* Raw Data Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8">
              <div className="shrink-0 flex flex-col items-center">
                 <div className="w-32 h-40 bg-slate-100 border-2 border-slate-200 rounded-xl overflow-hidden">
                   {verificationResult.photo ? (
                     <img src={verificationResult.photo.startsWith('data:') ? verificationResult.photo : `data:image/jpeg;base64,${verificationResult.photo}`} className="w-full h-full object-cover" />
                   ) : <User size={48} className="m-auto h-full text-slate-300" />}
                 </div>
                 <span className="mt-3 text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full flex gap-1"><CheckCircle2 size={14}/> Verified</span>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <DetailBox label="First Name" value={verificationResult.firstname} />
                 <DetailBox label="Surname" value={verificationResult.surname} />
                 <DetailBox label="Middle Name" value={verificationResult.middlename} />
                 <DetailBox label="Gender" value={verificationResult.gender} />
                 <div className="col-span-1 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 my-2"></div>
                 <DetailBox label="Date of Birth" value={verificationResult.birthdate} icon={Calendar} />
                 <DetailBox label="Phone" value={verificationResult.telephoneno} icon={Phone} />
                 <DetailBox label="Address" value={verificationResult.residence_AdressLine1} icon={MapPin} />
                 <DetailBox label="NIN" value={verificationResult.nin} />
              </div>
            </div>

            {/* Upsell: Slip Options */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Generate Official Slip</h3>
               <p className="text-slate-500 mb-6 text-sm">Download a beautifully formatted, printable PDF of this record.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {services.slips.filter((s: any) => s.isActive).map((slip: any) => (
                   <button 
                     key={slip.code}
                     onClick={() => setSelectedSlip(slip)}
                     className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 transition-all text-left group flex flex-col"
                   >
                     <span className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{slip.name}</span>
                     <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-auto">₦{slip.price}</span>
                   </button>
                 ))}
               </div>
               
               <button onClick={() => setVerificationResult(null)} className="mt-8 text-sm font-bold text-slate-500 hover:text-slate-800 underline">
                 Cancel & Verify Another
               </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DetailBox({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white block truncate text-sm">
        {value || 'N/A'}
      </span>
    </div>
  );
}
