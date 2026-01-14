'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CreditCard, Search, ArrowUpCircle, ArrowDownCircle, 
  RotateCcw, RefreshCw, Filter, Download
} from 'lucide-react';

export default function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ data: [], stats: {} });
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/transactions');
      setData(res.data);
      setFiltered(res.data.data);
    } catch (e) {
      console.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  useEffect(() => {
    let res = data.data;
    
    if (typeFilter !== 'ALL') {
        res = res.filter((t: any) => t.type === typeFilter);
    }

    if (search) {
        const q = search.toLowerCase();
        res = res.filter((t: any) => 
            t.reference.toLowerCase().includes(q) ||
            t.user.email.toLowerCase().includes(q) ||
            t.user.businessName?.toLowerCase().includes(q)
        );
    }
    setFiltered(res);
  }, [search, typeFilter, data]);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-blue-600" /> Transaction Oversight
        </h1>
        <button onClick={fetchTransactions} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-green-600 text-xs font-bold uppercase">Total Deposits</p>
                <h3 className="text-2xl font-bold text-green-800">₦{Number(data.stats.DEPOSIT || 0).toLocaleString()}</h3>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-green-500 opacity-50" />
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-blue-600 text-xs font-bold uppercase">Service Charges (Revenue)</p>
                <h3 className="text-2xl font-bold text-blue-800">₦{Number(data.stats.SERVICE_CHARGE || 0).toLocaleString()}</h3>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-orange-600 text-xs font-bold uppercase">Refunds Processed</p>
                <h3 className="text-2xl font-bold text-orange-800">₦{Number(data.stats.REFUND || 0).toLocaleString()}</h3>
            </div>
            <RotateCcw className="w-8 h-8 text-orange-500 opacity-50" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search Ref, Email, Business Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
         </div>
         <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
         >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="SERVICE_CHARGE">Charges</option>
            <option value="REFUND">Refunds</option>
         </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4 text-gray-500">
                            {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{t.user.firstName} {t.user.lastName}</p>
                            <p className="text-xs text-gray-500">{t.user.businessName}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{t.reference}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{t.description}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                t.type === 'DEPOSIT' ? 'bg-green-100 text-green-700' :
                                t.type === 'REFUND' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {t.type}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-mono font-bold ${
                             t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-green-600' : 'text-gray-800'
                        }`}>
                            {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}
