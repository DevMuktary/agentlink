'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Smartphone, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, Eye, User, MapPin, Download, CreditCard, Calendar
} from 'lucide-react';

export default function AdminBvnEnrollmentQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Fetch ALL statuses (History View)
      const res = await axios.get('/api/admin/requests/all?service=ANDROID_BVN_ENROLLMENT&status=ALL'); 
      if (res.data.status) {
          setRequests(res.data.data);
      }
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !resultFile) return alert("Please upload the Generated BVN Slip (PDF).");
    if (action === 'REJECT' && !rejectionReason) return alert("Enter a rejection reason.");
    
    if(!confirm(`Confirm ${action} action?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Enrollment Successful'));
      
      if (action === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      await axios.post('/api/admin/requests/action', formData);
      
      alert(`Request ${action}D Successfully!`);
      closeModal();
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.error || "Action Failed");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setResultFile(null);
    setRejectionReason('');
    setAdminNote('');
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Smartphone className="w-8 h-8 text-teal-600" /> BVN Enrollments
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage new BVN registration requests</p>
        </div>
        <button onClick={fetchQueue} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition shadow-sm">
          <RefreshCw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 whitespace-nowrap">
                <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Gender/DOB</th>
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No BVN enrollment requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                            {item.requestData?.surname} {item.requestData?.firstname}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            {item.requestData?.gender} <span className="text-slate-300 mx-1">|</span> {item.requestData?.dob}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{item.user?.firstName} {item.user?.lastName}</span>
                                <span className="text-xs text-slate-400">{item.user?.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {item.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Approved</span>}
                            {item.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><XCircle size={12}/> Rejected</span>}
                            {item.status === 'PROCESSING' && <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedItem(item)} 
                            className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all ${
                                item.status === 'PROCESSING' 
                                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {item.status === 'PROCESSING' ? 'Process' : 'View Details'}
                        </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div>
                  <h3 className="font-bold text-xl text-slate-900">
                      {selectedItem.status === 'PROCESSING' ? 'Process Enrollment' : 'Enrollment Details'}
                  </h3>
                  <p className="text-slate-500 text-xs">Ref: {selectedItem.requestData?.clientReference || 'N/A'} | ID: {selectedItem.id}</p>
              </div>
              <button onClick={closeModal}><XCircle className="w-8 h-8 text-slate-300 hover:text-slate-500 transition-colors" /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: DATA */}
                <div className="lg:col-span-2 space-y-6 text-sm h-full overflow-y-auto pr-2">
                    
                    {/* AGENT INFO */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
                            <User size={16} className="text-blue-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Agent Information</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700">
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Name</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.firstName} {selectedItem.user?.lastName}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Email</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.email}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Phone</span>
                                <span className="font-medium text-slate-900">{selectedItem.user?.phoneNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-[10px] uppercase block font-semibold">Wallet Balance</span>
                                <span className="font-bold text-green-700">₦{Number(selectedItem.user?.walletBalance || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* PERSONAL INFO */}
                    <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                        <div className="flex items-center gap-2 mb-3 border-b border-teal-200 pb-2">
                            <User size={16} className="text-teal-700" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Candidate Personal Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Title</span> <span className="text-slate-900">{selectedItem.requestData?.title}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Surname</span> <span className="text-slate-900 font-bold">{selectedItem.requestData?.surname}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">First Name</span> <span className="text-slate-900">{selectedItem.requestData?.firstname}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Middle Name</span> <span className="text-slate-900">{selectedItem.requestData?.middlename || '-'}</span></p>
                            
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Gender</span> <span className="text-slate-900">{selectedItem.requestData?.gender}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Marital Status</span> <span className="text-slate-900">{selectedItem.requestData?.maritalStatus}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Date of Birth</span> <span className="text-slate-900">{selectedItem.requestData?.dob}</span></p>
                            
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Phone</span> <span className="text-slate-900">{selectedItem.requestData?.phone}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">Email</span> <span className="text-slate-900">{selectedItem.requestData?.email || 'N/A'}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">LGA of Origin</span> <span className="text-slate-900">{selectedItem.requestData?.lgaOfOrigin}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">State of Origin</span> <span className="text-slate-900">{selectedItem.requestData?.stateOfOrigin}</span></p>
                        </div>
                    </div>

                    {/* RESIDENTIAL INFO */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                            <MapPin size={16} className="text-slate-600" />
                            <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">Residential Address</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                            <p className="md:col-span-2"><span className="text-slate-500 text-xs uppercase block font-semibold">Address Line</span> <span className="text-slate-900">{selectedItem.requestData?.residentialAddress}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">State of Residence</span> <span className="text-slate-900">{selectedItem.requestData?.stateOfResidence}</span></p>
                            <p><span className="text-slate-500 text-xs uppercase block font-semibold">LGA of Residence</span> <span className="text-slate-900">{selectedItem.requestData?.lgaOfResidence}</span></p>
                        </div>
                    </div>

                     {/* BIOMETRICS / IMAGES */}
                     <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Biometrics & Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Passport */}
                            {selectedItem.requestData?.passport_photo && (
                                <a href={selectedItem.requestData.passport_photo} target="_blank" className="block group">
                                    <div className="bg-slate-100 rounded-lg h-32 flex items-center justify-center border border-slate-200 group-hover:border-teal-400 overflow-hidden relative">
                                        <img src={selectedItem.requestData.passport_photo} className="object-contain w-full h-full" alt="Passport" />
                                    </div>
                                    <span className="text-xs text-center block mt-1 font-bold text-slate-700">Passport</span>
                                </a>
                            )}
                            
                            {/* Signature */}
                            {selectedItem.requestData?.signature && (
                                <a href={selectedItem.requestData.signature} target="_blank" className="block group">
                                    <div className="bg-white rounded-lg h-32 flex items-center justify-center border border-slate-200 group-hover:border-teal-400 overflow-hidden relative">
                                        <img src={selectedItem.requestData.signature} className="object-contain w-full h-full" alt="Signature" />
                                    </div>
                                    <span className="text-xs text-center block mt-1 font-bold text-slate-700">Signature</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTIONS */}
                <div className="space-y-6 flex flex-col h-full">
                    {selectedItem.status === 'PROCESSING' ? (
                        <>
                            <div className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-lg flex-1">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <CheckCircle2 className="text-green-600" size={20} /> Approve & Upload Slip
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Upload BVN Slip (PDF)</label>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.jpg,.png"
                                            onChange={(e) => setResultFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Note / BVN Number</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                            placeholder="Enter generated BVN here or notes..." 
                                            rows={3} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing || !resultFile} 
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200"
                                    >
                                        {processing ? 'Processing...' : 'Complete Enrollment'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-sm"><AlertTriangle size={16} /> Decline & Refund</h4>
                                <div className="space-y-3">
                                    <input 
                                        value={rejectionReason} 
                                        onChange={e => setRejectionReason(e.target.value)} 
                                        className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-200 outline-none" 
                                        placeholder="Reason for rejection (Required)..." 
                                    />
                                    <button 
                                        onClick={() => handleAction('REJECT')} 
                                        disabled={processing || !rejectionReason} 
                                        className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50"
                                    >
                                        Reject Request
                                    </button>
                                    <p className="text-[10px] text-red-400 text-center">User will be refunded ₦{Number(selectedItem.cost).toLocaleString()} automatically.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        // READ ONLY VIEW
                        <div className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center h-full ${selectedItem.status === 'COMPLETED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            {selectedItem.status === 'COMPLETED' ? (
                                <>
                                    <CheckCircle2 size={64} className="text-green-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-green-800">Enrollment Successful</h3>
                                    <p className="text-green-600 text-sm mb-6">Completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center gap-2">
                                            <Download size={18} /> Download BVN Slip
                                        </a>
                                    )}
                                    <div className="mt-4 p-3 bg-white/60 rounded border border-green-200 text-xs text-green-800">
                                        <strong>Admin Note:</strong> {selectedItem.adminNote}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle size={64} className="text-red-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-red-800">Enrollment Rejected</h3>
                                    <p className="text-red-600 text-sm mb-4 bg-white/50 p-2 rounded">Reason: {selectedItem.adminNote}</p>
                                    <div className="text-xs bg-red-100 px-3 py-1 rounded-full text-red-700 font-medium">Refund Processed</div>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
