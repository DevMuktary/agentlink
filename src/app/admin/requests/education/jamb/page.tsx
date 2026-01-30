'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, FileText, Download, Hash, Calendar, BookOpen, Layers
} from 'lucide-react';

export default function AdminJambQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // Action States
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [resultText, setResultText] = useState(''); // For Profile Codes
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Refund Control
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [shouldRefund, setShouldRefund] = useState(true);

  // 1. Fetch Queue (Combine all JAMB Services)
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const endpoints = [
        '/api/admin/requests/all?service=JAMB_SERVICES&status=ALL',
        '/api/admin/requests/all?service=JAMB_ORIGINAL_RESULT&status=ALL',
        '/api/admin/requests/all?service=JAMB_ADMISSION_LETTER&status=ALL',
        '/api/admin/requests/all?service=JAMB_REGISTRATION_SLIP&status=ALL',
        '/api/admin/requests/all?service=JAMB_PROFILE_CODE_RETRIEVAL&status=ALL'
      ];

      const results = await Promise.allSettled(endpoints.map(ep => axios.get(ep)));
      
      const combined: any[] = [];
      results.forEach(res => {
          if (res.status === 'fulfilled' && res.value.data?.status) {
              combined.push(...res.value.data.data);
          }
      });
      
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

  // Set default refund
  useEffect(() => {
    if (selectedItem) {
        setRefundAmount(selectedItem.cost.toString());
        setResultFile(null);
        setResultText('');
        setRejectionReason('');
        setAdminNote('');
        setShouldRefund(true);
    }
  }, [selectedItem]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    const isProfileRetrieval = selectedItem?.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL';

    if (action === 'APPROVE') {
        if (isProfileRetrieval && !resultText) return alert("Please enter the Recovered Profile Code.");
        if (!isProfileRetrieval && !resultFile) return alert("Please upload the Result/Admission Letter PDF.");
    }
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Service Completed'));
      
      if (action === 'APPROVE') {
          // If Text (Profile Code)
          if (resultText) formData.append('result_text', resultText);
          // If File (PDF)
          if (resultFile) formData.append('file', resultFile);
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

  // Helper for Badges
  const getServiceBadge = (type: string) => {
      if (type.includes('RESULT')) return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-purple-200">Original Result</span>;
      if (type.includes('ADMISSION')) return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-200">Admission Letter</span>;
      if (type.includes('SLIP')) return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-orange-200">Registration Slip</span>;
      if (type.includes('PROFILE')) return <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-teal-200">Profile Code</span>;
      return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] uppercase">JAMB Service</span>;
  };

  // Helper to extract Key ID
  const getDisplayId = (data: any) => {
      return data?.registrationNumber || data?.regNumber || data?.profileCode || data?.nin || '-';
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <GraduationCap className="w-8 h-8 text-green-600" /> JAMB Services
            </h1>
            <p className="text-slate-500 text-sm mt-1">Results, Admission Letters, and Profile Codes</p>
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
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Reg No. / NIN</th>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No JAMB requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{getServiceBadge(item.serviceType)}</td>
                        <td className="px-6 py-4 font-mono text-slate-700 font-bold">
                            {getDisplayId(item.requestData)}
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
                            {item.status === 'PROCESSING' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
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
                    <p className="text-slate-500 text-xs">ID: {selectedItem.id}</p>
                  </div>
                  {getServiceBadge(selectedItem.serviceType)}
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: DATA */}
                <div className="space-y-6 text-sm h-full overflow-y-auto pr-2">
                    
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
                            <p><span className="text-slate-500 text-[10px] uppercase block font-semibold">Wallet Balance</span> <span className="font-bold text-green-700">₦{Number(selectedItem.user?.walletBalance || 0).toLocaleString()}</span></p>
                        </div>
                    </div>

                    {/* CANDIDATE / JAMB DETAILS */}
                    <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-green-200 pb-2">
                            <GraduationCap size={16} className="text-green-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Candidate Details</h4>
                        </div>
                        
                        <div className="space-y-4 text-slate-700">
                            {/* For Result/Admission/Slip */}
                            {(selectedItem.requestData?.regNumber || selectedItem.requestData?.registrationNumber) && (
                                <div>
                                    <span className="text-slate-500 text-xs uppercase block font-semibold">JAMB Reg Number</span>
                                    <span className="font-mono font-bold text-xl text-slate-900 tracking-widest">
                                        {selectedItem.requestData?.regNumber || selectedItem.requestData?.registrationNumber}
                                    </span>
                                </div>
                            )}

                            {/* For Profile Code Retrieval */}
                            {selectedItem.requestData?.nin && (
                                <div>
                                    <span className="text-slate-500 text-xs uppercase block font-semibold">NIN</span>
                                    <span className="font-mono font-bold text-xl text-slate-900 tracking-widest">
                                        {selectedItem.requestData?.nin}
                                    </span>
                                </div>
                            )}

                            {/* Common Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                {selectedItem.requestData?.profileCode && (
                                    <div>
                                        <span className="text-slate-500 text-xs uppercase block font-semibold">Profile Code</span>
                                        <span className="font-medium text-slate-900">{selectedItem.requestData?.profileCode}</span>
                                    </div>
                                )}
                                {selectedItem.requestData?.examYear && (
                                    <div>
                                        <span className="text-slate-500 text-xs uppercase block font-semibold">Exam Year</span>
                                        <span className="font-medium text-slate-900">{selectedItem.requestData?.examYear}</span>
                                    </div>
                                )}
                                {selectedItem.requestData?.examType && (
                                    <div>
                                        <span className="text-slate-500 text-xs uppercase block font-semibold">Exam Type</span>
                                        <span className="font-medium text-slate-900">{selectedItem.requestData?.examType}</span>
                                    </div>
                                )}
                                 {selectedItem.requestData?.dob && (
                                    <div>
                                        <span className="text-slate-500 text-xs uppercase block font-semibold">Date of Birth</span>
                                        <span className="font-medium text-slate-900">{selectedItem.requestData?.dob}</span>
                                    </div>
                                )}
                            </div>
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
                                    <CheckCircle2 className="text-green-600" size={20} /> Approve & Deliver
                                </h4>
                                <div className="space-y-4">
                                    
                                    {/* DYNAMIC INPUT: If Profile Code Retrieval -> Text Input. Else -> File Upload */}
                                    {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Recovered Profile Code</label>
                                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                                                <div className="bg-slate-50 px-3 py-3 border-r border-slate-300 text-slate-500">
                                                    <Hash size={16} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={resultText}
                                                    onChange={(e) => setResultText(e.target.value)}
                                                    className="w-full p-3 text-sm outline-none font-mono tracking-widest font-bold text-slate-900"
                                                    placeholder="Enter 10-digit Code" 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Upload Document (PDF)</label>
                                            <input 
                                                type="file" 
                                                accept="application/pdf,image/*"
                                                onChange={(e) => setResultFile(e.target.files?.[0] || null)} 
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" 
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Upload the Original Result, Admission Letter, or Slip.</p>
                                        </div>
                                    )}
                                    
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
                                        disabled={processing} 
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200"
                                    >
                                        {processing ? 'Processing...' : 'Complete & Send'}
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
                                        placeholder="Reason (e.g. Invalid Reg No)..." 
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
                                    <h3 className="text-2xl font-bold text-green-800">Completed</h3>
                                    <p className="text-green-600 text-sm mb-6">Process finished on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    {/* SHOW PROFILE CODE IF AVAILABLE */}
                                    {(selectedItem.responseData?.bvn || selectedItem.responseData?.number || selectedItem.responseData?.profile_code) && (
                                        <div className="bg-green-100 p-4 rounded-lg mb-4 w-full">
                                            <p className="text-xs text-green-600 uppercase font-bold mb-1">Retrieval Result</p>
                                            <p className="text-2xl font-mono font-bold text-green-900 tracking-widest">
                                                {selectedItem.responseData.bvn || selectedItem.responseData.number || selectedItem.responseData.profile_code}
                                            </p>
                                        </div>
                                    )}

                                    {/* SHOW DOWNLOAD IF AVAILABLE */}
                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center gap-2">
                                            <Download size={18} /> Download Document
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
