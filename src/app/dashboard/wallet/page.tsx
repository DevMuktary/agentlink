'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, Search, CreditCard,
  History, TrendingUp, TrendingDown, Loader2, X, AlertTriangle, CheckCircle2, Info 
} from 'lucide-react';

// Extend the Window object to include Squad's documented object
declare global {
  interface Window {
    squad: any;
    SquadPay: any; // Kept as fallback
  }
}

export default function UserWallet() {
  const [loading, setLoading] = useState(true);
  const [isSquadLoaded, setIsSquadLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Funding States
  const [fundAmount, setFundAmount] = useState<string>('');
  const [fundingLoading, setFundingLoading] = useState(false);
  const [errorToast, setErrorToast] = useState('');
  const [successModal, setSuccessModal] = useState(false);

  // Stats
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);

  const fetchData = async () => {
    try {
      // Added cache-busting timestamps to both endpoints
      const timestamp = Date.now();
      const [uRes, tRes] = await Promise.all([
        axios.get(`/api/user/me?t=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }), 
        axios.get(`/api/user/transactions?t=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
      ]);
      
      const userData = uRes.data.id ? uRes.data : uRes.data.data;
      const txData = tRes.data.data || tRes.data || [];

      setUser(userData);
      setTransactions(txData);
      setFiltered(txData);

      const spent = txData
        .filter((t: any) => t.type === 'SERVICE_CHARGE' && t.status === 'COMPLETED')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      
      const refunds = txData
        .filter((t: any) => t.type === 'REFUND')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      setTotalSpent(spent);
      setTotalRefunds(refunds);

    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(transactions.filter(t => 
      t.reference.toLowerCase().includes(q) || 
      t.description?.toLowerCase().includes(q)
    ));
  }, [search, transactions]);

  // Handle Amount Input Formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    setFundAmount(numericValue);
  };

  // --- SQUAD CHECKOUT LOGIC ---
  const handleFundWallet = () => {
    if (!fundAmount || Number(fundAmount) < 100) {
      setErrorToast('Minimum funding amount is ₦100');
      return;
    }

    // Reference the correct Squad object based on their docs
    const SquadCheckout = window.squad || window.SquadPay;

    if (typeof window === 'undefined' || !SquadCheckout) {
      setErrorToast('Payment gateway is loading. Please check your internet connection or disable adblockers.');
      return;
    }

    const amountInKobo = Number(fundAmount) * 100;
    
    // Squad requires a unique reference for every attempt
    const transactionRef = `FW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const publicKey = process.env.NEXT_PUBLIC_SQUAD_PUBLIC_KEY;

    // Safety check so you know immediately if it's still grabbing the secret key
    if (publicKey && publicKey.includes('_sk_')) {
      setErrorToast('Configuration Error: Still using a Secret Key. Please redeploy your app on Railway.');
      return;
    }

    const squadInstance = new SquadCheckout({
      onClose: () => {
        setFundingLoading(false);
      },
      onLoad: () => {
        setFundingLoading(true);
      },
      onSuccess: async (response: any) => {
        // Verification Call to our Backend
        try {
          const verifyRes = await axios.post('/api/wallet/fund', {
            reference: response.transaction_ref || transactionRef
          });

          if (verifyRes.data.status) {
            setSuccessModal(true);
            setFundAmount('');
            fetchData(); // Refresh balances and history
          } else {
            setErrorToast(verifyRes.data.error || 'Verification failed. Please contact support.');
          }
        } catch (err: any) {
          setErrorToast(err.response?.data?.error || 'Verification failed. Please contact support.');
        } finally {
          setFundingLoading(false);
        }
      },
      key: publicKey,
      email: user.email,
      amount: amountInKobo,
      currency_code: "NGN",
      transaction_ref: transactionRef,
      customer_name: `${user.firstName} ${user.lastName}`,
    });

    squadInstance.setup();
    squadInstance.open();
  };

  return (
    <>
      {/* Appended a version string to bypass aggressive browser caching */}
      <Script 
        src="https://checkout.squadco.com/widget/squad.min.js?v=2.0" 
        strategy="afterInteractive" 
        onLoad={() => setIsSquadLoaded(true)}
      />

      {loading ? (
        <GlobalLoader />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative max-w-7xl mx-auto">
          
          {/* FLOATING ERROR TOAST */}
          {errorToast && (
            <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-in slide-in-from-bottom-5">
              <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl shadow-xl border border-red-500 text-sm font-semibold">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{errorToast}</span>
                <button onClick={() => setErrorToast('')} className="ml-auto p-1 hover:bg-red-700 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 1. HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-8 h-8 text-blue-600" /> Wallet & Finance
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm">Manage your funds and view transaction history.</p>
            </div>
          </div>

          {/* IMPORTANT POLICY NOTICE */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Important Notice:</span> Money funded to your wallet cannot be withdrawn; it can only be used for services on this platform. If your payment is not approved or you experience issues, please send an email to <a href="mailto:agenthub.ng@gmail.com" className="font-bold underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-200 transition-colors">agenthub.ng@gmail.com</a>.
            </div>
          </div>

          {/* 2. FINANCIAL OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Balance Card & Funding Input */}
            <div className="bg-[#0B1120] rounded-3xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group flex flex-col justify-between">
                <div className="relative z-10 mb-6">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Available Balance</p>
                    <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">₦{Number(user?.walletBalance).toLocaleString()}</h2>
                </div>

                {/* FUNDING INPUT SECTION */}
                <div className="relative z-10 mt-auto pt-5 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fund Wallet</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="\d*"
                            value={fundAmount}
                            onChange={handleAmountChange}
                            placeholder="Amount (Min. 100)"
                            disabled={fundingLoading}
                            className="w-full pl-8 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-[16px] md:text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors text-white"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">Minimum funding amount is ₦100</p>
                      </div>
                      <button 
                        onClick={handleFundWallet}
                        disabled={fundingLoading || !fundAmount || Number(fundAmount) < 100 || !isSquadLoaded}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 h-[46px] rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[120px]"
                      >
                        {fundingLoading || !isSquadLoaded ? <Loader2 size={18} className="animate-spin" /> : 'Pay Now'}
                      </button>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute right-0 top-0 h-48 w-48 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-red-200 dark:hover:border-red-900/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">Total Spent</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₦{totalSpent.toLocaleString()}</h3>
                    </div>
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
                        <TrendingDown size={20} />
                    </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 font-medium">Lifetime usage on services</div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">Total Refunds</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₦{totalRefunds.toLocaleString()}</h3>
                    </div>
                    <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 font-medium">Reversed failed transactions</div>
            </div>
          </div>

          {/* 3. TRANSACTION HISTORY */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-gray-900/30">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-slate-500" /> Transaction History
                </h3>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search reference or description..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full border border-slate-200 dark:border-gray-700 rounded-xl text-[16px] md:text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700 font-medium">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <History className="w-6 h-6 text-slate-300 dark:text-gray-600" />
                                        </div>
                                        <p>No transactions found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-gray-400">{t.reference}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{t.description || 'System Transaction'}</td>
                                    <td className="px-6 py-4"><Badge type={t.type} /></td>
                                    <td className={`px-6 py-4 font-mono font-bold ${
                                        ['DEPOSIT', 'REFUND', 'BONUS'].includes(t.type) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                        {['DEPOSIT', 'REFUND', 'BONUS'].includes(t.type) ? '+' : '-'}
                                        ₦{Number(t.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 text-xs">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* SUCCESS MODAL */}
          {successModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-in zoom-in-95">
                    <button onClick={() => setSuccessModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Funding Successful!</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Your wallet has been credited successfully. You can now use your balance to purchase services.
                    </p>
                    <button 
                        onClick={() => setSuccessModal(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
                    >
                        Continue
                    </button>
                </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

// --- BADGE COMPONENT ---
function Badge({ type }: { type: string }) {
    const styles: any = {
        SERVICE_CHARGE: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        DEPOSIT: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        REFUND: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        BONUS: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        WITHDRAWAL: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        MANUAL_DEBIT: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    const label = type.replace(/_/g, ' ');
    const style = styles[type] || 'bg-gray-100 text-gray-600 border-gray-200';
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}`}>
            {label}
        </span>
    );
}
