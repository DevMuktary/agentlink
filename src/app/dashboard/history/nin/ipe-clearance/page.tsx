'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, 
  Monitor, Code, ChevronLeft, ChevronRight, ShieldCheck, Info,
  RefreshCcw, Loader2, AlertTriangle, X, Eye, Copy, Check, Layers, FileBadge
} from 'lucide-react';

export default function IpeClearanceHistoryPage() {
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
  const [viewReq, setViewReq] = useState<any>(null); // For the View Details Modal
  
  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Global Toast Message
  const [toastMsg, setToastMsg] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests?type=IPE_CLEARANCE'); 
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
        r.requestData?.trackingId?.toLowerCase().includes(q) || 
        r.requestData?.clientReference?.toLowerCase().includes(q) ||
        r.responseData?.reply?.toLowerCase().includes(q) ||
        r.responseData?.nin?.includes(q)
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
      const res = await axios.get(`/api/v1/identity/ipe-clearance/status?request_id=${id}`);
      const newStatus = res.data.current_status;
      const adminNote = res.data.reason;
      const responseData = res.data.data;

      // Update local state dynamically
      const updateList = (list: any[]) => list.map(req => 
        req.id === id ? { ...req, status: newStatus, adminNote: adminNote || req.adminNote, responseData } : req
      );
      
      setRequests(updateList);
      setFilteredRequests(updateList);

      if (newStatus === 'PROCESSING') {
        setToastMsg({ type: 'info', text: "Clearance is still processing (~24 hrs). Check back later." });
      } else if (newStatus === 'COMPLETED') {
        setToastMsg({ type: 'success', text: "IPE Clearance Completed Successfully!" });
      } else {
        setToastMsg({ type: 'error', text: "Clearance Failed. See admin note." });
      }
    } catch (error: any) {
      setToastMsg({ type: 'error', text: "Unable to check status. Try again later." });
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
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    };
  };

  const DisplayRow = ({ label, value }: { label: string, value: any }) => {
    const displayValue = String(value || 'N/A').trim();
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pr-2 whitespace-nowrap">{label}</span>
            <span className={`font-bold text-slate-900 dark:text-slate-100 text-sm text-right truncate max-w-[200px] ${displayValue !== 'N/A' ? 'uppercase' : ''}`} title={displayValue}>
                {displayValue}
            </span>
        </div>
    );
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
            <ShieldCheck className="text-emerald-500" size={24} /> IPE Clearance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Monitor the status of your clearance requests.
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
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${sourceFilter === 'API' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
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

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search IPE ID or Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm transition-all"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Tracking ID / Ref</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-300">Notes & Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No IPE Clearance records found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  const isChecking = checkingStatusId === item.id;
                  
                  // Safely extract the generated reply (Clearance ID)
                  const generatedReply = item.responseData?.reply || item.responseData?.result_text || null;
                  
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
                        <div className="font-mono text-slate-900 dark:text-white font-semibold tracking-wider">
                          {item.requestData?.trackingId || '---'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider">
                          REF: {item.requestData?.clientReference || 'N/A'}
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
                      <td className="px-6 py-4 max-w-[250px] text-xs text-slate-500 dark:text-slate-400 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {item.status === 'PROCESSING' ? (
                            <button 
                              onClick={() => handleCheckStatus(item.id, item.requestData?.clientReference)}
                              disabled={isChecking}
                              className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
                            >
                              {isChecking ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />}
                              Check Status
                            </button>
                          ) : item.status === 'COMPLETED' ? (
                             <>
                               {/* Badged Clearance ID visible directly on the row */}
                               <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1 max-w-[150px] truncate" title={generatedReply}>
                                 <ShieldCheck size={14} className="shrink-0" /> {generatedReply || 'View Result'}
                               </div>
                               {/* Eye icon to open the full modal */}
                               <button 
                                 onClick={() => setViewReq(item)}
                                 className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors shrink-0"
                                 title="View Full Record"
                               >
                                 <Eye className="h-5 w-5" />
                               </button>
                             </>
                          ) : (
                            <div className="flex items-center gap-1.5 truncate text-xs text-slate-500" title={item.adminNote || 'No details'}>
                              <Info size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{item.adminNote || 'Failed'}</span>
                            </div>
                          )}
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

      {/* --- VIEW FULL RECORD MODAL --- */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl relative my-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-t-3xl">
              <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" /> Clearance Details
                 </h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Tracking ID: {viewReq.requestData?.trackingId}</p>
              </div>
              <button onClick={() => setViewReq(null)} className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500">
                <X className="h-5 w-5"/>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* Highlighted Result Box */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30 text-center relative overflow-hidden">
                 <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest mb-2">New Tracking ID</p>
                 <div className="flex items-center justify-center gap-3">
                    <p className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest break-all">
                      {viewReq.responseData?.reply || 'N/A'}
                    </p>
                    {viewReq.responseData?.reply && (
                        <button 
                          onClick={() => copyText(viewReq.responseData?.reply, 'clearance-id')}
                          className="p-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                          title="Copy ID"
                        >
                          {copiedId === 'clearance-id' ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    )}
                 </div>
              </div>

              {/* Extended Details Table */}
              <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                 <div className="bg-slate-50 dark:bg-slate-900 p-2">
                    <DisplayRow label="Full Name" value={viewReq.responseData?.name} />
                    <DisplayRow label="NIN" value={viewReq.responseData?.nin} />
                    <DisplayRow label="Date of Birth" value={viewReq.responseData?.dob} />
                    <DisplayRow label="Clearance Status" value={viewReq.responseData?.status} />
                 </div>
              </div>

              {/* RAW DATA DUMP */}
              <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Layers size={14} /> Toggle Raw JSON Payload
                  </summary>
                  <div className="bg-slate-900 p-4 rounded-xl mt-2 overflow-hidden">
                      <pre className="text-[10px] text-emerald-400 overflow-x-auto font-mono custom-scrollbar pb-2">
                          {JSON.stringify(viewReq.responseData, null, 2)}
                      </pre>
                  </div>
              </details>

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-b-3xl flex justify-between items-center">
              <button 
                onClick={() => copyText(JSON.stringify(viewReq.responseData), 'json-dump')}
                className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                {copiedId === 'json-dump' ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} Copy Raw JSON
              </button>
              <button onClick={() => setViewReq(null)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
