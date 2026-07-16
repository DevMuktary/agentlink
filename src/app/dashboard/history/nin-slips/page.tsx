'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, Search, Filter,
  Monitor, Code, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

export default function NinSlipHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DASHBOARD' | 'API'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // Filter for COMPLETED NIN Slip Generation requests
      const logs = res.data.filter((r: any) => 
        ['NIN_SLIP_PREMIUM', 'NIN_SLIP_STANDARD', 'NIN_SLIP_IMPROVED'].includes(r.serviceType) && 
        r.status === 'COMPLETED'
      );
      setRequests(logs);
      setFilteredRequests(logs);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = requests;

    // 1. Filter by Service Type
    if (filterType !== 'ALL') {
      result = result.filter(r => r.serviceType === filterType);
    }

    // 2. Filter by Submission Source
    if (sourceFilter === 'DASHBOARD') {
      result = result.filter(r => (r.requestData?.clientReference || '').startsWith('DASH-'));
    } else if (sourceFilter === 'API') {
      result = result.filter(r => !(r.requestData?.clientReference || '').startsWith('DASH-'));
    }

    // 3. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.nin?.includes(q) || 
        r.requestData?.clientReference?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [filterType, sourceFilter, searchQuery, requests]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getSourceDetails = (clientReference?: string) => {
    const isDashboard = (clientReference || '').startsWith('DASH-');
    return {
      label: isDashboard ? 'Dashboard' : 'API Route',
      icon: isDashboard ? <Monitor className="w-3.5 h-3.5 mr-1.5" /> : <Code className="w-3.5 h-3.5 mr-1.5" />,
      colorClass: isDashboard 
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    };
  };

  const formatServiceName = (type: string) => {
    if (type === 'NIN_SLIP_PREMIUM') return 'Premium Slip';
    if (type === 'NIN_SLIP_STANDARD') return 'Standard Slip';
    if (type === 'NIN_SLIP_IMPROVED') return 'Improved Slip';
    return type;
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="text-teal-500" size={24} /> NIN Slips
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Review your successfully generated NIN slips.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          
          {/* Source Toggle Buttons */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setSourceFilter('ALL')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${sourceFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setSourceFilter('API')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${sourceFilter === 'API' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'}`}
            >
              <Code className="w-4 h-4" /> API
            </button>
            <button 
              onClick={() => setSourceFilter('DASHBOARD')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${sourceFilter === 'DASHBOARD' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              <Monitor className="w-4 h-4" /> Dashboard
            </button>
          </div>

          {/* Type Dropdown */}
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer shadow-sm text-base sm:text-sm"
            >
              <option value="ALL">All Slip Formats</option>
              <option value="NIN_SLIP_PREMIUM">Premium Slips</option>
              <option value="NIN_SLIP_STANDARD">Standard Slips</option>
              <option value="NIN_SLIP_IMPROVED">Improved Slips</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search NIN or Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Date Generated</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Origin</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Slip Format</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Target NIN</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Amount Charged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No completed NIN slips found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(item.createdAt).toLocaleString('en-NG', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${source.colorClass}`}>
                          {source.icon}
                          {source.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {formatServiceName(item.serviceType)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900 dark:text-white font-semibold">
                          {item.requestData?.nin || '---'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider">
                          REF: {item.requestData?.clientReference || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                           -₦{Number(item.cost).toLocaleString()}
                           <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                             <CheckCircle2 className="w-3 h-3 mr-0.5" /> PAID
                           </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{startIndex + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredRequests.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredRequests.length}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center px-4 font-bold text-sm text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
