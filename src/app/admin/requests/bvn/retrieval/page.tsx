'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Search, XCircle, RefreshCw, AlertTriangle, 
  Smartphone, FileText, CheckCircle2 
} from 'lucide-react';

export default function AdminBvnRetrievalQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [retrievedBvn, setRetrievedBvn] = useState('');
  
  // Rejection States
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundMode, setRefundMode] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const [refundAmount, setRefundAmount] = useState<string>('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => 
        r.serviceType.startsWith('BVN_RETRIEVAL_') && r.status === 'PROCESSING'
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
    if (retrievedBvn.length !== 11) return alert("Please enter a valid 11-digit BVN.");
    
    if(!confirm(`Confirm BVN: ${retrievedBvn}? This will be sent to the user.`)) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { 
            success: true,
            bvn: retrievedBvn,
            message: "BVN Retrieved Successfully"
        }
      });
      alert("Sent Successfully!");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed to send BVN.");
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
      alert("Request Rejected.");
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
    setRetrievedBvn('');
    setRejectionReason('');
    setRefundMode('FULL');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Search className="w-8 h-8 text-sky-600" /> BVN Retrieval Queue
        </h1>
        <button onClick={fetchQueue} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Input Data</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending retrieval requests.</td></tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {item.serviceType === 'BVN_RETRIEVAL_PHONE' ? (
                      <span className="flex items-center gap-1 text-blue-600 font-medium"><Smartphone className="w-4 h-4" /> By Phone</span>
                    ) : (
                      <span className="flex items-center gap-1 text-purple-600 font-medium"><FileText className="w-4 h-4" /> CRM Ticket</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                    {item.requestData?.phone_number || item.requestData?.ticket_id}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedItem(item)} className="bg-sky-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-sky-700 transition">
                      Process
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 space-y-6 my-10">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Retrieve BVN</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4">
              {/* Request Data Display */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2">
                 {selectedItem.serviceType === 'BVN_RETRIEVAL_PHONE' ? (
                    <>
                      <p><span className="text-gray-500 block text-xs uppercase">Phone Number</span> <span className="font-mono text-lg font-bold">{selectedItem.requestData?.phone_number}</span></p>
                      <p><span className="text-gray-500 block text-xs uppercase">Full Name</span> <span className="font-medium">{selectedItem.requestData?.full_name || 'N/A'}</span></p>
                    </>
                 ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <p><span className="text-gray-500 block text-xs uppercase">Ticket ID</span> <span className="font-mono font-bold">{selectedItem.requestData?.ticket_id}</span></p>
                        <p><span className="text-gray-500 block text-xs uppercase">Agent Code</span> <span className="font-mono font-bold">{selectedItem.requestData?.agent_code}</span></p>
                        <p><span className="text-gray-500 block text-xs uppercase">BMS Ticket</span> <span className="font-mono font-bold">{selectedItem.requestData?.bms_ticket}</span></p>
                      </div>
                      
                      {/* Screenshot Display */}
                      {selectedItem.requestData?.screenshot && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 uppercase mb-1">Enrollment Screenshot</p>
                            <div className="border rounded-lg overflow-hidden bg-black">
                                <img 
                                  src={selectedItem.requestData.screenshot.startsWith('data:') 
                                        ? selectedItem.requestData.screenshot 
                                        : `data:image/jpeg;base64,${selectedItem.requestData.screenshot}`} 
                                  className="w-full h-auto max-h-64 object-contain"
                                  alt="Screenshot" 
                                />
                            </div>
                        </div>
                      )}
                    </>
                 )}
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* APPROVE: Enter BVN */}
              <div className="bg-green-50 p-4 rounded border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> BVN Found
                  </h4>
                  <label className="text-xs font-bold text-green-700 block mb-1">Enter Retrieved BVN</label>
                  <input 
                    value={retrievedBvn} 
                    onChange={e => setRetrievedBvn(e.target.value)} 
                    className="w-full p-3 border border-green-300 rounded font-mono text-xl tracking-[0.2em] text-center bg-white outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="12345678901" 
                    maxLength={11} 
                  />
                  <button 
                    onClick={handleApprove} 
                    disabled={processing} 
                    className="w-full mt-3 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition"
                  >
                    {processing ? 'Sending...' : 'Complete & Send to User'}
                  </button>
              </div>

              {/* REJECT: Refund Controls */}
              <div className="bg-red-50 p-4 rounded border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Reject Request
                  </h4>
                  
                  <div className="mb-3">
                      <input 
                          type="text" 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="w-full p-2 text-sm border border-red-200 rounded bg-white outline-none focus:ring-1 focus:ring-red-500"
                      />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => setRefundMode('FULL')} className={`px-2 py-1 text-xs font-bold rounded ${refundMode === 'FULL' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Full</button>
                      <button onClick={() => setRefundMode('NONE')} className={`px-2 py-1 text-xs font-bold rounded ${refundMode === 'NONE' ? 'bg-gray-600 text-white' : 'bg-white border'}`}>None</button>
                      
                      <div className="flex items-center bg-white border rounded px-2 w-full">
                        <span className="text-xs text-gray-500">₦</span>
                        <input 
                            type="number"
                            value={refundAmount}
                            onChange={(e) => { setRefundMode('PARTIAL'); setRefundAmount(e.target.value); }}
                            className="w-full p-1 text-sm outline-none"
                            placeholder="Partial Amt"
                        />
                      </div>
                  </div>

                  <button 
                    onClick={handleReject} 
                    disabled={processing} 
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm transition"
                  >
                    Reject & Refund
                  </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
