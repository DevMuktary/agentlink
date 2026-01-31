'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Search, 
  CreditCard, RefreshCw, Copy, CheckCircle2, History 
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
        // Assuming this endpoint exists, otherwise it returns empty array or we mock it
        axios.get('/api/user/transactions').catch(() => ({ data: { data: [] } }))
      ]);
      
      const userData = uRes.data.id ? uRes.data : uRes.data.data;
      const txData = tRes.data.data || [];

      setUser(userData);
      setTransactions(txData);
      setFiltered(txData);
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Wallet & Finance</h1>
          <p className="text-slate-500 text-sm">Manage your funds and view transaction history.</p>
        </div>
      </div>

      {/* Balance Card Section */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Main Wallet Card */}
        <div className="bg-[#0B1120] rounded-2xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                <div>
                    <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">Available Balance</p>
                    <h2 className="text-4xl font-bold tracking-tight mb-1">
                        ₦{Number(user?.walletBalance || 0).toLocaleString()}
                    </h2>
                    <p className="text-xs text-slate-500">Last updated: Just now</p>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50 active:scale-95">
                        <ArrowUpRight size={16} /> Fund Wallet
                    </button>
                </div>
            </div>
            
            {/* Decorative Background */}
            <div className="absolute right-0 top-0 h-48 w-48 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-indigo-600/30 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* Account Details (Placeholder) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Building2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Virtual Account</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                Your dedicated NUBAN account number for automatic funding is being generated.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-full border border-amber-100">
                <RefreshCw size={12} className="animate-spin" /> Coming Soon
            </span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <History className="text-slate-400" size={20} />
                <h3 className="font-bold text-lg text-slate-900">Transaction History</h3>
            </div>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by reference..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                />
            </div>
        </div>

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
                                <p>No transactions found matching your search.</p>
                            </td>
                        </tr>
                    ) : (
                        filtered.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(t.createdAt).toLocaleDateString()} <span className="text-slate-300 mx-1">|</span> <span className="text-xs">{new Date(t.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.reference}</td>
                                <td className="px-6 py-4 text-slate-900 font-medium">{t.description || 'System Transaction'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        t.type === 'DEPOSIT' || t.type === 'REFUND' || t.type === 'BONUS'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-bold ${
                                     t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                    {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
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
