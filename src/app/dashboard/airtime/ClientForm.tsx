'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, History, AlertTriangle, 
  CheckCircle2, Loader2, ArrowRight, X, ChevronRight, Check
} from 'lucide-react';

type ServiceData = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  price: number; // Used as the rate (e.g., 99 = 99% of face value)
};

const NETWORKS = [
  { id: 'MTN', name: 'MTN', logo: '/mtn.png', code: 'AIRTIME_MTN' },
  { id: 'GLO', name: 'GLO', logo: '/glo.png', code: 'AIRTIME_GLO' },
  { id: 'AIRTEL', name: 'Airtel', logo: '/airtel.png', code: 'AIRTIME_AIRTEL' },
  { id: '9MOBILE', name: '9Mobile', logo: '/9mobile.png', code: 'AIRTIME_9MOBILE' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

// Helper to detect Nigerian Networks by Prefix
const detectNetwork = (phone: string) => {
  if (phone.length < 4) return null;
  const prefix = phone.substring(0, 4);
  
  if (['0803','0806','0703','0706','0813','0816','0810','0814','0903','0906','0913','0916'].includes(prefix)) return 'MTN';
  if (['0805','0807','0705','0815','0811','0905','0915'].includes(prefix)) return 'GLO';
  if (['0802','0808','0708','0812','0701','0902','0901','0907','0912','0911'].includes(prefix)) return 'AIRTEL';
  if (['0809','0818','0817','0909','0908'].includes(prefix)) return '9MOBILE';
  
  return null;
};

export default function AirtimeClient({ services }: { services: ServiceData[] }) {
  // Form State
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'INPUT' | 'CONFIRM' | 'RECEIPT'>('INPUT');
  const [receiptData, setReceiptData] = useState<any>(null);

  // Auto-hide error banner
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Network Auto-Detection Hook
  useEffect(() => {
    if (phone.length >= 4 && !selectedNetwork) {
      const detected = detectNetwork(phone);
      if (detected) setSelectedNetwork(detected);
    } else if (phone.length < 4) {
      setSelectedNetwork(null); // Reset if they clear the input
    }
  }, [phone, selectedNetwork]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(numericValue);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    setAmount(isNaN(val) ? '' : val);
  };

  const activeNetworkData = NETWORKS.find(n => n.id === selectedNetwork);
  const activeService = services.find(s => s.code === activeNetworkData?.code);
  const rate = activeService ? activeService.price : 100;
  const payableAmount = amount ? (Number(amount) * rate) / 100 : 0;

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 11) return setError('Enter a valid 11-digit phone number.');
    if (!amount || Number(amount) < 50) return setError('Minimum airtime amount is ₦50.');
    if (!selectedNetwork) return setError('Please select a network.');
    if (activeService && !activeService.isActive) return setError(`${activeNetworkData?.name} is currently down for maintenance.`);
    
    setStep('CONFIRM');
  };

  const executeTransaction = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/utilities/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          amount: Number(amount),
          network: selectedNetwork,
          serviceCode: activeService?.code
        })
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.error || 'Transaction failed.');
      }

      setReceiptData({
        reference: data.data.reference,
        phone: phone,
        amount: Number(amount),
        payable: payableAmount,
        network: activeNetworkData,
        date: new Date()
      });
      
      setStep('RECEIPT');
    } catch (err: any) {
      setError(err.message);
      setStep('INPUT'); // Kick back to input on failure
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setAmount('');
    setSelectedNetwork(null);
    setReceiptData(null);
    setStep('INPUT');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(val);
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

      {/* STEP 2: CONFIRMATION MODAL */}
      {step === 'CONFIRM' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Purchase</h2>
                <button onClick={() => setStep('INPUT')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center mb-6">
                <img src={activeNetworkData?.logo} alt="Network" className="w-16 h-16 object-cover rounded-full shadow-sm mb-3" />
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{phone}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{activeNetworkData?.name} Airtime</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-3 mb-6 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Airtime Amount</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(Number(amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Discount Rate</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{(100 - rate).toFixed(1)}% OFF</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount to Pay</span>
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500">{formatCurrency(payableAmount)}</span>
                </div>
              </div>

              <button 
                onClick={executeTransaction}
                disabled={loading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Pay ${formatCurrency(payableAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE WRAPPER */}
      <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <Smartphone size={26} strokeWidth={2.5} />
            </div>
            Buy Airtime
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Instant airtime recharge for all networks at discounted rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2">
            
            {/* STEP 3: RECEIPT */}
            {step === 'RECEIPT' && receiptData ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center">
                
                {/* The POS Receipt Style */}
                <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden shadow-inner">
                  {/* Jagged Edge Effect */}
                  <div className="absolute top-0 left-0 w-full flex justify-between -mt-2 opacity-50">
                    {[...Array(20)].map((_, i) => <div key={i} className="w-3 h-3 bg-white dark:bg-slate-900 rounded-full" />)}
                  </div>
                  
                  <div className="flex flex-col items-center justify-center mt-4 mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                      <Check size={32} strokeWidth={3} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Transaction Successful</h2>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Network</span>
                      <span className="font-bold text-slate-900 dark:text-white">{receiptData.network?.name} Airtime</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Phone Number</span>
                      <span className="font-bold text-slate-900 dark:text-white">{receiptData.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Airtime Value</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(receiptData.amount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(receiptData.payable)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Ref</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{receiptData.reference}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Date</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {receiptData.date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Jagged Edge Effect Bottom */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between -mb-2 opacity-50">
                    {[...Array(20)].map((_, i) => <div key={i} className="w-3 h-3 bg-white dark:bg-slate-900 rounded-full" />)}
                  </div>
                </div>

                <div className="mt-8 flex gap-4 w-full max-w-sm">
                  <button 
                    onClick={handleReset}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    Recharge Another
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 1: FORM INPUT */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleProceed} className="space-y-8">
                  
                  {/* NETWORK SELECTOR */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Select Network
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {NETWORKS.map(net => {
                        const isSelected = selectedNetwork === net.id;
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setSelectedNetwork(net.id)}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                              isSelected 
                                ? 'bg-amber-50 border-amber-500 shadow-sm dark:bg-amber-500/10 dark:border-amber-500 ring-1 ring-amber-500' 
                                : 'bg-slate-50 border-slate-200 hover:border-amber-300 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-600'
                            }`}
                          >
                            <img src={net.logo} alt={net.name} className={`w-10 h-10 object-cover rounded-full mb-2 ${!isSelected && 'opacity-60 grayscale'}`} />
                            <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                              {net.name}
                            </span>
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-0.5">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PHONE NUMBER */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={11}
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="08012345678"
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm font-mono tracking-wider"
                    />
                  </div>

                  {/* AMOUNT & QUICK TOGGLES */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Amount (₦)
                    </label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      required
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Amount to recharge"
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm"
                    />
                    
                    {/* Quick Amounts Grid */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {QUICK_AMOUNTS.map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-500/20 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-all"
                        >
                          ₦{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PROCEED BUTTON */}
                  <button 
                    type="submit" 
                    disabled={phone.length !== 11 || !amount || Number(amount) < 50 || !selectedNetwork}
                    className="w-full py-4 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-base font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    Proceed <ChevronRight size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INSTRUCTIONS & HISTORY */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
                <History size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Smartphone size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track Top-ups</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Easily view and track all your successful airtime recharges directly from your dashboard history.
                </p>
                
                <Link 
                  href="/dashboard/history/utilities/airtime"
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-xl transition-all flex items-center justify-between group-hover:border-amber-200 dark:group-hover:border-amber-800 shadow-sm"
                >
                  View History <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-1 bg-amber-100 dark:bg-amber-500/20 rounded-md text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={14} />
                </div>
                Important Note
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 shrink-0" />
                  Please verify the phone number carefully. Airtime sent to the wrong number cannot be reversed.
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 shrink-0" />
                  If you ported your phone number, manually select your new network by tapping the correct logo.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
