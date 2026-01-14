'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileCog, CheckCircle2, XCircle, Search, 
  Eye, Download, RefreshCw 
} from 'lucide-react';

export default function AdminNinModQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Action States
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Create a fetch-all-requests endpoint or filter locally for now
      // For best performance, make an endpoint: /api/admin/requests?type=NIN_MOD
      // Here we filter locally for MVP simplicity if you haven't built the filter API
      const res = await axios.get('/api/admin/requests/all'); // Need to create this GET endpoint
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

  // --- ACTIONS ---
  const handleApprove = async () => {
    if (!resultImage) return alert("Please paste the Base64 Image string of the result.");
    
    if(!confirm("Are you sure? This will mark the job complete.")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { image: resultImage } // User dashboard expects 'image' or 'url'
      });
      alert("Success!");
      setSelectedItem(null);
      fetchQueue();
    } catch (e) {
      alert("Failed to approve.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Please enter a reason for rejection.");
    
    if(!confirm("Reject and Refund? This cannot be undone.")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'REJECT',
        rejection_reason: rejectionReason
      });
      alert("Refunded!");
      setSelectedItem(null);
      fetchQueue();
    } catch (e) {
      alert("Failed to reject.");
    } finally {
      setProcessing(false);
    }
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
              <th className="px-6 py-4">NIN</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No pending requests. Good job!</td></tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">
                    {item.serviceType.replace('NIN_MODIFICATION_', '')}
                  </td>
                  <td className="px-6 py-4 font-mono">{item.requestData?.nin}</td>
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
              <button onClick={() => setSelectedItem(null)}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* DATA VIEW */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <span className="block text-xs text-gray-400">NIN Number</span>
                    <span className="font-mono font-bold text-lg">{selectedItem.requestData?.nin}</span>
                 </div>
                 <div className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <span className="block text-xs text-gray-400">Phone (Current)</span>
                    <span className="font-mono font-bold text-lg">{selectedItem.requestData?.phone_number}</span>
                 </div>
                 
                 {/* Specific Fields Display */}
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
              <div className="border-t pt-6">
                 <h4 className="font-bold mb-4">Complete Job</h4>
                 
                 {/* Approve Section */}
                 <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Result Image (Base64 String)</label>
                    <textarea 
                        value={resultImage}
                        onChange={(e) => setResultImage(e.target.value)}
                        placeholder="Paste the Base64 string of the modified slip here..."
                        className="w-full h-24 p-3 text-xs font-mono border rounded bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
                    ></textarea>
                    <button 
                        onClick={handleApprove} 
                        disabled={processing}
                        className="mt-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Approve & Send Result'}
                    </button>
                 </div>

                 <div className="flex items-center gap-4 my-4"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400">OR</span><div className="h-px bg-gray-200 flex-1"></div></div>

                 {/* Reject Section */}
                 <div>
                    <label className="block text-sm font-medium text-red-600 mb-1">Rejection Reason</label>
                    <input 
                        type="text" 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Image blurry, Invalid Date..."
                        className="w-full p-3 text-sm border border-red-200 rounded bg-red-50 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <button 
                        onClick={handleReject} 
                        disabled={processing}
                        className="mt-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold disabled:opacity-50"
                    >
                        {processing ? 'Refunding...' : 'Reject & Refund User'}
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
