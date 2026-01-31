'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Search, 
  CreditCard, RefreshCw, Copy, CheckCircle2, History, TrendingUp, TrendingDown
} from 'lucide-react';

export default function UserWallet() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Derived Stats
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);

  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        axios.get('/api/user/me'),
        axios.get('/api/user/transactions')
      ]);
      
      const userData = uRes.data.id ? uRes.data : uRes.data.data;
      const txData = tRes.data.data || tRes.data || [];

      setUser(userData);
      setTransactions(txData);
      setFiltered(txData);

      // Calculate Totals
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" /> Wallet & Finance
          </h1>
          <p className="text-slate-500 text-sm">Manage your funds and view transaction history.</p>
        </div>
      </div>

      {/* 2. FINANCIAL OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Card (Dark Premium) */}
        <div className="bg-[#0B1120] rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Available Funds</p>
                    <h2 className="text-3xl font-bold text-white mb-1">₦{Number(user?.walletBalance).toLocaleString()}</h2>
                    <p className="text-xs text-slate-500">Updated just now</p>
                </div>
                <button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/30">
                    <ArrowUpRight size={18} /> Fund Wallet
                </button>
            </div>
            {/* Background Effect */}
            <div className="absolute right-0 top-0 h-32 w-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-red-200 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Spent</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₦{totalSpent.toLocaleString()}</h3>
                </div>
                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <TrendingDown size={20} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">Lifetime usage</div>
        </div>

        {/* Total Refunds Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Refunds</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₦{totalRefunds.toLocaleString()}</h3>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">Reversed transactions</div>
        </div>
      </div>

      {/* 3. TRANSACTION HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-500" /> Transaction History
            </h3>
            
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search reference or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                    <tr>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                                        <History className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p>No transactions found matching your search.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filtered.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-slate-700">{t.reference}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{t.description || 'System Transaction'}</td>
                                <td className="px-6 py-4">
                                    <Badge type={t.type} />
                                </td>
                                <td className={`px-6 py-4 font-mono font-bold ${
                                    t.type === 'DEPOSIT' || t.type === 'REFUND' || t.type === 'BONUS' 
                                    ? 'text-emerald-600' 
                                    : 'text-slate-700'
                                }`}>
                                    {t.type === 'DEPOSIT' || t.type === 'REFUND' || t.type === 'BONUS' ? '+' : '-'}
                                    ₦{Number(t.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                    {new Date(t.createdAt).toLocaleDateString()} <span className="text-slate-300">|</span> {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

// --- COMPONENTS ---

function Badge({ type }: { type: string }) {
    const styles: any = {
        SERVICE_CHARGE: 'bg-slate-100 text-slate-600 border-slate-200',
        DEPOSIT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        REFUND: 'bg-blue-100 text-blue-700 border-blue-200',
        BONUS: 'bg-purple-100 text-purple-700 border-purple-200',
        WITHDRAWAL: 'bg-orange-100 text-orange-700 border-orange-200',
    };

    const label = type.replace(/_/g, ' ');
    const style = styles[type] || 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${style}`}>
            {label}
        </span>
    );
}
