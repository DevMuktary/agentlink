'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Smartphone, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, MapPin, CreditCard
} from 'lucide-react';

export default function AdminBvnUserQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // Action States
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Refund Control
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [shouldRefund, setShouldRefund] = useState(true);

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all?service=ANDROID_BVN_ENROLLMENT&status=ALL'); 
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

  // Set default refund amount when item is opened
  useEffect(() => {
    if (selectedItem) {
        setRefundAmount(selectedItem.cost.toString());
    }
  }, [selectedItem]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Onboarding Successful'));
      
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
    setRejectionReason('');
    setAdminNote('');
    setShouldRefund(true);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Smartphone className="w-8 h-8 text-teal-600" /> BVN User Enrollment
            </h1>
            <p className="text-slate-500 text-sm mt-1">NIBSS Agent Onboarding Requests</p>
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
                <th className="px-6 py-4 font-medium">Applicant Name</th>
                <th className="px-6 py-4 font-medium">Parkway ID</th>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                            {item.requestData?.first_name} {item.requestData?.last_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">
                            {item.requestData?.parkway_wallet_id || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{item.user?.firstName} {item.user?.lastName}</span>
                                <span className="text-xs text-slate-400">{item.user?.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {item.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Approved</span>}
                            {item.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><XCircle size={12}/> Rejected</span>}
                            {item.status === 'PROCESSING' && <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
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
          <div className="bg-white rounded-xl max-w-6xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div>
                  <h3 className="font-bold text-xl text-slate-900">
                      {selectedItem.status === 'PROCESSING' ? 'Process Agent Onboarding' : 'Request Details'}
                  </h3>
                  <p className="text-slate-500 text-xs">Ref: {selectedItem.requestData?.reference || 'N/A'} | ID: {selectedItem.id}</p>
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: DATA */}
                <div className="lg:col-span-2 space-y-6 text-sm h-full overflow-y-auto pr-2">
                    
                    {/* 1. AGENT INFO */}
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

                    {/* 2. APPLICANT DETAILS */}
                    <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-teal-200 pb-2">
                            <User size={16} className="text-teal-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Applicant Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">First Name</span> <span className="text-slate-900">{selectedItem.requestData?.first_name}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Last Name</span> <span className="text-slate-900 font-bold">{selectedItem.requestData?.last_name}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Date of Birth</span> <span className="text-slate-900">{selectedItem.requestData?.date_of_birth}</span></p>
                            
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Phone</span> <span className="text-slate-900">{selectedItem.requestData?.phone_number}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Email</span> <span className="text-slate-900">{selectedItem.requestData?.email}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">BVN</span> <span className="text-slate-900 font-mono bg-teal-100 px-2 rounded">{selectedItem.requestData?.bvn}</span></p>
                        </div>
                    </div>

                    {/* 3. PARKWAY & BANKING */}
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-purple-200 pb-2">
                            <CreditCard size={16} className="text-purple-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Banking & Wallet</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Parkway Wallet ID</span> <span className="text-slate-900 font-bold font-mono">{selectedItem.requestData?.parkway_wallet_id}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Bank Name</span> <span className="text-slate-900">{selectedItem.requestData?.bank_name}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Account Number</span> <span className="text-slate-900 font-mono">{selectedItem.requestData?.account_number}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Account Name</span> <span className="text-slate-900">{selectedItem.requestData?.account_name}</span></p>
                        </div>
                    </div>

                    {/* 4. ADDRESS & LOCATION */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                            <MapPin size={16} className="text-slate-600" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Location Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                            <p className="md:col-span-2"><span className="text-slate-600 text-xs uppercase block font-semibold">Home Address</span> <span className="text-slate-900">{selectedItem.requestData?.home_address}</span></p>
                            <p className="md:col-span-2"><span className="text-slate-600 text-xs uppercase block font-semibold">Agent Location</span> <span className="text-slate-900">{selectedItem.requestData?.agent_location}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">State of Residence</span> <span className="text-slate-900">{selectedItem.requestData?.state_of_residence}</span></p>
                            <p><span className="text-slate-600 text-xs uppercase block font-semibold">Local Govt</span> <span className="text-slate-900">{selectedItem.requestData?.local_government}</span></p>
                            <p className="md:col-span-2"><span className="text-slate-600 text-xs uppercase block font-semibold">Senatorial District</span> <span className="text-slate-900">{selectedItem.requestData?.senatorial_district}</span></p>
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
                                    <CheckCircle2 className="text-green-600" size={20} /> Approve & Onboard
                                </h4>
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                        Confirming this action marks the agent as successfully onboarded to NIBSS.
                                    </p>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Admin Note (Optional)</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                            placeholder="e.g. Account Created Successfully" 
                                            rows={3} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing} 
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200"
                                    >
                                        {processing ? 'Processing...' : 'Confirm Approval'}
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
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Original Cost: ₦{Number(selectedItem.cost).toLocaleString()}
                                                </p>
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
                                    <h3 className="text-2xl font-bold text-green-800">Agent Onboarded</h3>
                                    <p className="text-green-600 text-sm mb-6">Completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    <div className="mt-4 p-3 bg-white/60 rounded border border-green-200 text-xs text-green-800">
                                        <strong>Admin Note:</strong> {selectedItem.adminNote}
                                    </div>
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
