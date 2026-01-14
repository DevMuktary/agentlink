'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileCog, CheckCircle2, XCircle, Search, 
  Eye, RefreshCw, AlertTriangle 
} from 'lucide-react';

export default function AdminBvnModQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Action States
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState('');
  
  // Rejection States
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundMode, setRefundMode] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const [refundAmount, setRefundAmount] = useState<string>('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      // Filter for BVN Modification Services
      const logs = res.data.filter((r: any) => 
        r.serviceType.startsWith('BVN_MOD_') && r.status === 'PROCESSING'
      );
      setRequests(logs);
    } catch (error) {
      console.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Update Refund Amount when Mode changes
  useEffect(() => {
    if (selectedItem) {
        const cost = Number(selectedItem.cost);
        if (refundMode === 'FULL') setRefundAmount(cost.toString());
        if (refundMode === 'NONE') setRefundAmount('0');
    }
  }, [refundMode, selectedItem]);

  // --- ACTIONS ---
  const handleApprove = async () => {
    if (!resultImage) return alert("Please paste the Base64 Image string of the modified slip.");
    
    if(!confirm("Are you sure? This will mark the job complete and send the image to the user.")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { image: resultImage } 
      });
      alert("Success! Request Completed.");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed to approve request.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Please enter a reason for rejection.");
    const amount = Number(refundAmount);
    
    if (amount > Number(selectedItem.cost)) {
        return alert(`Refund cannot exceed original cost (₦${selectedItem.cost})`);
    }
    
    if(!confirm(`Reject request? Refund Amount: ₦${amount}`)) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'REJECT',
        rejection_reason: rejectionReason,
        refund_amount: amount
      });
      alert("Request Rejected & Wallet Updated.");
      closeModal();
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to reject.");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setResultImage('');
    setRejectionReason('');
    setRefundMode('FULL');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileCog className="w-8 h-8 text-blue-600" /> BVN Modification Queue
        </h1>
        <button onClick={fetchQueue} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Bank</th>
              <th className="px-6 py-4">Service Type</th>
              <th className="px-6 py-4">BVN</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No pending BVN modifications.</td></tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                    {item.requestData?.bank_name}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {item.serviceType.replace('BVN_MOD_', '').replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500">{item.requestData?.bvn}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedItem(item)} className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-xs font-bold transition">
                      Process
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PROCESS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                Modify BVN: <span className="text-blue-600">{selectedItem.requestData?.bank_name}</span>
              </h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                 <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">BVN Number</span>
                    <p className="font-mono text-xl font-bold">{selectedItem.requestData?.bvn}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase font-bold">Cost Paid</span>
                    <p className="font-mono text-xl font-bold text-green-600">₦{selectedItem.cost}</p>
                 </div>
              </div>

              {/* COMPARISON GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 {/* OLD DETAILS */}
                 <div className="bg-red-50 p-4 rounded border border-red-100">
                    <h4 className="font-bold text-red-700 mb-2 border-b border-red-200 pb-1 uppercase text-xs">Old Details (On BVN)</h4>
                    <div className="space-y-2">
                        <p><span className="text-gray-500 block text-xs">First Name</span> {selectedItem.requestData?.old_details?.first_name}</p>
                        <p><span className="text-gray-500 block text-xs">Surname</span> {selectedItem.requestData?.old_details?.surname}</p>
                        <p><span className="text-gray-500 block text-xs">Middle Name</span> {selectedItem.requestData?.old_details?.middle_name || '-'}</p>
                        <p><span className="text-gray-500 block text-xs">DOB</span> {selectedItem.requestData?.old_details?.dob}</p>
                    </div>
                 </div>

                 {/* NEW DETAILS */}
                 <div className="bg-green-50 p-4 rounded border border-green-100">
                    <h4 className="font-bold text-green-700 mb-2 border-b border-green-200 pb-1 uppercase text-xs">New Details (From NIN)</h4>
                    <div className="space-y-2">
                        <p><span className="text-gray-500 block text-xs">First Name</span> {selectedItem.requestData?.new_details?.first_name}</p>
                        <p><span className="text-gray-500 block text-xs">Surname</span> {selectedItem.requestData?.new_details?.surname}</p>
                        <p><span className="text-gray-500 block text-xs">Middle Name</span> {selectedItem.requestData?.new_details?.middle_name || '-'}</p>
                        <p><span className="text-gray-500 block text-xs">DOB</span> {selectedItem.requestData?.new_details?.dob}</p>
                    </div>
                 </div>
              </div>

              {/* Extra Field: New Phone */}
              {selectedItem.requestData?.new_phone_number && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-100 text-amber-900 font-medium text-center">
                      Requested New Phone Number: <span className="font-mono font-bold text-lg">{selectedItem.requestData.new_phone_number}</span>
                  </div>
              )}

              {/* ACTION AREA */}
              <div className="border-t pt-6 space-y-8">
                 
                 {/* APPROVE */}
                 <div className="bg-green-50 p-4 rounded border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Approve & Complete
                    </h4>
                    <label className="block text-xs font-medium mb-1 text-green-700">Upload Result Slip (Base64 String)</label>
                    <textarea 
                        value={resultImage}
                        onChange={(e) => setResultImage(e.target.value)}
                        placeholder="Paste the Base64 string of the processed document here..."
                        className="w-full h-24 p-3 text-xs font-mono border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none mb-3 resize-none"
                    ></textarea>
                    <button 
                        onClick={handleApprove} 
                        disabled={processing}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold disabled:opacity-50 text-sm transition"
                    >
                        {processing ? 'Processing...' : 'Mark Completed & Send Result'}
                    </button>
                 </div>

                 {/* REJECT */}
                 <div className="bg-red-50 p-4 rounded border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Reject Request
                    </h4>
                    
                    {/* Reason Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-red-700 mb-1">Rejection Reason</label>
                        <input 
                            type="text" 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Invalid NIN mismatch, Document blurry..."
                            className="w-full p-3 text-sm border border-red-200 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>

                    {/* Refund Controls */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-red-700 mb-2">Refund Decision</label>
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setRefundMode('FULL')} className={`flex-1 py-1 text-xs font-bold rounded transition ${refundMode === 'FULL' ? 'bg-red-600 text-white shadow' : 'bg-white text-gray-600 border'}`}>Full Refund</button>
                            <button onClick={() => setRefundMode('PARTIAL')} className={`flex-1 py-1 text-xs font-bold rounded transition ${refundMode === 'PARTIAL' ? 'bg-red-600 text-white shadow' : 'bg-white text-gray-600 border'}`}>Partial</button>
                            <button onClick={() => setRefundMode('NONE')} className={`flex-1 py-1 text-xs font-bold rounded transition ${refundMode === 'NONE' ? 'bg-gray-600 text-white shadow' : 'bg-white text-gray-600 border'}`}>No Refund</button>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-red-200">
                            <span className="text-gray-500 text-sm font-bold">₦</span>
                            <input 
                                type="number" 
                                value={refundAmount}
                                onChange={(e) => {
                                    setRefundMode('PARTIAL'); 
                                    setRefundAmount(e.target.value);
                                }}
                                className="w-full text-sm outline-none font-bold text-gray-700"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-red-500 mt-1 text-right font-medium">Max Refundable: ₦{selectedItem.cost}</p>
                    </div>

                    <button 
                        onClick={handleReject} 
                        disabled={processing}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold disabled:opacity-50 text-sm transition"
                    >
                        {processing ? 'Processing...' : 'Reject Request & Apply Refund'}
                    </button>
                 </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
