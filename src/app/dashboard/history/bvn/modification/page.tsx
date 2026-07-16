'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  Monitor, Code, ChevronLeft, ChevronRight, FileEdit, Eye, Info, XCircle as XCircleIcon, ArrowRight
} from 'lucide-react';

export default function BvnModificationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
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
      const logs = res.data.filter((r: any) => 
        (r.serviceType || '').startsWith('BVN_MOD')
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

    // Filter by Service Type
    if (filterType !== 'ALL') {
      result = result.filter(r => r.serviceType === filterType);
    }

    // Filter by Source
    if (sourceFilter === 'DASHBOARD') {
      result = result.filter(r => (r.requestData?.clientReference || '').startsWith('DASH-'));
    } else if (sourceFilter === 'API') {
      result = result.filter(r => !(r.requestData?.clientReference || '').startsWith('DASH-'));
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.bvn?.includes(q) || 
        r.requestData?.nin?.includes(q) || 
        r.requestData?.clientReference?.toLowerCase().includes(q) ||
        r.requestData?.bank_name?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [filterType, sourceFilter, searchQuery, requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getSourceDetails = (clientReference?: string) => {
    const isDashboard = (clientReference || '').startsWith('DASH-');
    return {
      label: isDashboard ? 'Dashboard' : 'API Route',
      icon: isDashboard ? <Monitor className="w-3.5 h-3.5 mr-1.5" /> : <Code className="w-3.5 h-3.5 mr-1.5" />,
      colorClass: isDashboard 
        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    };
  };

  const getModName = (type: string) => {
    if (type.includes('NAME')) return 'Name Mod';
    if (type.includes('DOB')) return 'DOB Mod';
    if (type.includes('PHONE')) return 'Phone Mod';
    if (type.includes('FULL')) return 'Full Mod';
    return type;
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileEdit className="text-rose-500" size={24} /> BVN Modification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Monitor manually processed BVN record updates.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Source Toggle */}
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
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${sourceFilter === 'DASHBOARD' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'}`}
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
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base sm:text-sm font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Mods</option>
              <option value="BVN_MOD_NAME">Name Mod</option>
              <option value="BVN_MOD_DOB">DOB Mod</option>
              <option value="BVN_MOD_PHONE">Phone Mod</option>
              <option value="BVN_MOD_FULL">Full Mod</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search BVN, NIN, Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Target</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Amount</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <FileEdit className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No BVN Modification records found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-600 dark:text-slate-300">
                          {new Date(item.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider border ${source.colorClass}`}>
                          {source.icon} {source.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {getModName(item.serviceType)} 
                          <span className="text-slate-400 font-normal text-[10px]">({item.requestData?.bank_name})</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          BVN: {item.requestData?.bvn} | NIN: {item.requestData?.nin}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          -₦{Number(item.cost).toLocaleString()}
                          {item.requestData?.surcharge_applied && (
                            <span className="text-[9px] text-orange-600 dark:text-orange-400 uppercase">+ Surcharge</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.status === 'COMPLETED' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
                          item.status === 'FAILED' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                        }`}>
                          {item.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                          {item.status === 'FAILED' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                          {item.status === 'PROCESSING' && <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedItem(item)} 
                          className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> View
                        </button>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center px-4 font-bold text-sm text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Modification Details</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* STATUS CARD */}
              {selectedItem.status === 'COMPLETED' && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">Update Successful</h4>
                    <p className="text-xs text-green-700 dark:text-green-400/90 font-medium mt-0.5">Admin Note: {selectedItem.adminNote || 'Processed'}</p>
                  </div>
                </div>
              )}

              {selectedItem.status === 'FAILED' && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
                  <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">Modification Rejected</h4>
                    <p className="text-xs text-red-700 dark:text-red-400/90 font-medium mt-1">Reason: {selectedItem.adminNote || 'Check wallet for refund status.'}</p>
                  </div>
                </div>
              )}

              {selectedItem.status === 'PROCESSING' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Pending Review</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400/90 font-medium mt-0.5">This request is awaiting admin approval.</p>
                  </div>
                </div>
              )}

              {/* DATA SUMMARY */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Identifiers</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Target BVN</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedItem.requestData?.bvn}</span>
                    </div>
                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Target NIN</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedItem.requestData?.nin}</span>
                    </div>
                    <div className="col-span-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Target Bank</span>
                        <span className="font-bold text-slate-900 dark:text-white">{selectedItem.requestData?.bank_name}</span>
                    </div>
                </div>

                {selectedItem.requestData?.changes?.dates && (
                  <div className="mt-4">
                    <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">DOB Changes</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-500/5">
                        <span className="block text-[10px] text-red-500 mb-1 uppercase font-bold">Old DOB</span>
                        <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{selectedItem.requestData.changes.dates.old}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="flex-1 p-3 border border-green-100 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-500/5">
                        <span className="block text-[10px] text-green-600 mb-1 uppercase font-bold">New DOB</span>
                        <span className="font-mono text-sm text-slate-900 dark:text-white font-bold">{selectedItem.requestData.changes.dates.new}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedItem.requestData?.changes?.new_name && (
                  <div className="mt-4">
                    <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-2">Name Changes</h4>
                    <div className="p-3 border border-green-100 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-500/5">
                        <span className="block text-[10px] text-green-600 mb-1 uppercase font-bold">Requested Name Update</span>
                        <span className="text-sm text-slate-900 dark:text-white font-bold capitalize">
                          {selectedItem.requestData.changes.new_name.first} {selectedItem.requestData.changes.new_name.middle} {selectedItem.requestData.changes.new_name.last}
                        </span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
