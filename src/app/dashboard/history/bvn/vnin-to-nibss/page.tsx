'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, 
  Monitor, Code, ChevronLeft, ChevronRight, Landmark, Info,
  RefreshCcw, Loader2, AlertTriangle, X
} from 'lucide-react';

export default function VninToNibssHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DASHBOARD' | 'API'>('ALL');

  // Pagination & Action States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [checkingStatusId, setCheckingStatusId] = useState<string | null>(null);
  
  // Global Toast Message
  const [toastMsg, setToastMsg] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests?type=VNIN_TO_NIBSS'); 
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (error) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = requests;

    if (sourceFilter === 'DASHBOARD') {
      result = result.filter(r => (r.requestData?.clientReference || '').startsWith('DASH-'));
    } else if (sourceFilter === 'API') {
      result = result.filter(r => !(r.requestData?.clientReference || '').startsWith('DASH-'));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.nin?.includes(q) || 
        r.requestData?.bvn?.includes(q) || 
        r.requestData?.clientReference?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [sourceFilter, searchQuery, requests]);

  // Handle manual "Check Status" click
  const handleCheckStatus = async (id: string, reference: string) => {
    setCheckingStatusId(id);
    setToastMsg(null);
    try {
      const res = await axios.get(`/api/bvn/vnin-to-nibss/status?request_id=${id}`);
      const newStatus = res.data.current_status;
      const adminNote = res.data.reason || res.data.data?.message;
      const responseData = res.data.data;

      const updateList = (list: any[]) => list.map(req => 
        req.id === id ? { ...req, status: newStatus, adminNote: adminNote || req.adminNote, responseData } : req
      );
      
      setRequests(updateList);
      setFilteredRequests(updateList);

      if (newStatus === 'PROCESSING') {
        setToastMsg({ type: 'info', text: "Request is still pending NIBSS acknowledgement." });
      } else if (newStatus === 'COMPLETED') {
        setToastMsg({ type: 'success', text: "NIBSS has acknowledged receipt!" });
      } else {
        setToastMsg({ type: 'error', text: "Submission Failed or Rejected." });
      }
    } catch (error: any) {
      setToastMsg({ type: 'error', text: "Unable to check status right now." });
    } finally {
      setCheckingStatusId(null);
    }
  };

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getSourceDetails = (clientReference?: string) => {
    const isDashboard = (clientReference || '').startsWith('DASH-');
    return {
      label: isDashboard ? 'Dashboard' : 'API Route',
      icon: isDashboard ? <Monitor className="w-3.5 h-3.5 mr-1.5" /> : <Code className="w-3.5 h-3.5 mr-1.5" />,
      colorClass: isDashboard 
        ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' 
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    };
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* FLOATING NOTIFICATION TOAST */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
            toastMsg.type === 'success' ? 'bg-green-600 border-green-500 text-white' :
            toastMsg.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
            'bg-blue-600 border-blue-500 text-white'
          }`}>
            {toastMsg.type === 'info' ? <Clock size={18} /> : toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 p-1 hover:bg-black/20 rounded-lg"><X size={14}/></button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Landmark className="text-cyan-500" size={24} /> VNIN to NIBSS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Monitor submissions sent to NIBSS for synchronization.
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
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${sourceFilter === 'DASHBOARD' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'}`}
            >
              <Monitor className="w-4 h-4" /> Dashboard
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search NIN, BVN or Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Date Submitted</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Origin</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Details</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Notes & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <Landmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No NIBSS submission records found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  const isChecking = checkingStatusId === item.id;
                  
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
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900 dark:text-white font-semibold">
                          NIN: {item.requestData?.nin}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          BVN: {item.requestData?.bvn}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        -₦{Number(item.cost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === 'COMPLETED' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
                          item.status === 'FAILED' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                          'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20'
                        }`}>
                          {item.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                          {item.status === 'FAILED' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                          {item.status === 'PROCESSING' && <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[220px] text-xs text-slate-500 dark:text-slate-400">
                        {item.status === 'PROCESSING' ? (
                          <button 
                            onClick={() => handleCheckStatus(item.id, item.requestData?.clientReference)}
                            disabled={isChecking}
                            className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 disabled:opacity-50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                          >
                            {isChecking ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />}
                            Check Status
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5" title={item.adminNote || 'Processed'}>
                            <Info size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{item.adminNote || 'Acknowledged by NIBSS'}</span>
                          </div>
                        )}
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
