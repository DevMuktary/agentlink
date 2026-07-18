'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  ArrowUpRight, ArrowDownLeft, Search, Filter, 
  CreditCard, RefreshCw, Download, FileText, Globe, Code
} from 'lucide-react';

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [channelFilter, setChannelFilter] = useState('ALL'); // ALL, WEB, API

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Helper to determine channel based on reference prefix
  const getChannel = (reference: string) => {
    if (!reference) return 'WEB'; // Fallback
    // If it contains DASH or is a Fund Wallet (FW-) transaction, it's from the Dashboard
    if (reference.includes('DASH') || reference.startsWith('FW-')) {
        return 'WEB';
    }
    return 'API';
  };

  // Filter Logic
  useEffect(() => {
    let result = transactions;

    // 1. Search Filter (Ref or Email)
    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(t => 
            t.reference?.toLowerCase().includes(lowerSearch) || 
            t.user?.email?.toLowerCase().includes(lowerSearch) ||
            t.user?.firstName?.toLowerCase().includes(lowerSearch)
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

    // 3. Channel Filter (Inferred from Reference)
    if (channelFilter !== 'ALL') {
        result = result.filter(t => getChannel(t.reference) === channelFilter);
    }

    setFilteredDocs(result);
  }, [search, typeFilter, channelFilter, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/transactions');
      const data = res.data.status ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setTransactions(data);
      setFilteredDocs(data);
    } catch (error) {
        console.error("Failed to load transactions", error);
    } finally {
        setLoading(false);
    }
  };

  // --- EXPORT CSV LOGIC ---
  const handleExportCSV = () => {
    if (filteredDocs.length === 0) {
        alert('No data available to export based on current filters.');
        return;
    }

    // Define Headers
    const headers = ['Reference', 'First Name', 'Last Name', 'Email', 'Type', 'Amount (NGN)', 'Channel', 'Description', 'Date'];

    // Map Data
    const csvRows = filteredDocs.map(tx => {
        const isCredit = ['CREDIT', 'DEPOSIT', 'REFUND', 'BONUS'].includes(tx.type);
        const sign = isCredit ? '+' : '-';
        const txChannel = getChannel(tx.reference);
        
        // Escape quotes in description to prevent CSV breaking
        const safeDesc = tx.description ? `"${tx.description.replace(/"/g, '""')}"` : 'N/A';
        
        return [
            tx.reference || 'N/A',
            tx.user?.firstName || 'N/A',
            tx.user?.lastName || 'N/A',
            tx.user?.email || 'N/A',
            tx.type,
            `${sign}${tx.amount}`,
            txChannel,
            safeDesc,
            new Date(tx.createdAt).toLocaleString()
        ].join(',');
    });

    // Combine Headers and Rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="text-blue-600 dark:text-blue-400" /> Transaction History
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                Monitor all financial activities, deposits, and service charges.
            </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={fetchTransactions} 
                title="Refresh Data"
                className="p-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition shadow-sm"
            >
                <RefreshCw size={18} className="text-slate-600 dark:text-gray-300" />
            </button>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/20 active:scale-95"
            >
                <Download size={16} /> Export CSV
            </button>
        </div>
      </div>

      {/* FILTERS & CHANNEL TOGGLE */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
        
        {/* Channel Toggle (Dashboard vs API) */}
        <div className="flex bg-slate-100 dark:bg-gray-900 p-1 rounded-xl w-full lg:w-fit border border-slate-200 dark:border-gray-700 shrink-0">
            {['ALL', 'WEB', 'API'].map((chan) => (
                <button
                    key={chan}
                    onClick={() => setChannelFilter(chan)}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        channelFilter === chan 
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-gray-700' 
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                    }`}
                >
                    {chan === 'WEB' && <Globe size={14} />}
                    {chan === 'API' && <Code size={14} />}
                    {chan === 'ALL' ? 'All Channels' : chan === 'WEB' ? 'Dashboard' : 'API Only'}
                </button>
            ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search Reference, Name or Email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full lg:w-48 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 text-sm font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
                <option value="ALL">All Directions</option>
                <option value="CREDIT">Credits (In)</option>
                <option value="DEBIT">Debits (Out)</option>
            </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700 font-medium">
                    <tr>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">User / Agent</th>
                        <th className="px-6 py-4">Type & Channel</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {filteredDocs.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="h-16 w-16 bg-slate-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-3">
                                        <FileText size={32} className="text-slate-300 dark:text-gray-600" />
                                    </div>
                                    <p className="font-medium text-slate-600 dark:text-gray-300">No transactions found</p>
                                    <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredDocs.map((tx) => {
                            // Determine Direction & Source dynamically based on Reference
                            const isCredit = ['CREDIT', 'DEPOSIT', 'REFUND', 'BONUS'].includes(tx.type);
                            const txChannel = getChannel(tx.reference);
                            
                            return (
                                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                                    {/* Reference */}
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-gray-400 text-xs tracking-tight">
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

                                    {/* Type & Channel Badge */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                                isCredit 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' 
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                            }`}>
                                                {isCredit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                                {tx.type}
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                                                txChannel === 'API' 
                                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30' 
                                                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-700'
                                            }`}>
                                                {txChannel === 'API' ? <Code size={10} /> : <Globe size={10} />}
                                                {txChannel}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Description */}
                                    <td className="px-6 py-4">
                                        <p className="text-slate-600 dark:text-gray-300 text-xs max-w-[250px] truncate" title={tx.description}>
                                            {tx.description || '-'}
                                        </p>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-slate-500 dark:text-gray-500 text-xs">
                                        {new Date(tx.createdAt).toLocaleString(undefined, { 
                                            dateStyle: 'medium', 
                                            timeStyle: 'short' 
                                        })}
                                    </td>

                                    {/* Amount */}
                                    <td className={`px-6 py-4 text-right font-bold font-mono tracking-tight ${
                                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
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
        
        {/* Pagination / Data Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-xs text-slate-500 dark:text-gray-400 flex justify-between items-center">
            <span>Showing {filteredDocs.length} transaction(s) based on filters</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Real-time Sync
            </span>
        </div>
      </div>
    </div>
  );
}
