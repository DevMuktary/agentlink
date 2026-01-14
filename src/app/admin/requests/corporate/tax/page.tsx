'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileText, CheckCircle2, XCircle, RefreshCw, AlertTriangle, User, Building 
} from 'lucide-react';

export default function AdminTaxQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  
  const [taxId, setTaxId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('TAX_ID_'));
      setRequests(logs);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async () => {
    if (!taxId || taxId.length < 5) return alert("Enter valid Tax ID.");
    if(!confirm("Submit Tax ID?")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { tax_id: taxId }
      });
      alert("Sent!");
      closeModal();
      fetchQueue();
    } catch(e) { alert("Error"); }
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
    setTaxId('');
    setRejectionReason('');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <FileText className="w-8 h-8 text-indigo-600" /> Tax ID Queue
        </h1>
        <button onClick={fetchQueue} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Name/Business</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    {item.serviceType === 'TAX_ID_INDIVIDUAL' ? <span className="flex gap-1 text-blue-600"><User className="w-4 h-4"/> Individual</span> : <span className="flex gap-1 text-purple-600"><Building className="w-4 h-4"/> Corporate</span>}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                    {item.requestData?.first_name ? `${item.requestData.first_name} ${item.requestData.surname}` : item.requestData?.business_name}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-indigo-700">Process</button>
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
              <h3 className="font-bold text-lg">Generate Tax ID</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded text-sm space-y-2">
                {selectedItem.serviceType === 'TAX_ID_INDIVIDUAL' ? (
                    <>
                        <p><b>Applicant:</b> {selectedItem.requestData?.first_name} {selectedItem.requestData?.surname}</p>
                        <p><b>DOB:</b> {selectedItem.requestData?.dob}</p>
                        <p><b>NIN:</b> {selectedItem.requestData?.nin}</p>
                    </>
                ) : (
                    <>
                        <p><b>Business:</b> {selectedItem.requestData?.business_name}</p>
                        <p><b>RC Number:</b> {selectedItem.requestData?.rc_number}</p>
                    </>
                )}
            </div>

            <div className="bg-green-50 p-4 rounded border border-green-200">
                <label className="text-xs font-bold text-green-700 block mb-1">Generated Tax ID</label>
                <input value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full p-3 border border-green-300 rounded font-mono text-xl tracking-widest text-center" placeholder="XXXXXXXXXXXXX" />
                <button onClick={handleApprove} disabled={processing} className="w-full mt-3 py-2 bg-green-600 text-white rounded font-bold">Confirm & Send</button>
            </div>

            <div className="border-t pt-4">
                <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded mb-2 text-sm" placeholder="Rejection Reason..." />
                <div className="flex items-center bg-white border rounded px-2 w-full mb-2">
                    <span className="text-xs text-gray-500">Refund ₦</span>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full p-2 text-sm outline-none" placeholder={selectedItem.cost} />
                </div>
                <button onClick={handleReject} disabled={processing} className="w-full py-2 bg-red-600 text-white rounded font-bold text-sm">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
