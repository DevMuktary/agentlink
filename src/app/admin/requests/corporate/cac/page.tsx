'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalLoader from '@/components/GlobalLoader';

export default function AdminCACRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  // 1. Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests/all?service=CAC_REGISTRATION', {
        headers: { 'Authorization': `Bearer ${getCookie('token')}` } 
      });
      const data = await res.json();
      if (data.status) setRequests(data.data);
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // 2. Handle Action Submit (FormData)
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !actionType) return;

    setProcessing(true);
    try {
      // BUILD FORM DATA
      const formData = new FormData();
      formData.append('requestId', selectedRequest.id);
      formData.append('action', actionType);
      formData.append('note', adminNote);
      
      // ONLY APPEND FILE IF APPROVING
      if (actionType === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      // SEND TO API
      const res = await fetch('/api/admin/requests/action', {
        method: 'POST',
        body: formData, // Auto-sets Content-Type to multipart/form-data
      });

      const json = await res.json();

      if (json.status) {
        alert('Action Successful!');
        closeModal();
        fetchRequests(); // Refresh list
      } else {
        alert(json.error || 'Action Failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error');
    } finally {
      setProcessing(false);
    }
  };

  // Helper: Simple Cookie Getter
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setResultFile(null);
    setAdminNote('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CAC Registration Requests</h1>
      
      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
            <tr>
              <th className="px-6 py-3">Ref</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Business Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{req.requestData?.clientReference || req.id.slice(-6)}</td>
                <td className="px-6 py-4">{req.user?.email}</td>
                <td className="px-6 py-4">{req.requestData?.business_details?.proposed_name_1}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    req.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    req.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {req.status === 'PROCESSING' && (
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="text-blue-600 hover:underline"
                    >
                      Process
                    </button>
                  )}
                  {req.status === 'COMPLETED' && req.responseData?.resultUrl && (
                     <a href={req.responseData.resultUrl} target="_blank" className="text-green-600 underline">View Result</a>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No CAC requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ACTION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Process Request</h3>
            
            {/* Request Details Summary */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
               <p><strong>Business:</strong> {selectedRequest.requestData?.business_details?.proposed_name_1}</p>
               <p><strong>Proprietor:</strong> {selectedRequest.requestData?.proprietor_details?.firstname} {selectedRequest.requestData?.proprietor_details?.surname}</p>
               <div className="mt-2 flex gap-2">
                 {selectedRequest.requestData?.documents?.passport_url && (
                    <a href={selectedRequest.requestData.documents.passport_url} target="_blank" className="text-blue-500 underline text-xs">View Passport</a>
                 )}
                 {selectedRequest.requestData?.documents?.nin_slip_url && (
                    <a href={selectedRequest.requestData.documents.nin_slip_url} target="_blank" className="text-blue-500 underline text-xs">View NIN</a>
                 )}
               </div>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {/* Action Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVE')}
                  className={`p-3 rounded border text-center font-medium transition-colors ${
                    actionType === 'APPROVE' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('REJECT')}
                  className={`p-3 rounded border text-center font-medium transition-colors ${
                    actionType === 'REJECT' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Reject
                </button>
              </div>

              {/* Conditional Inputs */}
              {actionType === 'APPROVE' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Certificate/Result (Required)</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  rows={3}
                  placeholder={actionType === 'REJECT' ? "Reason for rejection..." : "Any comments..."}
                  required={actionType === 'REJECT'} 
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!actionType || processing || (actionType === 'APPROVE' && !resultFile)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
