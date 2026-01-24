'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Briefcase, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, MapPin, Building2, Hash, FileText, Download
} from 'lucide-react';

export default function AdminTaxIdQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // Action States
  const [generatedTIN, setGeneratedTIN] = useState('');
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Refund Control
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [shouldRefund, setShouldRefund] = useState(true);

  // 1. Fetch Queue (Merges Individual & Non-Individual)
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [resInd, resCorp] = await Promise.all([
        axios.get('/api/admin/requests/all?service=TAX_ID_INDIVIDUAL&status=ALL'),
        axios.get('/api/admin/requests/all?service=TAX_ID_NON_INDIVIDUAL&status=ALL')
      ]);

      const combined = [
        ...(resInd.data.status ? resInd.data.data : []),
        ...(resCorp.data.status ? resCorp.data.data : [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(combined);
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // Set default refund amount
  useEffect(() => {
    if (selectedItem) {
        setRefundAmount(selectedItem.cost.toString());
        setGeneratedTIN('');
        setResultFile(null);
    }
  }, [selectedItem]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !generatedTIN) return alert("Please enter the Generated TIN.");
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      
      if (action === 'APPROVE') {
          // Combine TIN and Note
          const finalNote = `TIN: ${generatedTIN} | ${adminNote}`;
          formData.append('note', finalNote);
          
          if (resultFile) {
            formData.append('file', resultFile);
          }
      } else {
          formData.append('note', rejectionReason);
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
    setRejectionReason('');
    setAdminNote('');
    setGeneratedTIN('');
    setResultFile(null);
    setShouldRefund(true);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Briefcase className="w-8 h-8 text-blue-600" /> Tax ID Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage TIN generation for Individuals & Corporates</p>
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
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Name / Business</th>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No Tax ID requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => {
                        const isCorp = item.serviceType === 'TAX_ID_NON_INDIVIDUAL';
                        const name = isCorp 
                            ? item.requestData?.business_name || 'N/A' 
                            : `${item.requestData?.first_name} ${item.requestData?.surname}`;
                        
                        return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${isCorp ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {isCorp ? 'Corporate' : 'Individual'}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">
                                {name}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{item.user?.firstName} {item.user?.lastName}</span>
                                    <span className="text-xs text-slate-400">{item.user?.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {item.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Issued</span>}
                                {item.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><XCircle size={12}/> Rejected</span>}
                                {item.status === 'PROCESSING' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
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
                        );
                    })
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div>
                  <h3 className="font-bold text-xl text-slate-900">
                      {selectedItem.status === 'PROCESSING' ? 'Generate Tax ID' : 'Request Details'}
                  </h3>
                  <p className="text-slate-500 text-xs">Ref: {selectedItem.requestData?.clientReference || 'N/A'} | ID: {selectedItem.id}</p>
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: DATA */}
                <div className="lg:col-span-2 space-y-6 text-sm h-full overflow-y-auto pr-2">
                    
                    {/* AGENT INFO */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
                            <User size={16} className="text-blue-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Submitting Agent</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700">
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Name</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.firstName} {selectedItem.user?.lastName}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Email</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.email}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Phone</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.phoneNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Wallet Balance</span>
                                <span className="font-bold text-green-700">₦{Number(selectedItem.user?.walletBalance || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC DETAILS (Individual vs Corporate) */}
                    {selectedItem.serviceType === 'TAX_ID_NON_INDIVIDUAL' ? (
                        // CORPORATE VIEW
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 mb-3 border-b border-purple-200 pb-2">
                                <Building2 size={16} className="text-purple-700" />
                                <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Corporate Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Business Name</span> <span className="text-slate-900 font-bold text-lg">{selectedItem.requestData?.business_name}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">RC Number</span> <span className="text-slate-900 font-mono">{selectedItem.requestData?.rc_number}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Business Sector</span> <span className="text-slate-900">{selectedItem.requestData?.sector || 'N/A'}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Date of Commencement</span> <span className="text-slate-900">{selectedItem.requestData?.date_of_commencement}</span></p>
                                <p className="md:col-span-2"><span className="text-slate-600 text-xs uppercase block font-semibold">Office Address</span> <span className="text-slate-900">{selectedItem.requestData?.office_address}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Director Email</span> <span className="text-slate-900">{selectedItem.requestData?.director_email}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Director Phone</span> <span className="text-slate-900">{selectedItem.requestData?.director_phone}</span></p>
                            </div>
                        </div>
                    ) : (
                        // INDIVIDUAL VIEW
                        <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                            <div className="flex items-center gap-2 mb-3 border-b border-teal-200 pb-2">
                                <User size={16} className="text-teal-700" />
                                <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Individual Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Full Name</span> <span className="text-slate-900 font-bold">{selectedItem.requestData?.title} {selectedItem.requestData?.first_name} {selectedItem.requestData?.surname}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Marital Status</span> <span className="text-slate-900">{selectedItem.requestData?.marital_status}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Date of Birth</span> <span className="text-slate-900">{selectedItem.requestData?.dob}</span></p>
                                
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Phone</span> <span className="text-slate-900">{selectedItem.requestData?.phone}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Email</span> <span className="text-slate-900">{selectedItem.requestData?.email}</span></p>
                                <p><span className="text-slate-600 text-xs uppercase block font-semibold">Occupation</span> <span className="text-slate-900">{selectedItem.requestData?.occupation}</span></p>
                                
                                <p className="md:col-span-3 border-t border-teal-200 pt-2 mt-2"><span className="text-slate-600 text-xs uppercase block font-semibold">Address</span> <span className="text-slate-900">{selectedItem.requestData?.address}, {selectedItem.requestData?.lga}, {selectedItem.requestData?.state}</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: ACTIONS */}
                <div className="space-y-6 flex flex-col h-full">
                    {selectedItem.status === 'PROCESSING' ? (
                        <>
                            {/* APPROVE BOX */}
                            <div className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-lg flex-1">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <CheckCircle2 className="text-green-600" size={20} /> Issue Tax ID
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Generated TIN (Required)</label>
                                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                                            <div className="bg-slate-50 px-3 py-3 border-r border-slate-300 text-slate-500">
                                                <Hash size={16} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={generatedTIN}
                                                onChange={(e) => setGeneratedTIN(e.target.value)}
                                                className="w-full p-3 text-sm outline-none font-mono tracking-wide"
                                                placeholder="Enter TIN Number" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Upload Slip (Optional)</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setResultFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Admin Note</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                                            placeholder="Optional comments..." 
                                            rows={2} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing || !generatedTIN} 
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Processing...' : 'Approve & Send TIN'}
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
                                    <div className="pt-2 border-t border-red-100">
                                        <label className="flex items-center gap-2 text-xs font-bold text-red-800 mb-2">
                                            <input 
                                                type="checkbox" 
                                                checked={shouldRefund} 
                                                onChange={e => setShouldRefund(e.target.checked)}
                                                className="accent-red-600" 
                                            />
                                            Refund User?
                                        </label>
                                        
                                        {shouldRefund && (
                                            <div>
                                                <label className="text-[10px] text-red-500 uppercase block mb-1">Refund Amount (₦)</label>
                                                <input 
                                                    type="number" 
                                                    value={refundAmount} 
                                                    onChange={e => setRefundAmount(e.target.value)}
                                                    className="w-full p-2 bg-white border border-red-200 rounded text-sm text-slate-800"
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
                                    <h3 className="text-2xl font-bold text-green-800">TIN Generated</h3>
                                    <p className="text-green-600 text-sm mb-6">Completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    <div className="bg-green-100 p-4 rounded-lg text-center mb-4 w-full">
                                        <p className="text-xs text-green-600 uppercase font-bold mb-1">TIN Number</p>
                                        <p className="text-xl font-mono font-bold text-green-900 tracking-wider">
                                            {selectedItem.adminNote?.match(/TIN: (\d+)/)?.[1] || 'See Note'}
                                        </p>
                                    </div>

                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition flex items-center gap-2 text-sm">
                                            <Download size={16} /> Download Slip
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    <XCircle size={64} className="text-red-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-red-800">Request Declined</h3>
                                    <p className="text-red-600 text-sm mb-4 bg-white/50 p-2 rounded">Reason: {selectedItem.adminNote}</p>
                                    <div className="text-xs bg-red-100 px-3 py-1 rounded-full text-red-700 font-medium">Status: Failed</div>
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
