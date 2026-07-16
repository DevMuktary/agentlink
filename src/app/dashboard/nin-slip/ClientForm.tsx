'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X, Download, Fingerprint, Phone
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function NinSlipClient({ services }: { services: ServiceData[] }) {
  // Mode Selection
  const [searchMode, setSearchMode] = useState<'NIN' | 'PHONE'>('NIN');
  const [searchValue, setSearchValue] = useState('');
  const [slipType, setSlipType] = useState<'PREMIUM' | 'STANDARD' | 'REGULAR' | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success states
  const [successData, setSuccessData] = useState<any>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Determine which database service is currently active based on selections
  const activeServiceCode = searchMode === 'NIN' 
    ? `NIN_SLIP_V2_${slipType}` 
    : `NIN_SLIP_V2_PHONE_${slipType}`;
    
  const activeService = services.find(s => s.code === activeServiceCode);
  const isCategoryDown = slipType !== '' && (!activeService || !activeService.isActive);

  // Clear value when switching modes
  const handleModeSwitch = (mode: 'NIN' | 'PHONE') => {
    setSearchMode(mode);
    setSearchValue('');
    setSlipType('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 15);
    setSearchValue(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    setPdfData(null);
    
    if (searchMode === 'NIN' && searchValue.length !== 11) {
      return setError('Please enter exactly 11 digits for the NIN.');
    }
    if (searchMode === 'PHONE' && searchValue.length < 11) {
      return setError('Please enter a valid Phone Number.');
    }
    if (!slipType) return setError('Please select a slip format.');

    setLoading(true);

    const customReference = `DASH-SLIP-${Date.now()}`;
    const endpoint = searchMode === 'NIN' ? '/api/identity/nin/slip-v2' : '/api/identity/nin/slip-v2-phone';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin: searchValue, // Backend uses 'nin' as the key for both endpoints
          slip_type: slipType,
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to generate NIN slip.');
      }

      setPdfData(data.data?.pdf_base64);
      setSuccessData({
        reference: customReference,
        charged_amount: activeService?.price || 0,
        target: searchValue,
        mode: searchMode,
        slipName: `NIN Slip (${slipType})`
      });
      
      setSearchValue('');
      setSlipType('');
    } catch (err: any) {
      let errorMsg = err.message;
      if (errorMsg.toLowerCase().includes('provider connection failed') || errorMsg.includes('400')) {
        errorMsg = `No record found for this ${searchMode === 'NIN' ? 'NIN' : 'Phone Number'}.`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfData) return;
    const linkSource = `data:application/pdf;base64,${pdfData}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = `NIN_Slip_${successData?.target || 'Generated'}.pdf`;
    downloadLink.click();
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

      {/* IMPORTANT DISCLAIMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Important Notice
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are about to generate an official NIN Slip using our V2 system. You can generate by NIN or Phone Number.
                </p>
                <div className="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-100 dark:border-red-500/20">
                  <p className="uppercase tracking-wider text-[11px] mb-1">Instant Download Only</p>
                  <p className="text-sm">For security reasons, generated PDFs are NOT saved to your history. You MUST click the download button immediately after generation.</p>
                </div>
                <p className="text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-500/10 p-3 rounded-xl border border-teal-100 dark:border-teal-500/20">
                  Your wallet will only be charged if the slip is successfully generated by the database.
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
            <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
              <FileText size={26} strokeWidth={2.5} />
            </div>
            NIN Slip Generation V2
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Generate standard, premium, or regular NIN slips via NIN or Phone Number.
          </p>
        </div>

        {/* TOGGLE TABS */}
        {!successData && (
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl mb-8 max-w-md border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleModeSwitch('NIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                searchMode === 'NIN' ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Fingerprint size={18} /> By NIN
            </button>
            <button
              onClick={() => handleModeSwitch('PHONE')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                searchMode === 'PHONE' ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Phone size={18} /> By Phone
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {successData && pdfData ? (
                <div className="text-center py-6 animate-in zoom-in duration-300 relative z-10">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{successData.slipName} Generated!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your official slip has been processed successfully. Please download it immediately.
                  </p>
                  
                  {/* BIG DOWNLOAD BUTTON */}
                  <button 
                    onClick={handleDownloadPDF}
                    className="mx-auto mb-8 py-4 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <Download size={20} strokeWidth={2.5} /> Download PDF Slip
                  </button>

                  <div className="p-3 mb-6 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-500/20 max-w-sm mx-auto flex items-center justify-center gap-2">
                    <AlertTriangle size={16} /> Save this PDF now! It will not be in your history.
                  </div>
                  
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

                  <div className="flex justify-center">
                    <button 
                      onClick={() => { setSuccessData(null); setPdfData(null); }}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  
                  {/* SERVICE FORMAT SELECTOR */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Select Slip Format
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['PREMIUM', 'STANDARD', 'REGULAR'].map(type => {
                        const isSelected = slipType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSlipType(type as any)}
                            disabled={loading}
                            className={`relative p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-teal-50 border-teal-500 shadow-sm dark:bg-teal-500/10 dark:border-teal-500' 
                                : 'bg-slate-50 border-slate-200 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-800' : ''}`}
                          >
                            <h4 className={`font-bold text-sm leading-snug ${isSelected ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {type.charAt(0) + type.slice(1).toLowerCase()} Slip
                            </h4>
                            {isSelected && (
                              <div className="absolute top-4 right-3 text-teal-500 dark:text-teal-400 animate-in zoom-in">
                                <CheckCircle2 size={18} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Target {searchMode === 'NIN' ? 'NIN' : 'Phone'} Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {searchMode === 'NIN' ? <Fingerprint className="h-5 w-5 text-slate-400" /> : <Phone className="h-5 w-5 text-slate-400" />}
                      </div>
                      <input 
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={searchMode === 'NIN' ? 11 : 15}
                        required
                        value={searchValue}
                        onChange={handleInputChange}
                        placeholder={searchMode === 'NIN' ? "Enter 11-digit NIN" : "Enter Registered Phone Number"}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-mono"
                      />
                    </div>
                    {searchMode === 'NIN' && (
                      <div className="mt-2 flex justify-end">
                        <span className={`text-xs font-semibold ${searchValue.length === 11 ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          {searchValue.length}/11 digits
                        </span>
                      </div>
                    )}
                  </div>

                  {slipType && activeService && (
                    <div className="p-4 bg-teal-50/50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-900/30 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Generation Charge</span>
                      <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                        {formatCurrency(activeService.price)}
                      </span>
                    </div>
                  )}

                  {isCategoryDown && (
                    <div className="p-3.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-sm text-orange-700 dark:text-orange-400 font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                      <AlertTriangle size={16} />
                      This slip format is currently disabled.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isCategoryDown || loading || !slipType || (searchMode === 'NIN' ? searchValue.length !== 11 : searchValue.length < 10)}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating Slip...</>
                    ) : (
                      'Generate NIN Slip'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY LINK */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <FileText size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Transaction Logs</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  You can view your slip generation history logs, but please note that <span className="font-bold">PDFs cannot be re-downloaded</span> from there.
                </p>
                
                <Link 
                  href="/dashboard/history/nin-slips"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-teal-200 dark:group-hover:border-teal-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-teal-500 transition-all" />
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
                  Your wallet is fully refunded automatically if we fails to generate a valid slip.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 mt-1.5 shrink-0" />
                  The PDF file is NOT saved on our servers for privacy reasons. You must save it to your device instantly.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
