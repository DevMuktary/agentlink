'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Building2, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, Download, FileText, User, Eye
} from 'lucide-react';

export default function AdminCacQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // 1. Fetch Queue (Fetch ALL statuses)
  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Changed to status=ALL so items don't disappear
      const res = await axios.get('/api/admin/requests/all?service=CAC_REGISTRATION&status=ALL'); 
      if (res.data.status) {
          setRequests(res.data.data);
      }
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !resultFile) return alert("Please upload the CAC Certificate/Result file.");
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Approved'));
      
      if (action === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      await axios.post('/api/admin/requests/action', formData);
      
      alert(`Request ${action}D Successfully!`);
      closeModal();
      fetchQueue(); // Refresh list to show new status
    } catch (e: any) {
      alert(e.response?.data?.error || "Action Failed");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setResultFile(null);
    setRejectionReason('');
    setAdminNote('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Building2 className="w-8 h-8 text-orange-600" /> CAC Registrations
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage business registration requests & history</p>
        </div>
        <button onClick={fetchQueue} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition shadow-sm">
          <RefreshCw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Business Name</th>
              <th className="px-6 py-4 font-medium">Proprietor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No CAC requests found.
                    </td>
                </tr>
            ) : (
                requests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                        {item.requestData?.business_details?.proposed_name_1 || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{item.requestData?.proprietor_details?.firstname} {item.requestData?.proprietor_details?.surname}</span>
                            <span className="text-xs text-slate-400">{item.user?.email}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {item.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Approved</span>}
                        {item.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><XCircle size={12}/> Rejected</span>}
                        {item.status === 'PROCESSING' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
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
                        {item.status === 'PROCESSING' ? 'Process' : 'View Details'}
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div>
                  <h3 className="font-bold text-xl text-slate-900">
                      {selectedItem.status === 'PROCESSING' ? 'Process Application' : 'Application Details'}
                  </h3>
                  <p className="text-slate-500 text-xs">ID: {selectedItem.id}</p>
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: DATA (Read Only) */}
                <div className="space-y-6 text-sm h-full overflow-y-auto pr-2">
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                        <h4 className="font-bold uppercase text-xs tracking-wider mb-3 text-orange-800 border-b border-orange-200 pb-2">Business Details</h4>
                        <div className="grid grid-cols-1 gap-y-2 text-slate-700">
                            <p><span className="text-slate-500 text-xs uppercase block">Proposed Name 1</span> <span className="font-medium text-lg">{selectedItem.requestData?.business_details?.proposed_name_1}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block">Proposed Name 2</span> <span className="font-medium">{selectedItem.requestData?.business_details?.proposed_name_2}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block">Nature</span> {selectedItem.requestData?.business_details?.nature_of_business}</p>
                            <p><span className="text-slate-500 text-xs uppercase block">Address</span> {selectedItem.requestData?.business_details?.address}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                         <h4 className="font-bold uppercase text-xs tracking-wider mb-3 text-slate-700 border-b border-slate-200 pb-2">Proprietor</h4>
                        <div className="grid grid-cols-2 gap-4 text-slate-700">
                            <p><span className="text-slate-400 text-xs uppercase block">Full Name</span> {selectedItem.requestData?.proprietor_details?.firstname} {selectedItem.requestData?.proprietor_details?.surname}</p>
                            <p><span className="text-slate-400 text-xs uppercase block">Phone</span> {selectedItem.requestData?.proprietor_details?.phone}</p>
                        </div>
                    </div>

                     {/* Documents */}
                     <div>
                        <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Submitted Documents</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {selectedItem.requestData?.documents?.passport_url && (
                                <a href={selectedItem.requestData.documents.passport_url} target="_blank" className="block group">
                                    <div className="bg-slate-100 rounded-lg h-20 flex items-center justify-center border border-slate-200 group-hover:border-blue-400">
                                        <Eye className="text-slate-400" />
                                    </div>
                                    <span className="text-xs text-center block mt-1">Passport</span>
                                </a>
                            )}
                            {selectedItem.requestData?.documents?.nin_slip_url && (
                                <a href={selectedItem.requestData.documents.nin_slip_url} target="_blank" className="block group">
                                    <div className="bg-slate-100 rounded-lg h-20 flex items-center justify-center border border-slate-200 group-hover:border-blue-400">
                                        <FileText className="text-slate-400" />
                                    </div>
                                    <span className="text-xs text-center block mt-1">NIN Slip</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: ACTIONS (Only if Processing) */}
                <div className="space-y-6 flex flex-col h-full">
                    {selectedItem.status === 'PROCESSING' ? (
                        <>
                            <div className="bg-white p-5 rounded-xl border-2 border-slate-100 shadow-sm flex-1">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="text-green-600" size={20} /> Approve & Upload Result
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Upload Certificate (PDF/Image)</label>
                                        <input type="file" onChange={(e) => setResultFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                                    </div>
                                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Admin Note (Optional)..." rows={2} />
                                    <button onClick={() => handleAction('APPROVE')} disabled={processing || !resultFile} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50">
                                        {processing ? 'Processing...' : 'Complete Request'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-sm"><AlertTriangle size={16} /> Decline & Refund</h4>
                                <div className="space-y-3">
                                    <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm" placeholder="Reason for rejection..." />
                                    <button onClick={() => handleAction('REJECT')} disabled={processing || !rejectionReason} className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50">Reject Request</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // READ ONLY VIEW FOR COMPLETED/FAILED
                        <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center h-full ${selectedItem.status === 'COMPLETED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            {selectedItem.status === 'COMPLETED' ? (
                                <>
                                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                                    <h3 className="text-lg font-bold text-green-800">Request Approved</h3>
                                    <p className="text-green-600 text-sm mb-6">This request was completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition">
                                            Download Certificate
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    <XCircle size={48} className="text-red-500 mb-4" />
                                    <h3 className="text-lg font-bold text-red-800">Request Rejected</h3>
                                    <p className="text-red-600 text-sm mb-4">Reason: {selectedItem.adminNote}</p>
                                    <div className="text-xs bg-white/50 px-3 py-1 rounded text-red-500">Refund Processed</div>
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
