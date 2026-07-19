'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, ShieldCheck, 
  Eye, Copy, Smartphone, Calendar, MapPin, 
  Monitor, Code, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

export default function BvnVerificationHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
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
      // Filter strictly for BVN Verification
      const logs = res.data.filter((r: any) => r.serviceType === 'BVN_VERIFICATION');
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

    // 1. Filter by Submission Source
    if (sourceFilter === 'DASHBOARD') {
      result = result.filter(r => (r.requestData?.clientReference || '').startsWith('DASH-'));
    } else if (sourceFilter === 'API') {
      result = result.filter(r => !(r.requestData?.clientReference || '').startsWith('DASH-'));
    }

    // 2. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.bvn?.includes(q) || 
        r.id.toLowerCase().includes(q) ||
        r.requestData?.clientReference?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [sourceFilter, searchQuery, requests]);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={24} /> BVN Verifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Review logs of your BVN verification requests.
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

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search BVN or Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Origin</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Target BVN</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No verification records found.
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
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900 dark:text-white font-semibold">
                          {item.requestData?.bvn}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          item.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                          item.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        }`}>
                          {item.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {item.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> View Log
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

      {/* VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" /> Verification Result
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Request Info Box */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex gap-6 text-sm">
                   <div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">BVN Searched</span>
                      <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">{selectedItem.requestData?.bvn}</span>
                   </div>
                   <div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Cost</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">₦{selectedItem.cost}</span>
                   </div>
                </div>
                <div>
                   <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Request ID</span>
                   <div className="flex items-center gap-2">
                     <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{selectedItem.id}</span>
                     <button onClick={() => copyToClipboard(selectedItem.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-blue-500">
                       <Copy className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {selectedItem.status === 'COMPLETED' && selectedItem.responseData && (
                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in">
                   
                   {/* Photo Section */}
                   <div className="shrink-0 flex flex-col items-center">
                      <div className="w-40 h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                        {selectedItem.responseData.photo || selectedItem.responseData.base64Image ? (
                          <img 
                            src={(selectedItem.responseData.photo || selectedItem.responseData.base64Image).startsWith('data:') 
                                  ? (selectedItem.responseData.photo || selectedItem.responseData.base64Image) 
                                  : `data:image/jpeg;base64,${selectedItem.responseData.photo || selectedItem.responseData.base64Image}`} 
                            alt="BVN Photo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">No Photo</div>
                        )}
                      </div>
                      <span className="mt-4 text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Target
                      </span>
                   </div>

                   {/* Details Grid */}
                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailBox label="First Name" value={selectedItem.responseData.firstName || selectedItem.responseData.first_name} />
                      <DetailBox label="Surname" value={selectedItem.responseData.surname || selectedItem.responseData.lastName || selectedItem.responseData.last_name} />
                      <DetailBox label="Middle Name" value={selectedItem.responseData.middleName || selectedItem.responseData.middle_name} />
                      <DetailBox label="Gender" value={selectedItem.responseData.gender} />
                      
                      <div className="col-span-1 sm:col-span-2 border-t border-dashed border-slate-200 dark:border-slate-700 my-1"></div>

                      <DetailBox label="Date of Birth" value={selectedItem.responseData.dateOfBirth || selectedItem.responseData.dob} icon={Calendar} />
                      <DetailBox label="Phone Number" value={selectedItem.responseData.phoneNumber || selectedItem.responseData.phoneNumber1 || selectedItem.responseData.phone} icon={Smartphone} />
                      <DetailBox label="State of Origin" value={selectedItem.responseData.stateOfOrigin} icon={MapPin} />
                      <DetailBox label="NIN (Linked)" value={selectedItem.responseData.nin || 'N/A'} />
                   </div>
                </div>
              )}

              {/* FAILED STATE */}
              {selectedItem.status === 'FAILED' && (
                 <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 animate-in fade-in">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">Verification Failed</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm max-w-sm mx-auto font-medium">
                      {selectedItem.responseData?.error || 'The provider could not verify this BVN.'}
                    </p>
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for Data Fields
function DetailBox({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white block truncate text-sm">
        {value || 'N/A'}
      </span>
    </div>
  );
}
