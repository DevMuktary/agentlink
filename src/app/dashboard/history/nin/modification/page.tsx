'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  FileCog, User, Phone, MapPin, Eye, ImageIcon,
  Monitor, Code, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function NinModificationHistoryPage() {
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
        ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'].includes(r.serviceType)
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
    if (filterType === 'NAME') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_NAME');
    if (filterType === 'PHONE') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_PHONE');
    if (filterType === 'ADDRESS') result = result.filter(r => r.serviceType === 'NIN_MODIFICATION_ADDRESS');

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
        r.requestData?.clientReference?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [filterType, sourceFilter, searchQuery, requests]);

  // HELPER: Get the correct image URL from different possible admin fields
  const getResultImage = (data: any) => {
    if (!data) return null;
    return data.resultUrl || data.slip_url || data.url || data.image || null;
  };

  // Pagination Calculations
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

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileCog className="text-orange-500" size={24} /> NIN Modification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Track your Name, Phone, and Address corrections.
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
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer shadow-sm text-base sm:text-sm"
            >
              <option value="ALL">All Types</option>
              <option value="NAME">Change of Name</option>
              <option value="PHONE">Change of Phone</option>
              <option value="ADDRESS">Change of Address</option>
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
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Service Category</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Target NIN</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <FileCog className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No modification records found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(item.createdAt).toLocaleDateString('en-NG', { 
                          dateStyle: 'medium'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${source.colorClass}`}>
                          {source.icon}
                          {source.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {item.serviceType === 'NIN_MODIFICATION_NAME' && (
                          <span className="flex items-center text-slate-700 dark:text-slate-300">
                            <User className="w-4 h-4 mr-2 text-slate-400" /> Name Change
                          </span>
                        )}
                        {item.serviceType === 'NIN_MODIFICATION_PHONE' && (
                          <span className="flex items-center text-slate-700 dark:text-slate-300">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" /> Phone Change
                          </span>
                        )}
                        {item.serviceType === 'NIN_MODIFICATION_ADDRESS' && (
                          <span className="flex items-center text-slate-700 dark:text-slate-300">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400" /> Address Change
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900 dark:text-white font-semibold">
                          {item.requestData?.nin || '---'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider">
                          REF: {item.requestData?.clientReference || 'N/A'}
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
                          className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
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

      {/* RESULT / DETAILS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Request Details</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* --- SUCCESS IMAGE (If Completed) --- */}
              {selectedItem.status === 'COMPLETED' && (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-3 rounded-xl border border-green-200 dark:border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span className="font-bold text-sm">Modification Successful</span>
                   </div>
                   
                   {/* THE IMAGE DISPLAY */}
                   <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800/30 flex justify-center">
                      {getResultImage(selectedItem.responseData) ? (
                        <img 
                          src={getResultImage(selectedItem.responseData)} 
                          alt="Modified Document" 
                          className="max-h-64 object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium">No image provided by admin</span>
                        </div>
                      )}
                   </div>
                   {getResultImage(selectedItem.responseData) && (
                      <a 
                        href={getResultImage(selectedItem.responseData)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> Download / View Full Size
                      </a>
                   )}
                </div>
              )}

              {/* --- FAILED REASON (If Failed) --- */}
              {selectedItem.status === 'FAILED' && (
                 <div className="p-5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-base">
                        <XCircle className="w-5 h-5 shrink-0" /> Modification Failed
                    </div>
                    <p className="text-sm pl-7 text-red-600/90 dark:text-red-400/90 font-medium">
                        Reason: <span className="font-bold">{selectedItem.adminNote || 'Declined by Admin (No reason provided)'}</span>
                    </p>
                    <p className="text-xs pl-7 mt-2 text-red-500 dark:text-red-500/80">
                        *Check your wallet history for any processed refunds.
                    </p>
                 </div>
              )}

              {/* --- STILL PROCESSING --- */}
              {selectedItem.status === 'PROCESSING' && (
                 <div className="p-5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                    <Clock className="w-8 h-8 opacity-70 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-base">In Progress</h4>
                      <p className="text-sm opacity-80 mt-1">This request is currently being manually reviewed and processed by our admin team.</p>
                    </div>
                 </div>
              )}

              {/* Data Summary */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Original Request Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Target NIN</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedItem.requestData?.nin}</span>
                    </div>
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Request Ref</span>
                        <span className="font-bold font-mono truncate block text-slate-900 dark:text-white">{selectedItem.requestData?.clientReference || 'N/A'}</span>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
