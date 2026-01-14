'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  GraduationCap, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, FileText, Type 
} from 'lucide-react';

export default function AdminJambQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState(''); // Base64 PDF
  const [profileCode, setProfileCode] = useState(''); // Text Code
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => r.serviceType.startsWith('JAMB_'));
      setRequests(logs);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async () => {
    // Validation based on type
    const isRetrieval = selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL';
    if (isRetrieval && !profileCode) return alert("Enter the Profile Code.");
    if (!isRetrieval && !resultFile) return alert("Upload the Document PDF (Base64).");

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: isRetrieval 
            ? { profile_code: profileCode } 
            : { document_base64: resultFile }
      });
      alert("Sent!");
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
    setResultFile('');
    setProfileCode('');
    setRejectionReason('');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <GraduationCap className="w-8 h-8 text-green-600" /> JAMB Queue
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
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Candidate / Info</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-green-700 dark:text-green-400 font-bold text-xs uppercase">
                    {item.serviceType.replace('JAMB_', '').replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 font-mono text-gray-500">
                    {item.requestData?.reg_number_or_profile || item.requestData?.phone_number || 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-green-700">Process</button>
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
              <h3 className="font-bold text-lg">Process Request</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            {/* INFO */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm space-y-1">
                {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                    <>
                        <p><b>Reg No:</b> {selectedItem.requestData?.reg_number}</p>
                        <p><b>Phone:</b> {selectedItem.requestData?.phone_number}</p>
                        <p><b>Email:</b> {selectedItem.requestData?.email}</p>
                    </>
                ) : (
                    <>
                        <p><b>Name:</b> {selectedItem.requestData?.full_name}</p>
                        <p><b>Reg/Profile:</b> {selectedItem.requestData?.reg_number_or_profile}</p>
                        <p><b>Year:</b> {selectedItem.requestData?.year}</p>
                    </>
                )}
            </div>

            {/* ACTION */}
            <div className="bg-green-50 p-4 rounded border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                </h4>
                
                {selectedItem.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL' ? (
                    <div>
                        <label className="text-xs font-bold text-green-700 block mb-1">Enter Profile Code</label>
                        <input value={profileCode} onChange={e => setProfileCode(e.target.value)} className="w-full p-2 border rounded font-mono text-center text-lg tracking-widest" placeholder="XYZ12345" />
                    </div>
                ) : (
                    <div>
                        <label className="text-xs font-bold text-green-700 block mb-1">Upload Document (Base64 PDF)</label>
                        <textarea value={resultFile} onChange={e => setResultFile(e.target.value)} className="w-full h-16 p-2 border rounded text-xs font-mono" placeholder="Paste Base64..." />
                    </div>
                )}

                <button onClick={handleApprove} disabled={processing} className="w-full mt-3 py-2 bg-green-600 text-white rounded font-bold">Complete</button>
            </div>

            <div className="border-t pt-4">
                <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border rounded mb-2 text-sm" placeholder="Rejection Reason..." />
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">Refund ₦</span>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-20 p-1 border rounded text-sm" placeholder={selectedItem.cost} />
                    <button onClick={handleReject} disabled={processing} className="flex-1 py-2 bg-red-600 text-white rounded font-bold text-sm">Reject</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
