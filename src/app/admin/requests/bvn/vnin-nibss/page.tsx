'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  ArrowRightLeft, CheckCircle2, XCircle, RefreshCw, AlertTriangle 
} from 'lucide-react';

export default function AdminVninNibssQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => r.serviceType === 'VNIN_TO_NIBSS');
      setRequests(logs);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async () => {
    if(!confirm("Confirm NIBSS Submission?")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { success: true, message: 'Sent to NIBSS successfully' }
      });
      alert("Completed!");
      closeModal();
      fetchQueue();
    } catch (e) { alert("Error"); }
    finally { setProcessing(false); }
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
    } catch(e) { alert("Error"); }
    finally { setProcessing(false); }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setRejectionReason('');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <ArrowRightLeft className="w-8 h-8 text-violet-600" /> VNIN to NIBSS Queue
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
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-mono text-violet-600 font-bold">{item.requestData?.ticket_id}</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{item.requestData?.full_name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-violet-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-violet-700 transition">Process</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Validation Request</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded text-sm space-y-2">
                <p><b>Ticket ID:</b> <span className="font-mono text-lg">{selectedItem.requestData?.ticket_id}</span></p>
                <p><b>Name:</b> {selectedItem.requestData?.full_name}</p>
                <p><b>NIN:</b> {selectedItem.requestData?.nin}</p>
                <p><b>BVN:</b> {selectedItem.requestData?.bvn}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
                <button onClick={handleApprove} disabled={processing} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition">
                    Mark Successfully Sent
                </button>
                
                <div className="bg-red-50 p-3 rounded border border-red-100">
                    <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded text-sm mb-2" placeholder="Rejection Reason..." />
                    <div className="flex gap-2">
                        <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-24 p-2 border rounded text-sm" placeholder="Refund ₦" />
                        <button onClick={handleReject} disabled={processing} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm transition">Reject</button>
                    </div>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
