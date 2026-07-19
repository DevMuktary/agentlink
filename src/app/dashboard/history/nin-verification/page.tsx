'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, ShieldCheck, 
  Eye, Copy, Smartphone, Calendar, MapPin, 
  Monitor, Code, ChevronLeft, ChevronRight, 
  Fingerprint, FileText, Loader2, Download
} from 'lucide-react';

export default function NinVerificationHistory() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DASHBOARD' | 'API'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VERIFICATION' | 'SLIP'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/user/requests'); 
      // Fetch both Verifications and Slips for this ecosystem
      const logs = res.data.filter((r: any) => 
        r.serviceType === 'NIN_VERIFICATION' || 
        r.serviceType === 'NIN_SEARCH_BY_PHONE' ||
        (r.serviceType && r.serviceType.includes('NIN_SLIP'))
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

    // 1. Source Filter (Dashboard vs API)
    if (sourceFilter === 'DASHBOARD') {
      result = result.filter(r => (r.requestData?.clientReference || '').startsWith('DASH-'));
    } else if (sourceFilter === 'API') {
      result = result.filter(r => !(r.requestData?.clientReference || '').startsWith('DASH-'));
    }

    // 2. Record Type Filter
    if (typeFilter === 'VERIFICATION') {
      result = result.filter(r => r.serviceType === 'NIN_VERIFICATION' || r.serviceType === 'NIN_SEARCH_BY_PHONE');
    } else if (typeFilter === 'SLIP') {
      result = result.filter(r => r.serviceType && r.serviceType.includes('NIN_SLIP'));
    }

    // 3. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.requestData?.nin?.includes(q) || 
        r.requestData?.phone?.includes(q) || 
        r.id.toLowerCase().includes(q) ||
        r.requestData?.clientReference?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [sourceFilter, typeFilter, searchQuery, requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getSourceDetails = (clientReference?: string) => {
    const isDashboard = (clientReference || '').startsWith('DASH-');
    return {
      label: isDashboard ? 'Dashboard' : 'API',
      icon: isDashboard ? <Monitor className="w-3.5 h-3.5 mr-1.5" /> : <Code className="w-3.5 h-3.5 mr-1.5" />,
      colorClass: isDashboard 
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
    };
  };

  const handleRedownload = async (requestId: string) => {
    setDownloadingId(requestId);
    try {
      const res = await fetch('/api/dashboard/identity/redownload-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });
      
      const data = await res.json();
      if (!res.ok || data.status === false) throw new Error(data.error);

      const linkSource = `data:application/pdf;base64,${data.pdf_base64}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = `NIN_Slip_Archived_${Date.now()}.pdf`;
      downloadLink.click();
    } catch (err: any) {
      alert(err.message || 'Failed to download slip');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Fingerprint className="text-blue-500" size={26} strokeWidth={2.5} /> NIN Verifications & Slips
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Review your verifications and redownload generated slips.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          
          {/* Source Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button onClick={() => setSourceFilter('ALL')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${sourceFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>All</button>
            <button onClick={() => setSourceFilter('API')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${sourceFilter === 'API' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm' : 'text-slate-500'}`}><Code className="w-4 h-4"/> API</button>
            <button onClick={() => setSourceFilter('DASHBOARD')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${sourceFilter === 'DASHBOARD' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}><Monitor className="w-4 h-4"/> Dashboard</button>
          </div>

          {/* Type Toggle */}
          <select value={typeFilter} onChange={(e: any) => setTypeFilter(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm outline-none">
            <option value="ALL">All Records</option>
            <option value="VERIFICATION">Verifications</option>
            <option value="SLIP">Slips Only</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search NIN, Phone or Ref..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Record Type</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Target Info</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      No records found.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((item) => {
                  const source = getSourceDetails(item.requestData?.clientReference);
                  const isSlip = item.serviceType?.includes('SLIP');
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(item.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${source.colorClass}`}>
                          {source.icon} {source.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${
                          isSlip ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {isSlip ? <FileText className="w-3 h-3 mr-1" /> : <Fingerprint className="w-3 h-3 mr-1" />}
                          {isSlip ? 'Slip Gen' : 'Verification'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-900 dark:text-white font-semibold">
                          {item.requestData?.nin || item.requestData?.phone || 'N/A'}
                        </div>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex items-center px-4 font-bold text-sm">{currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50"><ChevronRight className="w-5 h-5" /></button>
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
                <ShieldCheck className="w-5 h-5 text-blue-500" /> Log Details
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex gap-6 text-sm">
                   <div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Target Number</span>
                      <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">{selectedItem.requestData?.nin || selectedItem.requestData?.phone}</span>
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
                   <div className="shrink-0 flex flex-col items-center">
                      <div className="w-40 h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                        {selectedItem.responseData.photo ? (
                          <img 
                            src={selectedItem.responseData.photo.startsWith('data:') ? selectedItem.responseData.photo : `data:image/jpeg;base64,${selectedItem.responseData.photo}`} 
                            alt="NIN Photo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">No Photo</div>
                        )}
                      </div>
                      <span className="mt-4 text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-full flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Data Retrieved
                      </span>
                   </div>

                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailBox label="First Name" value={selectedItem.responseData.firstname} />
                      <DetailBox label="Surname" value={selectedItem.responseData.surname} />
                      <DetailBox label="Gender" value={selectedItem.responseData.gender} />
                      <DetailBox label="Date of Birth" value={selectedItem.responseData.birthdate} icon={Calendar} />
                      
                      <div className="col-span-1 sm:col-span-2 border-t border-dashed border-slate-200 dark:border-slate-700 my-1"></div>

                      <DetailBox label="Phone Number" value={selectedItem.responseData.telephoneno} icon={Smartphone} />
                      <DetailBox label="Address" value={selectedItem.responseData.residence_AdressLine1} icon={MapPin} />
                   </div>
                </div>
              )}

              {/* FAILED STATE */}
              {selectedItem.status === 'FAILED' && (
                 <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 animate-in fade-in">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">Request Failed</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm max-w-sm mx-auto font-medium">
                      {selectedItem.responseData?.error || 'The provider could not fulfill this request.'}
                    </p>
                 </div>
              )}

              {/* REDOWNLOAD BUTTON (ONLY IF THIS LOG IS A SLIP PURCHASE) */}
              {selectedItem.status === 'COMPLETED' && selectedItem.serviceType?.includes('SLIP') && (
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100">Official Document</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">
                        You can securely redownload the exact slip format you purchased.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRedownload(selectedItem.id)}
                    disabled={downloadingId === selectedItem.id}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-[0.98]"
                  >
                    {downloadingId === selectedItem.id ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Fetching...</>
                    ) : (
                      <><FileText className="w-5 h-5" /> Redownload Slip</>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
