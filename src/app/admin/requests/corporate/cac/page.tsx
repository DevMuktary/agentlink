'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Building2, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, Download, FileText 
} from 'lucide-react';

export default function AdminCacQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // CAC Specific Outputs
  const [certImage, setCertImage] = useState(''); // Base64
  const [reportImage, setReportImage] = useState(''); // Base64
  
  // Rejection
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all'); 
      const logs = res.data.filter((r: any) => r.serviceType === 'CAC_REGISTRATION');
      setRequests(logs);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async () => {
    if (!certImage || !reportImage) return alert("Both Certificate and Status Report (Base64) are required.");
    
    if(!confirm("Mark Registration as Successful?")) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/requests/action', {
        request_id: selectedItem.id,
        action: 'APPROVE',
        response_data: { 
            certificate_base64: certImage,
            status_report_base64: reportImage
        }
      });
      alert("Completed Successfully!");
      closeModal();
      fetchQueue();
    } catch (e) {
      alert("Failed to complete.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Enter rejection reason.");
    const amount = Number(refundAmount);
    if (amount > Number(selectedItem.cost)) return alert("Refund exceeds cost.");

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
    } catch (e) { alert("Error."); }
    finally { setProcessing(false); }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCertImage('');
    setReportImage('');
    setRejectionReason('');
    setRefundAmount('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Building2 className="w-8 h-8 text-orange-600" /> CAC Registration Queue
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
              <th className="px-6 py-4">Business Name (Proposed)</th>
              <th className="px-6 py-4">Proprietor</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-orange-700 dark:text-orange-400">
                    {item.requestData?.business_details?.proposed_name_1}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {item.requestData?.proprietor_details?.firstname} {item.requestData?.proprietor_details?.surname}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedItem(item)} className="bg-orange-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-orange-700">
                    Process
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full p-6 space-y-6 my-10">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-bold text-lg">Process CAC Application</h3>
              <button onClick={closeModal}><XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT: APPLICATION DATA */}
                <div className="space-y-4 text-sm h-96 overflow-y-auto pr-2">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded border border-orange-100">
                        <h4 className="font-bold text-orange-800 mb-2 uppercase text-xs">Business Details</h4>
                        <p><b>Name 1:</b> {selectedItem.requestData?.business_details?.proposed_name_1}</p>
                        <p><b>Name 2:</b> {selectedItem.requestData?.business_details?.proposed_name_2}</p>
                        <p><b>Nature:</b> {selectedItem.requestData?.business_details?.nature_of_business}</p>
                        <p><b>Address:</b> {selectedItem.requestData?.business_details?.address}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                        <h4 className="font-bold text-gray-500 mb-2 uppercase text-xs">Proprietor</h4>
                        <p><b>Name:</b> {selectedItem.requestData?.proprietor_details?.firstname} {selectedItem.requestData?.proprietor_details?.surname}</p>
                        <p><b>NIN:</b> {selectedItem.requestData?.proprietor_details?.nin}</p>
                        <p><b>Phone:</b> {selectedItem.requestData?.proprietor_details?.phone}</p>
                        <p><b>Email:</b> {selectedItem.requestData?.proprietor_details?.email}</p>
                    </div>

                    {/* Documents Preview */}
                    <div className="grid grid-cols-2 gap-2">
                        {selectedItem.requestData?.documents?.passport_photo && (
                            <div className="bg-gray-100 p-2 rounded text-center">
                                <img src={selectedItem.requestData.documents.passport_photo} className="h-20 mx-auto" />
                                <span className="text-xs text-gray-500">Passport</span>
                            </div>
                        )}
                        {selectedItem.requestData?.documents?.signature && (
                            <div className="bg-gray-100 p-2 rounded text-center">
                                <img src={selectedItem.requestData.documents.signature} className="h-20 mx-auto" />
                                <span className="text-xs text-gray-500">Signature</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="space-y-6">
                    {/* Approve Section */}
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Registration Successful
                        </h4>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-green-700 mb-1">CAC Certificate (Base64)</label>
                                <input value={certImage} onChange={e => setCertImage(e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="Paste Base64..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-green-700 mb-1">Status Report (Base64)</label>
                                <input value={reportImage} onChange={e => setReportImage(e.target.value)} className="w-full p-2 border rounded text-xs" placeholder="Paste Base64..." />
                            </div>
                        </div>

                        <button onClick={handleApprove} disabled={processing} className="w-full mt-4 py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-700">
                            {processing ? 'Uploading...' : 'Complete & Send Files'}
                        </button>
                    </div>

                    {/* Reject Section */}
                    <div className="bg-red-50 p-4 rounded border border-red-200">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Decline Application
                        </h4>
                        <input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-2 border border-red-200 rounded mb-2 text-sm" placeholder="Reason..." />
                        
                        <div className="flex items-center bg-white border border-red-200 rounded px-2 w-full mb-2">
                            <span className="text-xs text-gray-500 font-bold">Ref: ₦</span>
                            <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full p-2 text-sm outline-none" placeholder={`Max: ${selectedItem.cost}`} />
                        </div>

                        <button onClick={handleReject} disabled={processing} className="w-full py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700">
                            Reject
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
