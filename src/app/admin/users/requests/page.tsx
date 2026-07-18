'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  CheckCircle2, XCircle, Search, User, 
  Briefcase, ShieldAlert, Code, Globe, 
  Link as LinkIcon, Loader2, RefreshCcw, 
  Copy, Check, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';

export default function ApiAccessRequests() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Custom Toast & Confirm Modals
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success'|'error'}>({ show: false, msg: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<{show: boolean, action: 'APPROVE' | 'REJECT', userId: string, userName: string} | null>(null);

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/api-requests');
      const data = res.data.status ? res.data.data : [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Failed to load users");
      showToast("Failed to load API requests", "error");
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.email?.toLowerCase().includes(q) || 
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        (u.businessName && u.businessName.toLowerCase().includes(q))
      ));
    } else {
      setFilteredUsers(users);
    }
    setCurrentPage(1);
  }, [searchQuery, users]);

  const showToast = (msg: string, type: 'success' | 'error') => {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const copyText = (text: string, id: string) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- ACTIONS ---
  const handleActionClick = (action: 'APPROVE' | 'REJECT') => {
      if (!selectedUser) return;
      setConfirmModal({ 
          show: true, 
          action, 
          userId: selectedUser.id, 
          userName: `${selectedUser.firstName} ${selectedUser.lastName}` 
      });
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { userId, action } = confirmModal;
    
    setConfirmModal(null);
    setProcessing(true);
    
    try {
      const res = await axios.post('/api/admin/users/api-requests', { userId, action });

      if (res.data.status || res.data.success) {
        showToast(`API Access ${action === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully!`, "success");
        setSelectedUser(null);
        fetchPendingUsers(); 
      } else {
        showToast(res.data.error || "Action failed", "error");
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Action Failed. Check console.', "error");
    } finally {
      setProcessing(false);
    }
  };

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="space-y-6 animate-in fade-in pb-20 relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-5 fade-in">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border text-sm font-bold tracking-wide ${
                toast.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' 
                : 'bg-red-50 dark:bg-red-900/90 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
            }`}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {toast.msg}
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" /> API Access Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Review and approve agent applications for direct API access.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name, Email, Business..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-900 dark:text-white transition-all"
            />
          </div>
          <button 
              onClick={fetchPendingUsers} 
              className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
              title="Refresh Data"
          >
              <RefreshCcw size={18} className="text-slate-500 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* STATS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Pending Review</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{filteredUsers.length}</p>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold">Request Date</th>
                <th className="px-6 py-4 font-bold">Applicant Identity</th>
                <th className="px-6 py-4 font-bold">Business Name</th>
                <th className="px-6 py-4 font-bold">Website / App Link</th>
                <th className="px-6 py-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {currentUsers.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Code size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <span className="font-medium">No pending API access requests found.</span>
                      </div>
                    </td>
                 </tr>
              ) : (
                currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                  {user.firstName} {user.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500">{user.email}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs">
                        {user.businessName || <span className="text-slate-400 italic normal-case">Not Provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        {user.website ? (
                            <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs">
                                <Globe size={14} /> {user.website}
                            </a>
                        ) : (
                            <span className="text-slate-400 italic text-xs">No Link</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedUser(user)} 
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
                        >
                          Review Application
                        </button>
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} requests
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                 <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight mb-2">
                     API Access Application
                 </h3>
                 <p className="text-slate-500 dark:text-slate-400 text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit">ID: {selectedUser.id}</p>
              </div>
              <button onClick={() => !processing && setSelectedUser(null)} disabled={processing} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: AGENT DATA */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={18} className="text-slate-700 dark:text-slate-300" />
                        <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Applicant Profile</h4>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-2">
                        <CopyableRow label="Full Name" value={`${selectedUser.firstName} ${selectedUser.lastName}`} id="app-name" />
                        <CopyableRow label="Email Address" value={selectedUser.email} id="app-email" isEmail />
                        <CopyableRow label="Phone Number" value={selectedUser.phoneNumber} id="app-phone" />
                        <div className="flex justify-between items-center py-2.5 px-2">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Current Wallet</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₦{Number(selectedUser.walletBalance || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: BUSINESS & API DATA */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={18} className="text-blue-700 dark:text-blue-400" />
                        <h4 className="font-bold uppercase text-xs tracking-widest text-slate-900 dark:text-white">Project Details</h4>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-800/50 p-2 shadow-sm shadow-blue-100/50 dark:shadow-none mb-4">
                        <CopyableRow label="Business Name" value={selectedUser.businessName} id="app-bus" />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-800/50 p-4 shadow-sm shadow-blue-100/50 dark:shadow-none">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-2">Submitted Website / Platform Link</span>
                        {selectedUser.website ? (
                            <a href={selectedUser.website.startsWith('http') ? selectedUser.website : `https://${selectedUser.website}`} target="_blank" className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-slate-50 dark:bg-slate-800 py-3 rounded-lg font-bold text-sm transition-colors border border-blue-100 dark:border-blue-800/50">
                                <LinkIcon size={16} /> Open Project Link
                            </a>
                        ) : (
                            <div className="text-center py-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 text-xs italic">
                                No link provided by applicant.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => handleActionClick('REJECT')}
                    disabled={processing}
                    className="flex-1 py-3.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <XCircle size={18} /> Reject Application
                </button>
                <button
                    onClick={() => handleActionClick('APPROVE')}
                    disabled={processing}
                    className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Approve & Generate Key</>}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center">
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      confirmModal.action === 'APPROVE' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                  }`}>
                      {confirmModal.action === 'APPROVE' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Action</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Are you sure you want to <strong className={confirmModal.action === 'APPROVE' ? "text-emerald-600" : "text-red-600"}>{confirmModal.action.toLowerCase()}</strong> API access for <span className="text-blue-600 dark:text-blue-400 font-bold">{confirmModal.userName}</span>?
                  </p>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setConfirmModal(null)}
                          className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={executeAction}
                          className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition ${
                              confirmModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                          }`}
                      >
                          Yes, Proceed
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
