'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileBadge, CheckCircle2, XCircle, RefreshCw, AlertTriangle 
} from 'lucide-react';

export default function AdminNinValidationQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Action States
  const [processing, setProcessing] = useState(false);
  const [resultText, setResultText] = useState('Validation Successful'); 
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundMode, setRefundMode] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const [refundAmount, setRefundAmount] = useState<string>('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('NIN_VALIDATION_'));
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

  // Update Refund Amount
  useEffect(() => {
    if (selectedItem) {
        const cost = Number(selectedItem.cost);
        if (refundMode === 'FULL') setRefundAmount(cost.toString());
        if (refundMode === 'NONE') setRefundAmount('0');
    }
  }, [refundMode, selectedItem]);

  const handleApprove = async () => {
    if(!confirm("Mark validation as valid/completed?")) return;
    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { 
            success: true, 
            message: resultText // e.g. "Record Validated"
        }
      });
      alert("Completed!");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Enter reason.");
    const amount = Number(refundAmount);
    if (amount > Number(selectedItem.cost)) return alert("Refund too high.");
    
    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'REJECT',
        rejection_reason: rejectionReason,
        refund_amount: amount
      });
      alert("Rejected.");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed.");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setRejectionReason('');
    setRefundMode('FULL');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileBadge className="w-8 h-8 text-indigo-600" /> NIN Validation Queue
        </h1>
        <button onClick={fetchQueue} className="p-2 bg-gray-100 rounded-full"><RefreshCw className="w-5 h-5" /></button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">NIN</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-indigo-600 font-medium">{item.serviceType.replace('NIN_VALIDATION_', '')}</td>
                <td className="px-6 py-4 font-mono">{item.requestData?.nin}</td>
                <td className="px-6 py-4 text-gray-500">{item.user.firstName} ({item.user.businessName})</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold">Process</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-lg">Process Validation</h3>
               <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="bg-indigo-50 p-4 rounded border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase">NIN to Validate</p>
                <p className="text-2xl font-mono font-bold">{selectedItem.requestData?.nin}</p>
                <p className="text-sm mt-1 text-gray-600">Type: {selectedItem.serviceType}</p>
            </div>

            <div className="space-y-4">
                {/* Approve */}
                <div className="border p-4 rounded bg-green-50 border-green-200">
                    <label className="text-xs font-bold text-green-700 block mb-1">Success Message</label>
                    <input value={resultText} onChange={e => setResultText(e.target.value)} className="w-full p-2 border rounded text-sm mb-2" />
                    <button onClick={handleApprove} disabled={processing} className="w-full py-2 bg-green-600 text-white rounded font-bold text-sm">Mark as Validated</button>
                </div>

                {/* Reject */}
                <div className="border p-4 rounded bg-red-50 border-red-200">
                    <label className="text-xs font-bold text-red-700 block mb-1">Rejection Reason</label>
                    <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded text-sm mb-2" placeholder="e.g. Invalid NIN" />
                    
                    <div className="flex gap-2 mb-2">
                        <button onClick={() => setRefundMode('FULL')} className={`flex-1 py-1 text-xs rounded ${refundMode === 'FULL' ? 'bg-red-600 text-white' : 'bg-white border'}`}>Full Refund</button>
                        <button onClick={() => setRefundMode('NONE')} className={`flex-1 py-1 text-xs rounded ${refundMode === 'NONE' ? 'bg-gray-600 text-white' : 'bg-white border'}`}>No Refund</button>
                    </div>
                    
                    <button onClick={handleReject} disabled={processing} className="w-full py-2 bg-red-600 text-white rounded font-bold text-sm">Reject Request</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
