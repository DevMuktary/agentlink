'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Search, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, Layers, Globe, Code, Copy, Check, Eye, FileBadge, X, Monitor
} from 'lucide-react';

export default function AdminNinValidationQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DASHBOARD' | 'API'>('ALL');

  // Modal States
  const [viewReq, setViewReq] = useState<any>(null); // For viewing details
  const [selectedReq, setSelectedReq] = useState<any>(null); // For actions
  const [actionType, setActionType] = useState<'PROCESSING' | 'APPROVE' | 'REJECT' | null>(null);
  
  // Action Inputs
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(true);
  const [refundAmount, setRefundAmount] = useState<string>('');

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine channel based on reference prefix
  const getChannel = (reference: string) => {
    if (!reference) return 'API'; // Fallback
    if (reference.includes('DASH') || reference.startsWith('FW-')) {
        return 'DASHBOARD';
    }
    return 'API';
  };

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const serviceTypes = [
        'NIN_VALIDATION_VNIN',
        'NIN_VALIDATION_NO_RECORD',
        'NIN_VALIDATION_UPDATE_RECORD',
        'NIN_VALIDATION' 
      ];

      const promises = serviceTypes.map(type => 
        axios.get(`/api/admin/requests/all?service=${type}&status=ALL`)
      );

      const results = await Promise.allSettled(promises);
      const combined: any[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data && result.value.data.status) {
             combined.push(...result.value.data.data);
        }
      });
      
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Remove duplicates
      const uniqueIds = new Set();
      const uniqueRequests = combined.filter(item => {
        const isDuplicate = uniqueIds.has(item.id);
        uniqueIds.add(item.id);
        return !isDuplicate;
      });

      setRequests(uniqueRequests);
      setFilteredRequests(uniqueRequests);
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // Filtering
  useEffect(() => {
    let result = requests;
    
    // Status Filter
    if (filterStatus !== 'ALL') {
      result = result.filter(r => r.status === filterStatus);
    }

    // Source Filter
    if (sourceFilter !== 'ALL') {
      result = result.filter(r => getChannel(r.requestData?.clientReference || r.id) === sourceFilter);
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
          r.requestData?.nin?.includes(q) ||
          r.requestData?.vnin?.includes(q) ||
          r.requestData?.tracking_id?.includes(q) ||
          r.requestData?.clientReference?.toLowerCase().includes(q) ||
          r.user?.firstName?.toLowerCase().includes(q) ||
          r.user?.lastName?.toLowerCase().includes(q)
      );
    }
    
    setFilteredRequests(result);
  }, [searchQuery, filterStatus, sourceFilter, requests]);

  // Handle Action Modal Open
  const openActionModal = (req: any, action: 'PROCESSING' | 'APPROVE' | 'REJECT') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setRejectionReason('');
    setShouldRefund(true);
    setRefundAmount(req.cost.toString());
  };

  const closeActionModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  // 2. Submit Action
  const handleActionSubmit = async () => {
    if (!actionType) return;
    if (actionType === 'REJECT' && !rejectionReason) return alert("Please enter a rejection reason.");
    
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedReq.id);
      formData.append('action', actionType);
      
      const note = actionType === 'REJECT' ? rejectionReason : (adminNote || 'Validation Completed');
      formData.append('note', note);
      
      if (actionType === 'REJECT') {
          const finalRefund = shouldRefund ? (parseFloat(refundAmount) || 0) : 0;
          formData.append('refund_amount', finalRefund.toString());
      }

      await axios.post('/api/admin/requests/action', formData);
      
      alert(`Success! Request has been updated.`);
      closeActionModal();
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.error || "Action Failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // UI Helpers
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      default: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
    }
  };

  const getTypeBadge = (type: string) => {
      if (type.includes('VNIN')) return <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">vNIN</span>;
      if (type.includes('NO_RECORD')) return <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">No Record</span>;
      if (type.includes('UPDATE')) return <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">Update</span>;
      return <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">Validation</span>;
  };

  const getChannelBadge = (ref: string) => {
    const isDash = getChannel(ref) === 'DASHBOARD';
    return isDash ? (
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-blue-200 dark:border-blue-800/50 flex items-center gap-1 w-fit whitespace-nowrap">
            <Globe size={10} /> Dashboard
        </span>
    ) : (
        <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-purple-200 dark:border-purple-800/50 flex items-center gap-1 w-fit whitespace-nowrap">
            <Code size={10} /> API
        </span>
    );
  };

  const getSearchTerm = (item: any) => {
      if (item.requestData?.nin) return item.requestData.nin;
      if (item.requestData?.vnin) return item.requestData.vnin;
      if (item.requestData?.tracking_id) return item.requestData.tracking_id;
      return 'N/A';
  };

  const DisplayRow = ({ label, value, isEmail = false }: { label: string, value: any, isEmail?: boolean }) => {
    const strValue = String(value || 'N/A').trim();
    const displayValue = isEmail || strValue === 'N/A' ? strValue : strValue.toUpperCase();
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider pr-2 whitespace-nowrap">{label}</span>
            <span className={`font-bold text-slate-900 dark:text-slate-100 text-sm text-right truncate ${!isEmail ? 'uppercase tracking-wide' : ''}`} title={displayValue}>
                {displayValue}
            </span>
        </div>
    );
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 pb-20 max-w-[90rem] mx-auto animate-in fade-in duration-500">
      
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
           <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
             <Search className="w-7 h-7 text-purple-600 dark:text-purple-400" /> NIN Validations
           </h1>
           <p className="text-gray-500 text-sm mt-1 font-medium">Manage Validation, No Record Found & VNIN Issues.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          
          {/* Source Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full sm:w-auto border border-slate-200 dark:border-slate-700/50">
            <button onClick={() => setSourceFilter('ALL')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${sourceFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>All</button>
            <button onClick={() => setSourceFilter('API')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${sourceFilter === 'API' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'}`}><Code size={14}/> API</button>
            <button onClick={() => setSourceFilter('DASHBOARD')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${sourceFilter === 'DASHBOARD' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}><Monitor size={14}/> Dash</button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search ID, Ref, Agent..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          
          <button onClick={fetchQueue} className="p-2.5 w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center shadow-sm">
            <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Date & Reference</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Service</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Identifier</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">No validation requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {req.requestData?.clientReference || req.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-1">
                        {getChannelBadge(req.requestData?.clientReference || req.id)}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{req.user.firstName} {req.user.lastName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{req.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(req.serviceType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono font-bold whitespace-nowrap">
                      {getSearchTerm(req)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                       <div className="flex justify-end items-center gap-2">
                         
                         {/* View Button */}
                         <button 
                           onClick={() => setViewReq(req)}
                           className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors"
                           title="View Details"
                         >
                           <Eye className="h-5 w-5" />
                         </button>

                         {/* Action Buttons (Only if active) */}
                         {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                           <div className="flex gap-1.5">
                             {req.status === 'PENDING' && (
                               <button 
                                 onClick={() => openActionModal(req, 'PROCESSING')}
                                 className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold px-3 py-1.5 rounded border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-sm"
                               >
                                 Process
                               </button>
                             )}
                             <button 
                               onClick={() => openActionModal(req, 'APPROVE')}
                               className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-3 py-1.5 rounded border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors shadow-sm"
                             >
                               Approve
                             </button>
                             <button 
                               onClick={() => openActionModal(req, 'REJECT')}
                               className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-3 py-1.5 rounded border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                             >
                               Reject
                             </button>
                           </div>
                         )}
                         
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative my-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-t-3xl">
              <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                   <FileBadge className="w-5 h-5 text-purple-500" /> Request Details
                 </h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Ref: {viewReq.requestData?.clientReference || viewReq.id}</p>
              </div>
              <button onClick={() => setViewReq(null)} className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500">
                <X className="h-5 w-5"/>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* Agent Info */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Agent Details</h4>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewReq.user.firstName} {viewReq.user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewReq.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewReq.user.phoneNumber}</span>
                </div>
              </div>

              {/* Submitted Data */}
              <div className="border border-purple-100 dark:border-purple-800/30 rounded-xl overflow-hidden shadow-sm">
                 <div className="bg-purple-50 dark:bg-purple-900/10 p-3 border-b border-purple-100 dark:border-purple-800/30 flex justify-between items-center">
                    <span className="font-bold text-purple-900 dark:text-purple-400 text-sm">Submitted Data Payload</span>
                    <button 
                        onClick={() => copyText(JSON.stringify(viewReq.requestData), 'raw_data')}
                        className="text-[10px] bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 font-bold px-2.5 py-1.5 rounded shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-1 uppercase tracking-wider transition-colors"
                    >
                        {copiedId === 'raw_data' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        Copy JSON
                    </button>
                 </div>
                 <div className="p-4 space-y-0 bg-white dark:bg-slate-900 text-sm">
                    {Object.entries(viewReq.requestData || {}).map(([key, value]) => {
                        if (!value || typeof value === 'object') return null;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return <DisplayRow key={key} label={label} value={value} />;
                    })}
                 </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-b-3xl flex justify-end">
              <button onClick={() => setViewReq(null)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROCESS ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 relative my-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
                   {actionType === 'PROCESSING' ? 'Process Request' : actionType === 'APPROVE' ? 'Approve & Complete' : 'Reject Request'}
                 </h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Ref: {selectedReq.requestData?.clientReference || selectedReq.id}</p>
              </div>
              <button onClick={closeActionModal} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="h-5 w-5"/>
              </button>
            </div>

            <div className="space-y-5">
              
              {/* 1. Processing State */}
              {actionType === 'PROCESSING' && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                  <p className="text-sm text-purple-800 dark:text-purple-300 font-medium leading-relaxed">
                    This will update the status to <span className="font-bold">"Processing"</span> so the agent knows you have started working on this validation request.
                  </p>
                </div>
              )}

              {/* 2. Approve State */}
              {actionType === 'APPROVE' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Admin Note (Optional)</label>
                  <textarea
                    placeholder="E.g. Validation successful..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    rows={3}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
              )}

              {/* 3. Reject State */}
              {actionType === 'REJECT' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-red-500 dark:text-red-400 mb-2 uppercase tracking-widest">Rejection Reason (Required)</label>
                    <textarea
                      placeholder="Why is this validation being declined?"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 outline-none min-h-[80px] transition-colors"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <label className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-400 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={shouldRefund} 
                        onChange={e => setShouldRefund(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      Refund Wallet Balance?
                    </label>
                    
                    {shouldRefund && (
                      <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Amount to Refund (₦)</label>
                        <input 
                          type="number" 
                          value={refundAmount} 
                          onChange={e => setRefundAmount(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono font-bold focus:border-red-500 outline-none transition-colors"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Original Charge: ₦{Number(selectedReq.cost).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={closeActionModal} 
                  className="flex-1 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleActionSubmit}
                  disabled={processing}
                  className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95
                    ${actionType === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 
                      actionType === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 
                      'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {processing ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
