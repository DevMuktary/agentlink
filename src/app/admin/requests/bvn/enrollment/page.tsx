'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Smartphone, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, MapPin, CreditCard 
} from 'lucide-react';

export default function AdminEnrollmentQueue() {
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
      const logs = res.data.filter((r: any) => r.serviceType === 'ANDROID_BVN_ENROLLMENT');
      setRequests(logs);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async () => {
    if(!confirm("Confirm Enrollment Processed?")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { success: true, message: 'Enrollment Data Submitted to NIBSS' }
      });
      alert("Marked Successful!");
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
          <Smartphone className="w-8 h-8 text-fuchsia-600" /> Android Enrollment
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
              <th className="px-6 py-4">Agent Wallet ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-mono text-fuchsia-600">{item.requestData?.parkway_wallet_id}</td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{item.requestData?.first_name} {item.requestData?.last_name}</td>
                <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">PENDING</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-fuchsia-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-fuchsia-700">View Data</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6 space-y-6 my-10">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Enrollment Data</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4 text-sm h-96 overflow-y-auto pr-2">
                {/* Personal Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-bold text-gray-500 mb-2 uppercase text-xs flex items-center gap-2"><User className="w-3 h-3"/> Personal</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <p><b>Name:</b> {selectedItem.requestData?.first_name} {selectedItem.requestData?.last_name}</p>
                        <p><b>DOB:</b> {selectedItem.requestData?.date_of_birth}</p>
                        <p><b>Phone:</b> {selectedItem.requestData?.phone_number}</p>
                        <p><b>Email:</b> {selectedItem.requestData?.email}</p>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-bold text-gray-500 mb-2 uppercase text-xs flex items-center gap-2"><CreditCard className="w-3 h-3"/> Banking</h4>
                    <p><b>Bank:</b> {selectedItem.requestData?.bank_name}</p>
                    <p><b>Account:</b> {selectedItem.requestData?.account_number} ({selectedItem.requestData?.account_name})</p>
                    <p><b>BVN:</b> {selectedItem.requestData?.bvn}</p>
                    <p><b>Wallet ID:</b> {selectedItem.requestData?.parkway_wallet_id}</p>
                </div>

                {/* Location Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                    <h4 className="font-bold text-gray-500 mb-2 uppercase text-xs flex items-center gap-2"><MapPin className="w-3 h-3"/> Location</h4>
                    <p><b>Address:</b> {selectedItem.requestData?.home_address}</p>
                    <p><b>State/LGA:</b> {selectedItem.requestData?.state_of_residence} / {selectedItem.requestData?.local_government}</p>
                    <p><b>Senatorial:</b> {selectedItem.requestData?.senatorial_district}</p>
                    <p><b>Agent Loc:</b> {selectedItem.requestData?.agent_location}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={handleApprove} disabled={processing} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition">
                    Confirm Submission
                </button>
                
                <div className="space-y-2">
                    <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Reason..." />
                    <div className="flex gap-2">
                        <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-20 p-2 border rounded text-sm" placeholder="Refund ₦" />
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
