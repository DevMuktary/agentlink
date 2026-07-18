'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Building2, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, Eye, User, Download, FileCheck, Layers,
  Globe, Code, Copy, Check
} from 'lucide-react';

export default function AdminCacQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  
  // SEPARATE FILES STATES
  const [certFile, setCertFile] = useState<File | null>(null);
  const [statusFile, setStatusFile] = useState<File | null>(null);
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Filters
  const [channelFilter, setChannelFilter] = useState('ALL'); // ALL, WEB, API

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine channel based on reference
  const getChannel = (reference: string) => {
    if (!reference) return 'WEB'; // Fallback
    if (reference.includes('DASH') || reference.startsWith('FW-')) {
        return 'WEB';
    }
    return 'API';
  };

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/requests/all?service=CAC_REGISTRATION&status=ALL'); 
      if (res.data.status) {
          // Sort by newest first
          const sortedData = res.data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRequests(sortedData);
      }
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // Apply Filter
  const filteredRequests = useMemo(() => {
    if (channelFilter === 'ALL') return requests;
    return requests.filter(req => getChannel(req.requestData?.clientReference || req.id) === channelFilter);
  }, [requests, channelFilter]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') {
        if (!certFile || !statusFile) {
            return alert("Please upload BOTH the Certificate and the Status Report.");
        }
    }
    if (action === 'REJECT' && !rejectionReason) return alert("Please enter a rejection reason.");
    
    if(!confirm(`Are you sure you want to ${action} this request?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Approved'));
      
      // Append specific files with specific keys matching the API
      if (action === 'APPROVE') {
        if (certFile) formData.append('file_certificate', certFile);
        if (statusFile) formData.append('file_status_report', statusFile);
      }

      await axios.post('/api/admin/requests/action', formData);
      
      alert(`Success! Request has been ${action}D successfully.`);
      closeModal();
      fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.error || "Action Failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCertFile(null);
    setStatusFile(null);
    setRejectionReason('');
    setAdminNote('');
  };

  // Helper for Channel Badges
  const getChannelBadge = (ref: string) => {
    const isDash = ref?.includes('DASH') || false;
    return isDash ? (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-slate-200 dark:border-slate-700 flex items-center gap-1 w-fit">
            <Globe size={10} /> Dashboard
        </span>
    ) : (
        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-purple-200 dark:border-purple-800/50 flex items-center gap-1 w-fit">
            <Code size={10} /> API
        </span>
    );
  };

  // Reusable Copy Row Component
  const CopyableRow = ({ label, value, id, isEmail = false }: { label: string, value: any, id: string, isEmail?: boolean }) => {
    const strValue = String(value || 'N/A').trim();
    const displayValue = isEmail || strValue === 'N/A' ? strValue : strValue.toUpperCase();
    
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider max-w-[40%] truncate pr-2" title={label}>{label}</span>
            <div className="flex items-center gap-3">
                <span className={`font-bold text-slate-900 dark:text-slate-100 text-sm text-right max-w-[200px] truncate ${!isEmail ? 'uppercase tracking-wide' : ''}`} title={displayValue}>
                    {displayValue}
                </span>
                {strValue !== 'N/A' && (
                    <button 
                        onClick={() => copyText(displayValue, id)} 
                        className="text-slate-300 dark:text-slate-600 hover:text-orange-500 dark:hover:text-orange-400 transition-colors bg-white dark:bg-slate-800 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-700"
                        title="Copy to clipboard"
                    >
                        {copiedId === id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
        </div>
    );
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white tracking-tight">
            <Building2 className="w-8 h-8 text-orange-600 dark:text-orange-400" /> CAC Registrations
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Manage business registration requests.</p>
        </div>
        <button onClick={fetchQueue} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition shadow-sm self-start md:self-auto">
          <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* FILTER & TOGGLE */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-fit border border-slate-200 dark:border-slate-700 shrink-0">
          {['ALL', 'WEB', 'API'].map((chan) => (
              <button
                  key={chan}
                  onClick={() => setChannelFilter(chan)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      channelFilter === chan 
                      ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                  {chan === 'WEB' && <Globe size={14} />}
                  {chan === 'API' && <Code size={14} />}
                  {chan === 'ALL' ? 'All Channels' : chan === 'WEB' ? 'Dashboard Only' : 'API Only'}
              </button>
          ))}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto"> 
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]"> 
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold">Date & Ref</th>
                <th className="px-6 py-4 font-bold">Channel</th>
                <th className="px-6 py-4 font-bold">Proposed Business Name</th>
                <th className="px-6 py-4 font-bold">Agent</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredRequests.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                          No CAC requests found for the selected channel.
                      </td>
                  </tr>
              ) : (
                  filteredRequests.map((item) => {
                    const ref = item.requestData?.clientReference || item.id;
                    return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-slate-600 dark:text-slate-300 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{ref}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {getChannelBadge(ref)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs">
                            {item.requestData?.business_details?.proposed_name_1 || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">{item.user?.firstName} {item.user?.lastName}</span>
                                <span className="text-[10px] text-slate-400">{item.user?.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {item.status === 'COMPLETED' && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border border-green-200 dark:border-green-800/50"><CheckCircle2 size={12}/> Approved</span>}
                            {item.status === 'FAILED' && <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border border-red-200 dark:border-red-800/50"><XCircle size={12}/> Rejected</span>}
                            {item.status === 'PROCESSING' && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border border-orange-200 dark:border-orange-800/50"><RefreshCw size={12} className="animate-spin"/> Processing</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => setSelectedItem(item)} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                                item.status === 'PROCESSING' 
                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20' 
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            {item.status === 'PROCESSING' ? 'Process' : 'View Details'}
                        </button>
                        </td>
                    </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10 pt-2">
              <div>
                 <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight mb-2">
                     {selectedItem.status === 'PROCESSING' ? 'Process CAC Application' : 'Application Record'}
                 </h3>
                 <div className="flex flex-wrap items-center gap-3">
                     {getChannelBadge(selectedItem.requestData?.clientReference || selectedItem.id)}
                     <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Ref: {selectedItem.requestData?.clientReference || selectedItem.id}</span>
                 </div>
              </div>
              <button onClick={closeModal} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: APPLICATION DATA */}
                <div className="lg:col-span-2 space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* AGENT INFO (COPYABLE) */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={18} className="text-slate-700 dark:text-slate-300" />
                            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Agent Information</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                            <CopyableRow label="Agent Name" value={`${selectedItem.user?.firstName} ${selectedItem.user?.lastName}`} id="agent-name" />
                            <CopyableRow label="Agent Email" value={selectedItem.user?.email} id="agent-email" isEmail />
                            <CopyableRow label="Agent Phone" value={selectedItem.user?.phoneNumber} id="agent-phone" />
                        </div>
                    </div>

                    {/* BUSINESS INFO (COPYABLE) */}
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} className="text-orange-700 dark:text-orange-400" />
                            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Business Details</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-800/50 p-2 shadow-sm shadow-orange-100/50 dark:shadow-none mb-4">
                            <CopyableRow label="Proposed Name 1" value={selectedItem.requestData?.business_details?.proposed_name_1} id="bus-name-1" />
                            <CopyableRow label="Proposed Name 2" value={selectedItem.requestData?.business_details?.proposed_name_2} id="bus-name-2" />
                            <CopyableRow label="Nature of Business" value={selectedItem.requestData?.business_details?.nature_of_business} id="bus-nature" />
                            <CopyableRow label="Description" value={selectedItem.requestData?.business_details?.description} id="bus-desc" />
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-800/50 p-2 shadow-sm shadow-orange-100/50 dark:shadow-none">
                            <CopyableRow label="Address" value={selectedItem.requestData?.business_details?.address} id="bus-addr" />
                            <CopyableRow label="State" value={selectedItem.requestData?.business_details?.state} id="bus-state" />
                            <CopyableRow label="LGA" value={selectedItem.requestData?.business_details?.lga} id="bus-lga" />
                        </div>
                    </div>

                    {/* PROPRIETOR INFO (COPYABLE) */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={18} className="text-indigo-700 dark:text-indigo-400" />
                            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Proprietor Details</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-2 mb-4">
                            <CopyableRow label="First Name" value={selectedItem.requestData?.proprietor_details?.firstname} id="prop-first" />
                            <CopyableRow label="Surname" value={selectedItem.requestData?.proprietor_details?.surname} id="prop-last" />
                            <CopyableRow label="Middle Name" value={selectedItem.requestData?.proprietor_details?.middle_name} id="prop-mid" />
                            <CopyableRow label="NIN" value={selectedItem.requestData?.proprietor_details?.nin} id="prop-nin" />
                            <CopyableRow label="Phone" value={selectedItem.requestData?.proprietor_details?.phone} id="prop-phone" />
                            <CopyableRow label="Email" value={selectedItem.requestData?.proprietor_details?.email} id="prop-email" isEmail />
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-2">
                            <CopyableRow label="Address" value={selectedItem.requestData?.proprietor_details?.address} id="prop-addr" />
                            <CopyableRow label="State" value={selectedItem.requestData?.proprietor_details?.state} id="prop-state" />
                            <CopyableRow label="LGA" value={selectedItem.requestData?.proprietor_details?.lga} id="prop-lga" />
                        </div>
                    </div>

                     {/* DOCUMENTS */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 mb-4">
                            <FileCheck size={18} className="text-slate-700 dark:text-slate-300" />
                            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Submitted Documents</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Passport */}
                            {selectedItem.requestData?.documents?.passport_url && (
                                <a href={selectedItem.requestData.documents.passport_url} target="_blank" className="block group">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl h-32 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-orange-400 dark:group-hover:border-orange-500 overflow-hidden relative transition-colors shadow-sm">
                                        <img src={selectedItem.requestData.documents.passport_url} className="object-contain w-full h-full" alt="Passport" />
                                    </div>
                                    <span className="text-[10px] text-center block mt-2 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Passport</span>
                                </a>
                            )}
                            
                            {/* Signature */}
                            {selectedItem.requestData?.documents?.signature_url && (
                                <a href={selectedItem.requestData.documents.signature_url} target="_blank" className="block group">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl h-32 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-orange-400 dark:group-hover:border-orange-500 overflow-hidden relative transition-colors shadow-sm">
                                        <img src={selectedItem.requestData.documents.signature_url} className="object-contain w-full h-full" alt="Signature" />
                                    </div>
                                    <span className="text-[10px] text-center block mt-2 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Signature</span>
                                </a>
                            )}

                            {/* NIN Slip */}
                            {selectedItem.requestData?.documents?.nin_slip_url && (
                                <a href={selectedItem.requestData.documents.nin_slip_url} target="_blank" className="block group">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl h-32 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-orange-400 dark:group-hover:border-orange-500 overflow-hidden relative transition-colors shadow-sm">
                                        <img src={selectedItem.requestData.documents.nin_slip_url} className="object-cover w-full h-full opacity-80 group-hover:opacity-100" alt="NIN Slip" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <span className="text-white text-xs font-bold bg-orange-600 px-3 py-1.5 rounded-lg shadow-lg">View</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-center block mt-2 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">NIN Slip</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* RAW DATA DUMP */}
                    <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Layers size={14} /> Toggle Raw JSON Payload
                        </summary>
                        <div className="bg-slate-900 p-4 rounded-xl mt-2 overflow-hidden">
                            <pre className="text-[10px] text-emerald-400 overflow-x-auto font-mono custom-scrollbar pb-2">
                                {JSON.stringify(selectedItem.requestData, null, 2)}
                            </pre>
                        </div>
                    </details>
                </div>

                {/* RIGHT COLUMN: ACTIONS */}
                <div className="space-y-6 flex flex-col h-full">
                    {selectedItem.status === 'PROCESSING' ? (
                        <>
                            {/* APPROVE BOX */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center">
                                <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 uppercase tracking-wide text-sm">
                                    <CheckCircle2 className="text-green-600 dark:text-green-500" size={20} /> Approve & Deliver
                                </h4>
                                <div className="space-y-5">
                                    
                                    {/* UPLOAD 1: CERTIFICATE */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">1. Upload Certificate (Required)</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setCertFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/50 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1" 
                                        />
                                    </div>

                                    {/* UPLOAD 2: STATUS REPORT */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">2. Upload Status Report (Required)</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setStatusFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/50 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Admin Note (Optional)</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white" 
                                            placeholder="Optional comments..." 
                                            rows={2} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing || !certFile || !statusFile} 
                                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                                    >
                                        {processing ? 'Processing...' : 'Complete & Deliver'}
                                    </button>
                                </div>
                            </div>

                            {/* REJECT BOX */}
                            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 mt-4">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-red-100 dark:border-red-900/30 pb-2"><AlertTriangle size={16} /> Decline & Refund</h4>
                                <div className="space-y-4">
                                    <input 
                                        value={rejectionReason} 
                                        onChange={e => setRejectionReason(e.target.value)} 
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white" 
                                        placeholder="Required: Reason for rejection..." 
                                    />
                                    
                                    <p className="text-[10px] text-red-500 dark:text-red-400 text-center font-bold uppercase tracking-wider">
                                        User will be refunded ₦{Number(selectedItem.cost).toLocaleString()} automatically.
                                    </p>

                                    <button 
                                        onClick={() => handleAction('REJECT')} 
                                        disabled={processing || !rejectionReason} 
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20 active:scale-95 transition-all"
                                    >
                                        Reject Request
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // READ ONLY VIEW FOR COMPLETED/FAILED
                        <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center h-full ${selectedItem.status === 'COMPLETED' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
                            {selectedItem.status === 'COMPLETED' ? (
                                <div className="w-full space-y-4">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 mx-auto">
                                        <CheckCircle2 size={40} className="text-green-600 dark:text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-green-800 dark:text-green-400 mb-1">Request Approved</h3>
                                    <p className="text-green-600 dark:text-green-500/80 text-sm font-medium mb-6">Completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    {/* DOWNLOAD CERTIFICATE */}
                                    {selectedItem.responseData?.certificate_url && (
                                        <a href={selectedItem.responseData.certificate_url} target="_blank" className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition flex items-center justify-center gap-2 w-full active:scale-95">
                                            <Download size={18} /> Download Certificate
                                        </a>
                                    )}

                                    {/* DOWNLOAD STATUS REPORT */}
                                    {selectedItem.responseData?.status_report_url && (
                                        <a href={selectedItem.responseData.status_report_url} target="_blank" className="bg-white dark:bg-slate-900 border-2 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-green-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 w-full active:scale-95">
                                            <FileCheck size={18} /> Download Status Report
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                                        <XCircle size={40} className="text-red-600 dark:text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-red-800 dark:text-red-400 mb-4">Request Rejected</h3>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-900/50 text-left w-full mb-4">
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Rejection Reason</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{selectedItem.adminNote}</p>
                                    </div>
                                    <div className="text-[10px] bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full text-red-700 dark:text-red-400 font-bold uppercase tracking-widest border border-red-200 dark:border-red-800/50">Refund Processed</div>
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
