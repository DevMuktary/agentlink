'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  ArrowUpRight, ArrowDownLeft, Search, Filter, 
  CreditCard, RefreshCw, Download, FileText 
} from 'lucide-react';

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, CREDIT, DEBIT

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = transactions;

    // 1. Search Filter (Ref or Email)
    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(t => 
            t.reference?.toLowerCase().includes(lowerSearch) || 
            t.user?.email?.toLowerCase().includes(lowerSearch)
        );
    }

    // 2. Type Filter
    if (typeFilter !== 'ALL') {
        if (typeFilter === 'CREDIT') {
            result = result.filter(t => ['CREDIT', 'DEPOSIT', 'REFUND', 'BONUS'].includes(t.type));
        } else {
            result = result.filter(t => ['DEBIT', 'PAYMENT', 'CHARGE', 'MANUAL_DEBIT', 'SERVICE_CHARGE'].includes(t.type));
        }
    }

    setFilteredDocs(result);
  }, [search, typeFilter, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/transactions');
      // Handle response structure wrapper
      const data = res.data.status ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setTransactions(data);
      setFilteredDocs(data);
    } catch (error) {
        console.error("Failed to load transactions", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="text-blue-600 dark:text-blue-400" /> Transaction History
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                Monitor all financial activities, deposits, and service charges.
            </p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchTransactions} className="p-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition">
                <RefreshCw size={18} className="text-slate-600 dark:text-gray-300" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition">
                <Download size={16} /> Export CSV
            </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
        
        {/* Search */}
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search Reference or User Email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 text-sm rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="ALL">All Transactions</option>
                <option value="CREDIT">Credits (In)</option>
                <option value="DEBIT">Debits (Out)</option>
            </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-medium">Reference</th>
                        <th className="px-6 py-4 font-medium">User / Agent</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Description</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {filteredDocs.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-gray-400 flex flex-col items-center justify-center">
                                <FileText size={48} className="text-slate-200 dark:text-gray-700 mb-2" />
                                <p>No transactions found matching your criteria.</p>
                            </td>
                        </tr>
                    ) : (
                        filteredDocs.map((tx) => {
                            // Determine Direction
                            const isCredit = ['CREDIT', 'DEPOSIT', 'REFUND', 'BONUS'].includes(tx.type);
                            
                            return (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    {/* Reference */}
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-gray-400 text-xs">
                                        {tx.reference || 'N/A'}
                                    </td>

                                    {/* User */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 dark:text-gray-200 text-xs">
                                                {tx.user?.firstName} {tx.user?.lastName}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {tx.user?.email}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Type Badge */}
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase border ${
                                            isCredit 
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                        }`}>
                                            {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                            {tx.type}
                                        </div>
                                    </td>

                                    {/* Description */}
                                    <td className="px-6 py-4 text-slate-600 dark:text-gray-400 max-w-[200px] truncate" title={tx.description}>
                                        {tx.description || '-'}
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-slate-500 dark:text-gray-500 text-xs">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>

                                    {/* Amount */}
                                    <td className={`px-6 py-4 text-right font-bold font-mono tracking-tight ${
                                        isCredit ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'
                                    }`}>
                                        {isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-xs text-slate-500 dark:text-gray-400 flex justify-between items-center">
            <span>Showing recent {filteredDocs.length} transactions</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-600">Real-time Data</span>
        </div>
      </div>
    </div>
  );
}
