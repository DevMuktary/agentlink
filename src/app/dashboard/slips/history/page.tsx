'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileText, Search, History, CheckCircle2, XCircle, Clock
} from 'lucide-react';

export default function SlipHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [slips, setSlips] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const res = await axios.get('/api/user/slips');
        if (res.data.status) {
            setSlips(res.data.data);
            setFiltered(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load slips", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlips();
  }, []);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(slips.filter(s => {
        const dataStr = JSON.stringify(s.requestData || {}).toLowerCase();
        return (
            s.serviceType.toLowerCase().includes(q) || 
            dataStr.includes(q)
        );
    }));
  }, [search, slips]);

  // Helper to extract identifier (NIN or Phone) from requestData
  const getIdentifier = (requestData: any) => {
      if (!requestData) return 'N/A';
      if (requestData.nin) return `NIN: ${requestData.nin}`;
      if (requestData.phone) return `Phone: ${requestData.phone}`;
      return 'N/A';
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" /> Slip Generation History
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">View a log of all identity slips you have generated.</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-gray-900/30">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" /> Recent Slips
            </h3>
            
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by NIN or Phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-slate-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700 font-medium">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Slip Type</th>
                        <th className="px-6 py-4">Identifier</th>
                        <th className="px-6 py-4">Cost</th>
                        <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-slate-300 dark:text-gray-600" />
                                    </div>
                                    <p>No slip history found.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filtered.map(slip => (
                            <tr key={slip.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="px-6 py-4 text-slate-500 dark:text-gray-400 text-xs">
                                    <div className="font-medium text-slate-700 dark:text-gray-300">
                                        {new Date(slip.createdAt).toLocaleDateString()}
                                    </div>
                                    {new Date(slip.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {slip.serviceType.replace(/_/g, ' ')}
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600 dark:text-gray-300">
                                    {getIdentifier(slip.requestData)}
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                    ₦{Number(slip.cost).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <StatusBadge status={slip.status} />
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

function StatusBadge({ status }: { status: string }) {
    if (status === 'COMPLETED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                <CheckCircle2 size={12} /> {status}
            </span>
        );
    }
    if (status === 'FAILED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                <XCircle size={12} /> {status}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
            <Clock size={12} /> {status}
        </span>
    );
}
