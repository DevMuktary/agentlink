'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileCog, CheckCircle2, XCircle, Search, 
  Eye, Download, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function AdminNinModQueue() {
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
      const logs = res.data.filter((r: any) => 
        r.serviceType.startsWith('NIN_MODIFICATION_') && r.status === 'PROCESSING'
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
        // Partial leaves it as is or clears it for input
    }
  }, [refundMode, selectedItem]);

  // --- ACTIONS ---
  const handleApprove = async () => {
    if (!resultImage) return alert("Please paste the Base64 Image string.");
    if(!confirm("Mark job as complete?")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { image: resultImage } 
      });
      alert("Success!");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed to approve.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Enter a rejection reason.");
    const amount = Number(refundAmount);
    
    if (amount > Number(selectedItem.cost)) {
        return alert(`Refund cannot exceed original cost (₦${selectedItem.cost})`);
    }
    
    if(!confirm(`Reject request? Refund: ₦${amount}`)) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'REJECT',
        rejection_reason: rejectionReason,
        refund_amount: amount
      });
      alert("Processed!");
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
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileCog className="w-8 h-8 text-teal-600" /> NIN Modification Queue
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
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No pending requests.</td></tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {item.serviceType.replace('NIN_MODIFICATION_', '')}
                  </td>
                  <td className="px-6 py-4 font-mono">₦{item.cost}</td>
                  <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">PENDING</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedItem(item)} className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-xs font-bold">
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
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-lg">Process Request</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* DATA VIEW */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <span className="block text-xs text-gray-400">NIN Number</span>
                    <span className="font-mono font-bold text-lg">{selectedItem.requestData?.nin}</span>
                 </div>
                 <div className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <span className="block text-xs text-gray-400">Paid Amount</span>
                    <span className="font-mono font-bold text-lg text-green-600">₦{selectedItem.cost}</span>
                 </div>
                 
                 {/* Specific Fields */}
                 <div className="col-span-2 p-4 bg-blue-50 border border-blue-100 rounded text-blue-900">
                    <p className="font-bold mb-2">Requested Changes:</p>
                    {selectedItem.serviceType === 'NIN_MODIFICATION_NAME' && (
                        <p>New Name: <b>{selectedItem.requestData?.new_details?.first_name} {selectedItem.requestData?.new_details?.surname}</b></p>
                    )}
                    {selectedItem.serviceType === 'NIN_MODIFICATION_PHONE' && (
                        <p>New Phone: <b>{selectedItem.requestData?.new_phone_number}</b></p>
                    )}
                    {selectedItem.serviceType === 'NIN_MODIFICATION_ADDRESS' && (
                        <p>New Address: <b>{selectedItem.requestData?.new_address}</b></p>
                    )}
                 </div>
              </div>

              {/* ACTION AREA */}
              <div className="border-t pt-6 space-y-8">
                 
                 {/* APPROVE */}
                 <div className="bg-green-50 p-4 rounded border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Approve Request</h4>
                    <label className="block text-xs font-medium mb-1 text-green-700">Result Image (Base64)</label>
                    <textarea 
                        value={resultImage}
                        onChange={(e) => setResultImage(e.target.value)}
                        placeholder="Paste result Base64 string here..."
                        className="w-full h-16 p-2 text-xs font-mono border rounded bg-white focus:ring-2 focus:ring-green-500 outline-none mb-2"
                    ></textarea>
                    <button 
                        onClick={handleApprove} 
                        disabled={processing}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold disabled:opacity-50 text-sm"
                    >
                        {processing ? 'Processing...' : 'Complete Job'}
                    </button>
                 </div>

                 {/* REJECT */}
                 <div className="bg-red-50 p-4 rounded border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Reject Request
                    </h4>
                    
                    {/* Reason Input */}
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-red-700 mb-1">Reason</label>
                        <input 
                            type="text" 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Why is this rejected?"
                            className="w-full p-2 text-sm border border-red-200 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>

                    {/* Refund Controls */}
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-red-700 mb-2">Refund Decision</label>
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setRefundMode('FULL')} className={`flex-1 py-1 text-xs font-bold rounded ${refundMode === 'FULL' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}>Full</button>
                            <button onClick={() => setRefundMode('PARTIAL')} className={`flex-1 py-1 text-xs font-bold rounded ${refundMode === 'PARTIAL' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}>Partial</button>
                            <button onClick={() => setRefundMode('NONE')} className={`flex-1 py-1 text-xs font-bold rounded ${refundMode === 'NONE' ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 border'}`}>None</button>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white p-2 rounded border">
                            <span className="text-gray-500 text-sm">₦</span>
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
                        <p className="text-xs text-red-400 mt-1 text-right">Max Refund: ₦{selectedItem.cost}</p>
                    </div>

                    <button 
                        onClick={handleReject} 
                        disabled={processing}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold disabled:opacity-50 text-sm"
                    >
                        {processing ? 'Processing...' : 'Reject & Apply Refund'}
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
