'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Search, 
  CreditCard, RefreshCw, Copy, CheckCircle2, History, Banknote
} from 'lucide-react';

export default function UserWallet() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        axios.get('/api/user/me'),
        axios.get('/api/user/transactions')
      ]);
      setUser(uRes.data.id ? uRes.data : uRes.data.data);
      setTransactions(tRes.data.data || []);
      setFiltered(tRes.data.data || []);
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(transactions.filter(t => 
      t.reference.toLowerCase().includes(q) || 
      t.description?.toLowerCase().includes(q)
    ));
  }, [search, transactions]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Wallet & Finance</h1>
        <p className="text-slate-500 mt-1">Manage your funds and view transaction history.</p>
      </div>

      {/* 2. WALLET CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main Balance Card (Dark) */}
        <div className="bg-[#0B1120] rounded-2xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                    <Wallet size={16} /> Available Balance
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
                    ₦{Number(user?.walletBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </h2>
                
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50 active:scale-95">
                        <ArrowUpRight size={16} /> Fund Wallet
                    </button>
                </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wallet className="w-32 h-32" />
            </div>
            <div className="absolute bottom-0 right-0 h-32 w-32 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        </div>

        {/* Funding Details Card (Light) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                    <Banknote size={20} className="text-slate-400" /> Virtual Account
                </h3>
                
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
                    <p className="text-slate-500 text-sm font-medium mb-2">Dedicated Funding Account</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 tracking-widest">COMING SOON</p>
                    <p className="text-xs text-slate-400 mt-2">Monnify / Paystack integration pending</p>
                </div>
            </div>
        </div>

      </div>

      {/* 3. TRANSACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <History size={20} className="text-slate-400" /> Transaction History
            </h3>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search reference or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                />
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                        <History size={24} className="opacity-40" />
                                    </div>
                                    <p>No transactions found matching your search.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filtered.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(t.createdAt).toLocaleDateString()} 
                                    <span className="text-slate-300 mx-2">|</span> 
                                    <span className="text-xs">{new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                                    {t.reference}
                                </td>
                                <td className="px-6 py-4 text-slate-900 font-medium">
                                    {t.description || 'System Transaction'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                        ['DEPOSIT', 'REFUND', 'BONUS'].includes(t.type)
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                        : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-bold text-base ${
                                     ['DEPOSIT', 'REFUND', 'BONUS'].includes(t.type) ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                    {['DEPOSIT', 'REFUND', 'BONUS'].includes(t.type) ? '+' : '-'}
                                    ₦{Number(t.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

      </div>

    </div>
  );
}
