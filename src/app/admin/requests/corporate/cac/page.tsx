'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Building2, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, Download, FileText, User
} from 'lucide-react';

export default function AdminCacQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // CAC Specific Outputs
  const [resultFile, setResultFile] = useState<File | null>(null);
  
  // Rejection
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // 1. Fetch Queue (Server-Side Filtered)
  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Pass the service type to get only CAC requests
      const res = await axios.get('/api/admin/requests/all?service=CAC_REGISTRATION'); 
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

  // 2. Handle Action (FormData for File Upload)
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
      fetchQueue();
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
            <Building2 className="w-8 h-8 text-orange-600" /> CAC Registration Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage pending business registrations</p>
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
                        No pending CAC requests found.
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
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">Processing</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedItem(item)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm transition-all">
                        View & Process
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
                  <h3 className="font-bold text-xl text-slate-900">Process Application</h3>
                  <p className="text-slate-500 text-xs">ID: {selectedItem.id}</p>
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: APPLICATION DATA */}
                <div className="space-y-6 text-sm h-full overflow-y-auto pr-2">
                    
                    {/* Business Info */}
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 mb-3 text-orange-800 border-b border-orange-200 pb-2">
                            <Building2 size={16} />
                            <h4 className="font-bold uppercase text-xs tracking-wider">Business Details</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-y-2 text-slate-700">
                            <p><span className="text-slate-500 text-xs uppercase block">Proposed Name 1</span> <span className="font-medium text-lg">{selectedItem.requestData?.business_details?.proposed_name_1}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block">Proposed Name 2</span> <span className="font-medium">{selectedItem.requestData?.business_details?.proposed_name_2}</span></p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <p><span className="text-slate-500 text-xs uppercase block">Nature</span> {selectedItem.requestData?.business_details?.nature_of_business}</p>
                                <p><span className="text-slate-500 text-xs uppercase block">Address</span> {selectedItem.requestData?.business_details?.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Proprietor Info */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-700 border-b border-slate-200 pb-2">
                            <User size={16} />
                            <h4 className="font-bold uppercase text-xs tracking-wider">Proprietor Details</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-slate-700">
                            <p><span className="text-slate-400 text-xs uppercase block">Full Name</span> {selectedItem.requestData?.proprietor_details?.firstname} {selectedItem.requestData?.proprietor_details?.surname}</p>
                            <p><span className="text-slate-400 text-xs uppercase block">NIN</span> {selectedItem.requestData?.proprietor_details?.nin}</p>
                            <p><span className="text-slate-400 text-xs uppercase block">Phone</span> {selectedItem.requestData?.proprietor_details?.phone}</p>
                            <p><span className="text-slate-400 text-xs uppercase block">Email</span> {selectedItem.requestData?.proprietor_details?.email}</p>
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">Uploaded Documents</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {selectedItem.requestData?.documents?.passport_url && (
                                <a href={selectedItem.requestData.documents.passport_url} target="_blank" className="block group">
                                    <div className="bg-slate-100 rounded-lg p-2 text-center border border-slate-200 group-hover:border-blue-400 transition-colors h-24 flex items-center justify-center relative overflow-hidden">
                                        <img src={selectedItem.requestData.documents.passport_url} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <span className="text-xs text-center block mt-1 text-slate-500 group-hover:text-blue-600 font-medium">Passport</span>
                                </a>
                            )}
                             {selectedItem.requestData?.documents?.signature_url && (
                                <a href={selectedItem.requestData.documents.signature_url} target="_blank" className="block group">
                                    <div className="bg-white rounded-lg p-2 text-center border border-slate-200 group-hover:border-blue-400 transition-colors h-24 flex items-center justify-center">
                                        <img src={selectedItem.requestData.documents.signature_url} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <span className="text-xs text-center block mt-1 text-slate-500 group-hover:text-blue-600 font-medium">Signature</span>
                                </a>
                            )}
                            {selectedItem.requestData?.documents?.nin_slip_url && (
                                <a href={selectedItem.requestData.documents.nin_slip_url} target="_blank" className="block group">
                                    <div className="bg-slate-100 rounded-lg p-2 text-center border border-slate-200 group-hover:border-blue-400 transition-colors h-24 flex items-center justify-center">
                                        <FileText className="text-slate-400" />
                                    </div>
                                    <span className="text-xs text-center block mt-1 text-slate-500 group-hover:text-blue-600 font-medium">NIN Slip</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="space-y-6 flex flex-col h-full">
                    
                    {/* Approve Box */}
                    <div className="bg-white p-5 rounded-xl border-2 border-slate-100 shadow-sm flex-1">
                        <div className="mb-4">
                            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <CheckCircle2 className="text-green-600" size={20} /> Approve & Upload Result
                            </h4>
                            <p className="text-slate-500 text-xs">Upload the final CAC Certificate/PDF to complete this request.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Upload Certificate / Status Report (PDF/Image)</label>
                                <input 
                                    type="file" 
                                    onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors"
                                />
                            </div>
                            
                             <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Admin Note (Optional)</label>
                                <textarea 
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    rows={2}
                                    placeholder="Any comments for the user..."
                                />
                            </div>

                            <button 
                                onClick={() => handleAction('APPROVE')} 
                                disabled={processing || !resultFile} 
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {processing ? 'Processing...' : 'Complete Request'}
                            </button>
                        </div>
                    </div>

                    {/* Reject Box */}
                    <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} /> Decline & Refund
                        </h4>
                        
                        <div className="space-y-3">
                            <input 
                                value={rejectionReason} 
                                onChange={e => setRejectionReason(e.target.value)} 
                                className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 placeholder:text-red-300" 
                                placeholder="Reason for rejection (Visible to user)..." 
                            />
                            
                            <button 
                                onClick={() => handleAction('REJECT')} 
                                disabled={processing || !rejectionReason} 
                                className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
                            >
                                Reject Request
                            </button>
                        </div>
                         <p className="text-[10px] text-red-400 mt-3 text-center">
                            *This will automatically refund ₦{Number(selectedItem.cost).toLocaleString()} to the user's wallet.
                        </p>
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
