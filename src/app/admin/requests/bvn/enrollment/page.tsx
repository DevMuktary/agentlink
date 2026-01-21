'use client';
import { useState, useEffect } from 'react';
import GlobalLoader from '@/components/GlobalLoader';

export default function AdminBVNEnrollment() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  // 1. Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests/all?service=ANDROID_BVN_ENROLLMENT');
      const data = await res.json();
      if (data.status) setRequests(data.data);
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // 2. Handle Action (FormData for File Upload)
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !actionType) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedRequest.id);
      formData.append('action', actionType);
      formData.append('note', adminNote);

      // Attach file if Approving
      if (actionType === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      const res = await fetch('/api/admin/requests/action', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.status) {
        alert('Action Successful!');
        closeModal();
        fetchRequests();
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

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setResultFile(null);
    setAdminNote('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">BVN Enrollment Requests</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
            <tr>
              <th className="px-6 py-3">Ref</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{req.requestData?.clientReference}</td>
                <td className="px-6 py-4">{req.user?.email}</td>
                <td className="px-6 py-4">
                  {req.requestData?.first_name} {req.requestData?.last_name}
                </td>
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
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No BVN requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Process Enrollment</h3>
            
            {/* DETAILS */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-sm space-y-2">
               <p><strong>Applicant:</strong> {selectedRequest.requestData?.first_name} {selectedRequest.requestData?.last_name}</p>
               <p><strong>BVN:</strong> {selectedRequest.requestData?.bvn}</p>
               <p><strong>Phone:</strong> {selectedRequest.requestData?.phone_number}</p>
               
               {/* SHOW UPLOADED IMAGES */}
               <div className="flex gap-4 mt-2">
                 {selectedRequest.requestData?.passportUrl && (
                   <div className="border p-1 rounded">
                     <p className="text-xs text-gray-500 mb-1">Passport</p>
                     <img src={selectedRequest.requestData.passportUrl} alt="Passport" className="w-20 h-20 object-cover rounded" />
                   </div>
                 )}
                 {selectedRequest.requestData?.signatureUrl && (
                   <div className="border p-1 rounded">
                     <p className="text-xs text-gray-500 mb-1">Signature</p>
                     <img src={selectedRequest.requestData.signatureUrl} alt="Signature" className="w-20 h-20 object-contain rounded bg-white" />
                   </div>
                 )}
               </div>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVE')}
                  className={`p-3 rounded border text-center font-medium ${
                    actionType === 'APPROVE' ? 'bg-green-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('REJECT')}
                  className={`p-3 rounded border text-center font-medium ${
                    actionType === 'REJECT' ? 'bg-red-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  Reject
                </button>
              </div>

              {actionType === 'APPROVE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Result Slip (PDF/Image)</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                    className="block w-full mt-1 text-sm text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  rows={3}
                  placeholder="Comments..."
                  required={actionType === 'REJECT'} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border rounded">Cancel</button>
                <button 
                  type="submit" 
                  disabled={processing}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
