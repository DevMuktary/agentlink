'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileBadge, CheckCircle2, XCircle, RefreshCw, 
  Search, Eye, Copy, Check, X, Download, AlertTriangle
} from 'lucide-react';

export default function AdminNinModificationQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [viewReq, setViewReq] = useState<any>(null); // For viewing details
  const [selectedReq, setSelectedReq] = useState<any>(null); // For actions
  const [actionType, setActionType] = useState<'PROCESSING' | 'APPROVE' | 'REJECT' | null>(null);
  
  // Action Inputs
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
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

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const endpoints = [
        '/api/admin/requests/all?service=NIN_MODIFICATION_NAME&status=ALL',
        '/api/admin/requests/all?service=NIN_MODIFICATION_PHONE&status=ALL',
        '/api/admin/requests/all?service=NIN_MODIFICATION_ADDRESS&status=ALL',
        '/api/admin/requests/all?service=NIN_MODIFICATION_DOB&status=ALL', 
      ];

      const results = await Promise.allSettled(endpoints.map(ep => axios.get(ep)));
      const combined: any[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data && result.value.data.status) {
            combined.push(...result.value.data.data);
        }
      });
      
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(combined);
      setFilteredRequests(combined);
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
    
    if (filterStatus !== 'ALL') {
      result = result.filter(r => r.status === filterStatus);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
          r.requestData?.nin?.includes(q) ||
          r.requestData?.clientReference?.toLowerCase().includes(q) ||
          r.user?.firstName?.toLowerCase().includes(q) ||
          r.user?.lastName?.toLowerCase().includes(q)
      );
    }
    
    setFilteredRequests(result);
  }, [searchQuery, filterStatus, requests]);

  // Handle Action Modal Open
  const openActionModal = (req: any, action: 'PROCESSING' | 'APPROVE' | 'REJECT') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setRejectionReason('');
    setResultFile(null);
    setShouldRefund(true);
    setRefundAmount(req.cost.toString());
  };

  const closeActionModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  // 2. Submit Action
  const handleActionSubmit = async () => {
    if (actionType === 'APPROVE' && !resultFile) return alert("Please upload the Modified NIN Slip/Result.");
    if (actionType === 'REJECT' && !rejectionReason) return alert("Please enter a rejection reason.");
    
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedReq.id);
      formData.append('action', actionType);
      
      // Admin note or rejection reason
      formData.append('note', actionType === 'REJECT' ? rejectionReason : (adminNote || 'Modification Completed'));
      
      if (actionType === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

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
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getApplicantName = (data: any) => {
      if (data?.full_name) return data.full_name;
      if (data?.surname && data?.firstname) return `${data.surname} ${data.firstname}`;
      return 'N/A';
  };

  const formatOldDetails = (item: any) => {
    const data = item.requestData || {};
    return `NIN: ${data.nin || 'N/A'}; Name: ${getApplicantName(data)}; Phone: ${data.phone_number || data.phone || 'N/A'};`;
  };

  const formatNewDetails = (item: any) => {
    const data = item.requestData || {};
    const type = item.serviceType || '';
    if (type.includes('NAME') && data.new_details) {
        return `Surname: ${data.new_details.surname || 'N/A'}; First Name: ${data.new_details.first_name || 'N/A'}; Middle Name: ${data.new_details.middle_name || 'N/A'};`;
    }
    if (type.includes('PHONE')) return `New Phone: ${data.new_phone_number || 'N/A'};`;
    if (type.includes('ADDRESS')) return `New Address: ${data.new_address || 'N/A'};`;
    if (type.includes('DOB')) return `New DOB: ${data.new_dob || 'N/A'};`;
    return 'No modifications requested.';
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             <FileBadge className="w-7 h-7 text-indigo-600" /> NIN Modifications
           </h1>
           <p className="text-gray-500 text-sm mt-1">Manage and process NIN data correction requests.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search Name, NIN, Ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <button onClick={fetchQueue} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIN</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No modification requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                      <div className="text-xs text-gray-500">{req.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md uppercase tracking-wider">
                        {req.serviceType.split('_').pop()} Mod
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-mono font-bold">
                      {req.requestData?.nin}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                       <div className="flex justify-end items-center gap-2">
                         
                         {/* View Button */}
                         <button 
                           onClick={() => setViewReq(req)}
                           className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
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
                                 className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1.5 rounded border border-blue-200 hover:bg-blue-100"
                               >
                                 Process
                               </button>
                             )}
                             <button 
                               onClick={() => openActionModal(req, 'APPROVE')}
                               className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1.5 rounded border border-green-200 hover:bg-green-100"
                             >
                               Approve
                             </button>
                             <button 
                               onClick={() => openActionModal(req, 'REJECT')}
                               className="text-xs bg-red-50 text-red-700 font-bold px-2 py-1.5 rounded border border-red-200 hover:bg-red-100"
                             >
                               Reject
                             </button>
                           </div>
                         )}
                         
                         {/* Download Result Link */}
                         {req.status === 'COMPLETED' && req.responseData?.resultUrl && (
                           <a 
                             href={req.responseData.resultUrl} 
                             target="_blank" 
                             className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded hover:bg-green-100 uppercase flex items-center gap-1"
                           >
                             <Download size={12} /> Slip
                           </a>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative my-8 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-gray-100 p-6">
              <div>
                 <h3 className="text-xl font-black text-gray-900">Request Details</h3>
                 <p className="text-xs text-gray-500 font-mono mt-1">Ref: {viewReq.requestData?.clientReference || viewReq.id}</p>
              </div>
              <button onClick={() => setViewReq(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-600"/>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              
              {/* Agent Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Agent Details</h4>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-medium">Name:</span>
                  <span className="font-bold text-gray-900 text-sm">{viewReq.user.firstName} {viewReq.user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-medium">Email:</span>
                  <span className="font-bold text-gray-900 text-sm">{viewReq.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm font-medium">Phone:</span>
                  <span className="font-bold text-gray-900 text-sm">{viewReq.user.phoneNumber}</span>
                </div>
              </div>

              {/* Current Data */}
              <div className="border border-indigo-100 rounded-xl overflow-hidden">
                 <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex justify-between items-center">
                    <span className="font-bold text-indigo-900 text-sm">Current Base Data</span>
                    <button 
                        onClick={() => copyText(formatOldDetails(viewReq), 'old_details')}
                        className="text-[10px] bg-white border border-indigo-200 text-indigo-700 font-bold px-2 py-1 rounded shadow-sm hover:bg-indigo-100 flex items-center gap-1 uppercase tracking-wider"
                    >
                        {copiedId === 'old_details' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        Copy Old Data
                    </button>
                 </div>
                 <div className="p-4 space-y-3 bg-white text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">NIN:</span>
                        <span className="font-mono font-bold text-gray-900">{viewReq.requestData?.nin}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Name:</span>
                        <span className="font-bold text-gray-900 uppercase">{getApplicantName(viewReq.requestData)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Phone:</span>
                        <span className="font-bold text-gray-900">{viewReq.requestData?.phone_number || viewReq.requestData?.phone || 'N/A'}</span>
                    </div>
                 </div>
              </div>

              {/* Requested Updates */}
              <div className="border border-amber-100 rounded-xl overflow-hidden">
                 <div className="bg-amber-50 p-3 border-b border-amber-100 flex justify-between items-center">
                    <span className="font-bold text-amber-900 text-sm">Requested Updates</span>
                    <button 
                        onClick={() => copyText(formatNewDetails(viewReq), 'new_details')}
                        className="text-[10px] bg-white border border-amber-200 text-amber-700 font-bold px-2 py-1 rounded shadow-sm hover:bg-amber-100 flex items-center gap-1 uppercase tracking-wider"
                    >
                        {copiedId === 'new_details' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        Copy New Data
                    </button>
                 </div>
                 <div className="p-4 space-y-3 bg-white text-sm">
                    {viewReq.serviceType.includes('NAME') && viewReq.requestData?.new_details && (
                        <>
                            <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500 font-medium">New Surname:</span><span className="font-bold text-gray-900 uppercase">{viewReq.requestData.new_details.surname || 'N/A'}</span></div>
                            <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500 font-medium">New First Name:</span><span className="font-bold text-gray-900 uppercase">{viewReq.requestData.new_details.first_name || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 font-medium">New Middle Name:</span><span className="font-bold text-gray-900 uppercase">{viewReq.requestData.new_details.middle_name || 'N/A'}</span></div>
                        </>
                    )}
                    {viewReq.serviceType.includes('PHONE') && (
                        <div className="flex justify-between"><span className="text-gray-500 font-medium">New Phone:</span><span className="font-bold text-gray-900 uppercase">{viewReq.requestData?.new_phone_number || 'N/A'}</span></div>
                    )}
                    {viewReq.serviceType.includes('DOB') && (
                        <div className="flex justify-between"><span className="text-gray-500 font-medium">New DOB:</span><span className="font-bold text-gray-900 uppercase">{viewReq.requestData?.new_dob || 'N/A'}</span></div>
                    )}
                    {viewReq.serviceType.includes('ADDRESS') && (
                        <div className="flex justify-between"><span className="text-gray-500 font-medium">New Address:</span><span className="font-bold text-gray-900 uppercase text-right max-w-xs">{viewReq.requestData?.new_address || 'N/A'}</span></div>
                    )}
                 </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setViewReq(null)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROCESS ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative my-8 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                 <h3 className="text-xl font-black text-gray-900 capitalize tracking-tight">
                   {actionType === 'PROCESSING' ? 'Process Request' : actionType === 'APPROVE' ? 'Approve & Complete' : 'Reject Request'}
                 </h3>
                 <p className="text-xs text-gray-500 mt-1 font-mono">Ref: {selectedReq.requestData?.clientReference || selectedReq.id}</p>
              </div>
              <button onClick={closeActionModal} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6"/>
              </button>
            </div>

            <div className="space-y-5">
              
              {/* 1. Processing State */}
              {actionType === 'PROCESSING' && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium leading-relaxed">
                    This will update the status to <span className="font-bold">"Processing"</span> so the agent knows you have started working on this modification on the NIMC portal.
                  </p>
                </div>
              )}

              {/* 2. Approve State */}
              {actionType === 'APPROVE' && (
                <>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="block text-[10px] font-bold text-green-800 mb-2 uppercase tracking-widest">Upload Result (PDF/Image)</label>
                    <input 
                      type="file" 
                      onChange={e => setResultFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Admin Note (Optional)</label>
                    <textarea
                      placeholder="E.g. Successfully modified tracking ID..."
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
                      rows={2}
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* 3. Reject State */}
              {actionType === 'REJECT' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-red-500 mb-2 uppercase tracking-widest">Rejection Reason (Required)</label>
                    <textarea
                      placeholder="Why is this request being declined?"
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500 outline-none min-h-[80px]"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-red-800 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={shouldRefund} 
                        onChange={e => setShouldRefund(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      Refund Wallet Balance?
                    </label>
                    
                    {shouldRefund && (
                      <div className="mt-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Amount to Refund (₦)</label>
                        <input 
                          type="number" 
                          value={refundAmount} 
                          onChange={e => setRefundAmount(e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-mono font-bold focus:border-red-500 outline-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-1.5 font-medium">Original Charge: ₦{Number(selectedReq.cost).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={closeActionModal} 
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleActionSubmit}
                  disabled={processing}
                  className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95
                    ${actionType === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 
                      actionType === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 
                      'bg-blue-600 hover:bg-blue-700'}`}
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
