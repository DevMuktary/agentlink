'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Search, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, Download, Layers, FileText
} from 'lucide-react';

export default function AdminNinValidationQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Refund Control
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [shouldRefund, setShouldRefund] = useState(true);

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Fetch all validation types
      const endpoints = [
        '/api/admin/requests/all?service=NIN_VALIDATION_VNIN&status=ALL',
        '/api/admin/requests/all?service=NIN_VALIDATION_NO_RECORD&status=ALL',
        '/api/admin/requests/all?service=NIN_VALIDATION_UPDATE_RECORD&status=ALL',
        '/api/admin/requests/all?service=NIN_VALIDATION&status=ALL',
      ];

      const responses = await Promise.all(endpoints.map(ep => axios.get(ep)));
      
      // Combine and filter valid responses
      const combined = responses.flatMap(r => r.data.status ? r.data.data : []);
      
      // Sort: Newest first
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(combined);
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // Set default refund when item selected
  useEffect(() => {
    if (selectedItem) {
        // Log for debugging
        console.log("Selected Item Data:", selectedItem.requestData);
        
        setRefundAmount(selectedItem.cost.toString());
        setResultFile(null);
        setRejectionReason('');
        setAdminNote('');
        setShouldRefund(true);
    }
  }, [selectedItem]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !resultFile) return alert("Please upload the Validated NIN Slip (PDF/Image).");
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Validation Successful'));
      
      if (action === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      if (action === 'REJECT') {
          const finalRefund = shouldRefund ? (parseFloat(refundAmount) || 0) : 0;
          formData.append('refund_amount', finalRefund.toString());
      }

      await axios.post('/api/admin/requests/action', formData);
      
      alert(`Request ${action}D Successfully!`);
      closeModal();
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.error || "Action Failed");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  // Helper: Badges
  const getTypeBadge = (type: string) => {
      if (type.includes('VNIN')) return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-purple-200">vNIN Search</span>;
      if (type.includes('NO_RECORD')) return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-orange-200">Demographic Search</span>;
      if (type.includes('UPDATE')) return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-200">Tracking ID</span>;
      return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] uppercase">Validation</span>;
  };

  // Helper: Search Term (Robust Fallback)
  const getSearchTerm = (item: any) => {
      const data = item.requestData || {};
      // Check all possible keys regardless of service type to be safe
      return data.nin || data.vnin || data.tracking_id || data.trackingId || data.phone || '-';
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Search className="w-8 h-8 text-purple-600" /> NIN Validation Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1">Process Validation & Search Requests</p>
        </div>
        <button onClick={fetchQueue} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition shadow-sm">
          <RefreshCw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 whitespace-nowrap">
                <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Service Type</th>
                <th className="px-6 py-4 font-medium">Reference / Search Key</th>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No Validation requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()} <span className="text-xs text-slate-400 block">{new Date(item.createdAt).toLocaleTimeString()}</span></td>
                        <td className="px-6 py-4">{getTypeBadge(item.serviceType)}</td>
                        <td className="px-6 py-4 font-mono text-slate-700">
                            <div className="font-bold">{getSearchTerm(item)}</div>
                            <div className="text-[10px] text-slate-400">{item.requestData?.clientReference || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{item.user?.firstName} {item.user?.lastName}</span>
                                <span className="text-xs text-slate-400">{item.user?.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {item.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Success</span>}
                            {item.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><XCircle size={12}/> Failed</span>}
                            {item.status === 'PROCESSING' && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedItem(item)} 
                            className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all ${
                                item.status === 'PROCESSING' 
                                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {item.status === 'PROCESSING' ? 'Process' : 'Details'}
                        </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                        {selectedItem.status === 'PROCESSING' ? 'Process Request' : 'Request Details'}
                    </h3>
                    <p className="text-slate-500 text-xs font-mono">ID: {selectedItem.id}</p>
                  </div>
                  {getTypeBadge(selectedItem.serviceType)}
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: DATA */}
                <div className="space-y-6 text-sm">
                    
                    {/* AGENT INFO */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
                            <User size={16} className="text-blue-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Agent Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-slate-700">
                            <p><span className="text-slate-500 text-[10px] uppercase block font-semibold">Name</span> <span className="font-medium text-slate-900">{selectedItem.user?.firstName} {selectedItem.user?.lastName}</span></p>
                            <p><span className="text-slate-500 text-[10px] uppercase block font-semibold">Email</span> <span className="font-medium text-slate-900">{selectedItem.user?.email}</span></p>
                            <p><span className="text-slate-500 text-[10px] uppercase block font-semibold">Phone</span> <span className="font-medium text-slate-900">{selectedItem.user?.phoneNumber || 'N/A'}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Wallet Balance</span> <span className="font-bold text-green-700">₦{Number(selectedItem.user?.walletBalance || 0).toLocaleString()}</span></p>
                        </div>
                    </div>

                    {/* SUBMITTED DATA (FIXED RENDERING) */}
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-purple-200 pb-2">
                            <Layers size={16} className="text-purple-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Submitted Data</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {/* Robust Rendering Logic: Displays everything, stringifies objects */}
                            {(!selectedItem.requestData || Object.keys(selectedItem.requestData).length === 0) ? (
                                <p className="text-slate-400 text-xs italic">No data found in request payload.</p>
                            ) : (
                                Object.entries(selectedItem.requestData).map(([key, value]) => {
                                    // Normalize key
                                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    
                                    // Handle Objects/Nulls
                                    let displayValue = value;
                                    if (typeof value === 'object' && value !== null) {
                                        displayValue = JSON.stringify(value);
                                    }
                                    if (value === null || value === undefined) displayValue = 'N/A';

                                    return (
                                        <div key={key} className="flex justify-between items-center border-b border-purple-200/50 pb-2 last:border-0">
                                            <span className="text-slate-500 text-xs font-semibold uppercase">{label}</span>
                                            <span className="text-slate-900 font-mono font-bold text-sm text-right break-all max-w-[200px]">{String(displayValue)}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTIONS */}
                <div className="space-y-6 flex flex-col h-full">
                    {selectedItem.status === 'PROCESSING' ? (
                        <>
                            {/* APPROVE BOX */}
                            <div className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-lg flex-1">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <CheckCircle2 className="text-green-600" size={20} /> Approve & Upload Result
                                </h4>
                                <div className="space-y-4">
                                    
                                    <div className="bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Validation Result (PDF/Image)</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setResultFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Admin Note</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                                            placeholder="Optional comments for agent..." 
                                            rows={2} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing || !resultFile} 
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
                                        {processing ? 'Uploading...' : 'Complete Request'}
                                    </button>
                                </div>
                            </div>

                            {/* REJECT BOX */}
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-sm"><AlertTriangle size={16} /> Decline Request</h4>
                                <div className="space-y-3">
                                    <input 
                                        value={rejectionReason} 
                                        onChange={e => setRejectionReason(e.target.value)} 
                                        className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-200 outline-none" 
                                        placeholder="Reason for rejection (Required)..." 
                                    />
                                    
                                    {/* REFUND CONTROLS */}
                                    <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs font-bold text-red-800">
                                            <input 
                                                type="checkbox" 
                                                checked={shouldRefund} 
                                                onChange={e => setShouldRefund(e.target.checked)}
                                                className="accent-red-600 w-4 h-4" 
                                            />
                                            Refund {shouldRefund ? 'Enabled' : 'Disabled'}
                                        </label>
                                        
                                        {shouldRefund && (
                                             <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-red-500 uppercase font-bold">Amount:</span>
                                                <input 
                                                    type="number" 
                                                    value={refundAmount} 
                                                    onChange={e => setRefundAmount(e.target.value)}
                                                    className="w-20 p-1 bg-white border border-red-200 rounded text-xs text-right font-mono"
                                                />
                                             </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleAction('REJECT')} 
                                        disabled={processing || !rejectionReason} 
                                        className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // READ ONLY VIEW
                        <div className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center h-full ${selectedItem.status === 'COMPLETED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            {selectedItem.status === 'COMPLETED' ? (
                                <>
                                    <CheckCircle2 size={64} className="text-green-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-green-800">Completed</h3>
                                    
                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-700 flex items-center gap-2">
                                            <FileText size={16} /> View Validated Slip
                                        </a>
                                    )}

                                    {selectedItem.adminNote && (
                                        <div className="mt-6 bg-white/60 p-3 rounded border border-green-200 text-sm text-green-800 max-w-xs break-words">
                                            <strong>Note:</strong> {selectedItem.adminNote}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <XCircle size={64} className="text-red-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-red-800">Declined</h3>
                                    <p className="text-red-600 text-sm mb-4 bg-white/50 p-2 rounded">Reason: {selectedItem.adminNote}</p>
                                </>
                            )}
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
