'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  FileBadge, CheckCircle2, XCircle, RefreshCw, 
  AlertTriangle, User, Download, Layers,
  Banknote, Globe, Code, Copy, Check
} from 'lucide-react';

export default function AdminBvnModificationQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  
  // Refund Control
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [shouldRefund, setShouldRefund] = useState(true);

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const endpoints = [
        '/api/admin/requests/all?service=BVN_MOD_NAME&status=ALL',
        '/api/admin/requests/all?service=BVN_MOD_DOB&status=ALL',
        '/api/admin/requests/all?service=BVN_MOD_PHONE&status=ALL',
        '/api/admin/requests/all?service=BVN_MOD_NAME_DOB&status=ALL', 
        '/api/admin/requests/all?service=BVN_MOD_NAME_PHONE&status=ALL',
        '/api/admin/requests/all?service=BVN_MOD_DOB_PHONE&status=ALL',
        '/api/admin/requests/all?service=BVN_MOD_FULL&status=ALL',
        '/api/admin/requests/all?service=BVN_MODIFICATION&status=ALL', 
      ];

      const results = await Promise.allSettled(endpoints.map(ep => axios.get(ep)));
      
      const combined: any[] = [];
      results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.data?.status) {
              combined.push(...result.value.data.data);
          }
      });
      
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(combined);
    } catch (error) {
        console.error("Failed to fetch queue", error);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  useEffect(() => {
    if (selectedItem) {
        setRefundAmount(selectedItem.cost.toString());
        setResultFile(null);
        setRejectionReason('');
        setAdminNote('');
        setShouldRefund(true);
    }
  }, [selectedItem]);

  // 2. Handle Action
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !resultFile) return alert("Please upload the Modified BVN Slip.");
    if (action === 'REJECT' && !rejectionReason) return alert("Please enter a rejection reason.");
    
    if(!confirm(`Are you sure you want to ${action} this request?`)) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('requestId', selectedItem.id);
      formData.append('action', action);
      formData.append('note', action === 'REJECT' ? rejectionReason : (adminNote || 'Modification Completed'));
      
      if (action === 'APPROVE' && resultFile) {
        formData.append('file', resultFile);
      }

      if (action === 'REJECT') {
          const finalRefund = shouldRefund ? (parseFloat(refundAmount) || 0) : 0;
          formData.append('refund_amount', finalRefund.toString());
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

  const closeModal = () => setSelectedItem(null);

  // Helper for Badges
  const getTypeBadge = (type: string) => {
      if (type.includes('NAME') && type.includes('DOB')) return <span className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-fuchsia-200 dark:border-fuchsia-800/50">Name + DOB</span>;
      if (type.includes('NAME') && type.includes('PHONE')) return <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-indigo-200 dark:border-indigo-800/50">Name + Phone</span>;
      if (type.includes('DOB') && type.includes('PHONE')) return <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-pink-200 dark:border-pink-800/50">DOB + Phone</span>;
      if (type.includes('FULL')) return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-red-200 dark:border-red-800/50">Full Mod</span>;
      if (type.includes('NAME')) return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-blue-200 dark:border-blue-800/50">Name Change</span>;
      if (type.includes('DOB')) return <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-purple-200 dark:border-purple-800/50">DOB Correction</span>;
      if (type.includes('PHONE')) return <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-[9px] font-bold uppercase border border-orange-200 dark:border-orange-800/50">Phone Update</span>;
      return <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-[9px] uppercase border border-gray-200 dark:border-gray-700">BVN Mod</span>;
  };

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

  const getIdentity = (data: any) => data?.identity || {
      surname: data?.old_surname || 'N/A',
      first_name: data?.old_first_name || 'N/A',
      middle_name: data?.old_middle_name || ''
  };

  const getChanges = (data: any) => data?.changes || {};

  // Reusable Copy Row Component
  const CopyableRow = ({ label, value, id, isEmail = false }: { label: string, value: any, id: string, isEmail?: boolean }) => {
    const strValue = String(value || 'N/A').trim();
    const displayValue = isEmail || strValue === 'N/A' ? strValue : strValue.toUpperCase();
    
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-3">
                <span className={`font-bold text-slate-900 dark:text-slate-100 text-sm text-right max-w-[200px] truncate ${!isEmail ? 'uppercase tracking-wide' : ''}`} title={displayValue}>
                    {displayValue}
                </span>
                {strValue !== 'N/A' && (
                    <button 
                        onClick={() => copyText(displayValue, id)} 
                        className="text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-700"
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
            <FileBadge className="w-8 h-8 text-teal-600 dark:text-teal-400" /> BVN Modifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Manage and process BVN data corrections from API and Dashboard.</p>
        </div>
        <button onClick={fetchQueue} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition shadow-sm self-start md:self-auto">
          <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                <th className="px-6 py-4 font-bold">Date & Ref</th>
                <th className="px-6 py-4 font-bold">Channel & Type</th>
                <th className="px-6 py-4 font-bold">Applicant (Old Data)</th>
                <th className="px-6 py-4 font-bold">Bank</th>
                <th className="px-6 py-4 font-bold">Agent</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                            No BVN modification requests found.
                        </td>
                    </tr>
                ) : (
                    requests.map((item) => {
                        const ident = getIdentity(item.requestData);
                        const ref = item.requestData?.clientReference || item.id;
                        return (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{ref}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 flex flex-col gap-1.5 items-start">
                                    {getChannelBadge(ref)}
                                    {getTypeBadge(item.serviceType)}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs">
                                    {ident.surname} {ident.first_name}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs uppercase font-bold">
                                    {item.requestData?.bank_name || 'N/A'}
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
                                    {item.status === 'PROCESSING' && <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border border-teal-200 dark:border-teal-800/50"><RefreshCw size={12} className="animate-spin"/> Pending</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setSelectedItem(item)} 
                                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                                        item.status === 'PROCESSING' 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {item.status === 'PROCESSING' ? 'Review & Process' : 'View Data'}
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
                     {selectedItem.status === 'PROCESSING' ? 'Process BVN Request' : 'Modification Record'}
                 </h3>
                 <div className="flex flex-wrap items-center gap-3">
                     {getChannelBadge(selectedItem.requestData?.clientReference || selectedItem.id)}
                     {getTypeBadge(selectedItem.serviceType)}
                     <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Ref: {selectedItem.requestData?.clientReference || selectedItem.id}</span>
                     {selectedItem.requestData?.surcharge_applied && (
                         <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                             <Banknote size={12} /> Age Surcharge
                         </span>
                     )}
                 </div>
              </div>
              <button onClick={closeModal} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: COPYABLE DATA */}
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
                            <div className="flex justify-between items-center py-2.5 px-2">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₦{Number(selectedItem.user?.walletBalance || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* MODIFICATION DATA (COPYABLE) */}
                    <div className="bg-teal-50 dark:bg-teal-900/10 p-5 rounded-2xl border border-teal-100 dark:border-teal-800/30">
                        <div className="flex items-center gap-2 mb-4">
                            <FileBadge size={18} className="text-teal-700 dark:text-teal-400" />
                            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Submitted Identity Data</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            {/* BASE IDENTITY */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-teal-100 dark:border-teal-800/50 p-2 h-fit">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-teal-800 dark:text-teal-500 px-2 py-2 mb-1 border-b border-teal-50 dark:border-teal-900/30">Current Base Data</h5>
                                {(() => {
                                    const ident = getIdentity(selectedItem.requestData);
                                    return (
                                        <>
                                            <CopyableRow label="Current Surname" value={ident.surname} id="curr-sur" />
                                            <CopyableRow label="Current Firstname" value={ident.first_name} id="curr-first" />
                                            <CopyableRow label="Current Middlename" value={ident.middle_name} id="curr-mid" />
                                            <CopyableRow label="BVN Number" value={selectedItem.requestData?.bvn} id="curr-bvn" />
                                            <CopyableRow label="NIN Number" value={selectedItem.requestData?.nin} id="curr-nin" />
                                            <CopyableRow label="Bank Name" value={selectedItem.requestData?.bank_name} id="curr-bank" />
                                        </>
                                    );
                                })()}
                            </div>

                            {/* REQUESTED CHANGES */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/50 p-2 h-fit shadow-sm shadow-amber-100/50 dark:shadow-none">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 px-2 py-2 mb-1 border-b border-amber-50 dark:border-amber-900/30">Requested Updates</h5>
                                {(() => {
                                    const changes = getChanges(selectedItem.requestData);
                                    let hasChanges = false;
                                    
                                    return (
                                        <>
                                            {changes.new_name && (
                                                <>
                                                    <CopyableRow label="New Surname" value={changes.new_name.last || changes.new_name.surname} id="new-sur" />
                                                    <CopyableRow label="New Firstname" value={changes.new_name.first || changes.new_name.first_name} id="new-first" />
                                                    <CopyableRow label="New Middlename" value={changes.new_name.middle || changes.new_name.middle_name} id="new-mid" />
                                                    {hasChanges = true}
                                                </>
                                            )}

                                            {changes.dates && (
                                                <>
                                                    <CopyableRow label="Old Date of Birth" value={changes.dates.old} id="old-dob" />
                                                    <CopyableRow label="New Date of Birth" value={changes.dates.new} id="new-dob" />
                                                    {hasChanges = true}
                                                </>
                                            )}

                                            {changes.phone && (
                                                <>
                                                    <CopyableRow label="Old Phone" value={changes.phone.old} id="old-phone" />
                                                    <CopyableRow label="New Phone" value={changes.phone.new} id="new-phone" />
                                                    {hasChanges = true}
                                                </>
                                            )}

                                            {!hasChanges && (
                                                <div className="p-4 text-center text-xs text-slate-400 italic">
                                                    No standard changes parsed. See raw data.
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
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
                                    <CheckCircle2 className="text-green-600 dark:text-green-500" size={20} /> Approve Request
                                </h4>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">1. Upload Slip (PDF/Image)</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setResultFile(e.target.files?.[0] || null)} 
                                            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">2. Admin Note (Optional)</label>
                                        <textarea 
                                            value={adminNote} 
                                            onChange={e => setAdminNote(e.target.value)} 
                                            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white" 
                                            placeholder="E.g. Successfully modified..." 
                                            rows={2} 
                                        />
                                    </div>

                                    <button 
                                        onClick={() => handleAction('APPROVE')} 
                                        disabled={processing || !resultFile} 
                                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                                    >
                                        {processing ? 'Processing...' : 'Complete & Upload'}
                                    </button>
                                </div>
                            </div>

                            {/* REJECT BOX */}
                            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 mt-4">
                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-red-100 dark:border-red-900/30 pb-2"><AlertTriangle size={16} /> Decline Request</h4>
                                <div className="space-y-4">
                                    <input 
                                        value={rejectionReason} 
                                        onChange={e => setRejectionReason(e.target.value)} 
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white" 
                                        placeholder="Required: Reason for rejection..." 
                                    />
                                    
                                    {/* REFUND CONTROLS */}
                                    <div className="pt-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-400 mb-3 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={shouldRefund} 
                                                onChange={e => setShouldRefund(e.target.checked)}
                                                className="w-4 h-4 accent-red-600 rounded" 
                                            />
                                            Refund Wallet Balance?
                                        </label>
                                        
                                        {shouldRefund && (
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-800/50">
                                                <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1.5">Amount to Refund (₦)</label>
                                                <input 
                                                    type="number" 
                                                    value={refundAmount} 
                                                    onChange={e => setRefundAmount(e.target.value)}
                                                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono font-bold"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                    Original Charge: ₦{Number(selectedItem.cost).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleAction('REJECT')} 
                                        disabled={processing || !rejectionReason} 
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20 active:scale-95 transition-all"
                                    >
                                        Reject & Close
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // READ ONLY VIEW
                        <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center h-full ${selectedItem.status === 'COMPLETED' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
                            {selectedItem.status === 'COMPLETED' ? (
                                <>
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
                                        <CheckCircle2 size={40} className="text-green-600 dark:text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-green-800 dark:text-green-400 mb-1">Processed Successfully</h3>
                                    <p className="text-green-600 dark:text-green-500/80 text-sm font-medium mb-8">Completed on {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                                    
                                    {selectedItem.responseData?.resultUrl && (
                                        <a href={selectedItem.responseData.resultUrl} target="_blank" className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95">
                                            <Download size={18} /> View Uploaded Slip
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                                        <XCircle size={40} className="text-red-600 dark:text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-red-800 dark:text-red-400 mb-4">Request Declined</h3>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-900/50 text-left w-full">
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Rejection Reason</p>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{selectedItem.adminNote}</p>
                                    </div>
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
