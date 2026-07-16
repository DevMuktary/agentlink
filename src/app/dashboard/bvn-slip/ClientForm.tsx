'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, Info,
  X, Download
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number;
};

export default function BvnSlipClient({ service }: { service: ServiceData | null }) {
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success states
  const [successData, setSuccessData] = useState<any>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(true);

  // Auto-hide error banner after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isServiceDown = !service || !service.isActive;

  const handleBvnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all non-numeric characters and cap at 11 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setBvn(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    setPdfData(null);
    
    if (bvn.length !== 11) {
      setError('Please enter exactly 11 digits for the BVN.');
      return;
    }

    setLoading(true);

    const customReference = `DASH-BVN-${Date.now()}`;

    try {
      // Adjust this URL if your API route is located differently
      const res = await fetch('/api/bvn/premium-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bvn: bvn,
          reference: customReference
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Failed to generate BVN slip.');
      }

      // Success: Save the PDF base64 and the transaction details
      setPdfData(data.data?.pdf_base64);
      setSuccessData({
        reference: customReference,
        charged_amount: service?.price || 0,
        bvn: bvn
      });
      setBvn('');
    } catch (err: any) {
      // DOUBLE PROTECTION: Intercept generic API errors
      let errorMsg = err.message;
      if (errorMsg.toLowerCase().includes('provider connection failed') || errorMsg.includes('400')) {
        errorMsg = "No record found, please verify the BVN.";
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
    const fileName = `BVN_Premium_Slip_${successData?.bvn || 'Generated'}.pdf`;
    
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
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
            >
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
              <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Important Notice
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>
                  You are about to generate an official BVN Premium Slip for the provided Bank Verification Number.
                </p>
                <p className="text-sky-700 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-500/10 p-3 rounded-xl border border-sky-100 dark:border-sky-500/20">
                  Your wallet will only be charged if the slip is successfully generated by the database.
                </p>
                <p>
                  Once generated, click the download button immediately to save your PDF slip to your device. You can also re-download it from your history.
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
            <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
              <FileText size={26} strokeWidth={2.5} />
            </div>
            BVN Premium Slip
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Generate and download official BVN premium slips instantly.
          </p>
        </div>

        {isServiceDown && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Service Currently Unavailable</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1 font-medium">
                BVN Slip generation is currently undergoing scheduled maintenance. Please check back later.
              </p>
            </div>
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Slip Generated Successfully!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm font-medium">
                    Your official BVN Premium Slip has been processed and is ready for download.
                  </p>
                  
                  {/* BIG DOWNLOAD BUTTON */}
                  <button 
                    onClick={handleDownloadPDF}
                    className="mx-auto mb-8 py-4 px-8 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <Download size={20} strokeWidth={2.5} /> Download PDF Slip
                  </button>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reference:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{successData.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Target BVN:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{successData.bvn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Charged:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(successData.charged_amount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button 
                      onClick={() => { setSuccessData(null); setPdfData(null); }}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Target BVN Number
                      </label>
                      <input 
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={11}
                        required
                        value={bvn}
                        onChange={handleBvnChange}
                        placeholder="Enter the 11-digit BVN"
                        disabled={isServiceDown || loading}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-mono"
                      />
                      <div className="mt-2 flex justify-end">
                        <span className={`text-xs font-semibold ${bvn.length === 11 ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          {bvn.length}/11 digits
                        </span>
                      </div>
                    </div>
                  </div>

                  {service && (
                    <div className="p-4 bg-sky-50/50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-900/30 rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Generation Charge</span>
                      <span className="text-xl font-extrabold text-sky-700 dark:text-sky-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isServiceDown || loading || bvn.length !== 11}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating Slip...</>
                    ) : (
                      'Generate Premium Slip'
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
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <FileText size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Your History</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Monitor your previously generated slips securely from your history log. You can re-download PDFs here at any time.
                </p>
                
                <Link 
                  href="/dashboard/history/bvn-slips"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-sky-200 dark:group-hover:border-sky-800 shadow-sm"
                >
                  Go to Slip History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-sky-100 dark:bg-sky-500/20 rounded-md text-sky-600 dark:text-sky-400">
                  <Info size={14} />
                </div>
                Important Guidelines
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 mt-1.5 shrink-0" />
                  Ensure the 11-digit BVN format is completely correct before submitting.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 mt-1.5 shrink-0" />
                  If the provider fails to generate the slip due to a database error, your wallet will be instantly refunded.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 mt-1.5 shrink-0" />
                  Please download the PDF immediately upon successful generation.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
