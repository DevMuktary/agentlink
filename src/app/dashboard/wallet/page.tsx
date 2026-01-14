'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Search, 
  CreditCard, RefreshCw, Copy, CheckCircle2 
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
      setUser(uRes.data);
      setTransactions(tRes.data);
      setFiltered(tRes.data);
    } catch (error) {
      console.error("Failed to load wallet data");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" /> Wallet & Finance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your funds and view transaction history.</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-32 h-32" /></div>
            
            <p className="text-blue-200 font-medium text-sm tracking-wider uppercase mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-6">₦{Number(user?.walletBalance).toLocaleString()}</h2>
            
            <div className="flex gap-3">
                <button className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition shadow-lg">
                    <ArrowUpRight className="w-4 h-4" /> Fund Wallet
                </button>
                <div className="text-xs text-blue-300 max-w-[200px] leading-tight flex items-center">
                    (Automatic Bank Transfer details will appear here soon)
                </div>
            </div>
        </div>

        {/* Account Details (Static for now, can be dynamic later) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Funding Account</h3>
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                <p className="text-gray-500 text-sm mb-2">Dedicated Virtual Account</p>
                <p className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200 tracking-wider">COMING SOON</p>
                <p className="text-xs text-gray-400 mt-1">Monnify / Paystack integration pending</p>
            </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" /> Recent Transactions
            </h3>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search reference..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
            </div>
        </div>

        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4 text-gray-500">
                            {new Date(t.createdAt).toLocaleDateString()} <span className="text-xs">{new Date(t.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">{t.reference}</td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{t.description || 'System Transaction'}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                t.type === 'DEPOSIT' || t.type === 'REFUND' || t.type === 'BONUS'
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                                {t.type}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-mono font-bold ${
                             t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-green-600' : 'text-gray-800 dark:text-gray-300'
                        }`}>
                            {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No transactions found.</td></tr>
                )}
            </tbody>
        </table>
      </div>

    </div>
  );
}
