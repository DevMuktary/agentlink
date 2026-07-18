'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Users, Search, Shield, ShieldOff, Ban, Trash2, 
  CheckCircle2, Wallet, X, Loader2, RefreshCcw, 
  Copy, Check, ChevronLeft, ChevronRight, AlertTriangle, Info, User
} from 'lucide-react';

export default function AdminUserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action States
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Custom Toast & Confirm Modals
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success'|'error'}>({ show: false, msg: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<{show: boolean, action: string, userId: string, userName: string} | null>(null);
  
  // Funding/Deducting Modal State
  const [fundingUser, setFundingUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [isFunding, setIsFunding] = useState(false);

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search Filter
  useEffect(() => {
    if (!search) {
        setFilteredUsers(users);
    } else {
        const lower = search.toLowerCase();
        setFilteredUsers(users.filter(u => 
            u.email?.toLowerCase().includes(lower) || 
            u.firstName?.toLowerCase().includes(lower) || 
            u.lastName?.toLowerCase().includes(lower) ||
            u.phoneNumber?.includes(lower)
        ));
    }
    setCurrentPage(1);
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users/all'); 
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
        console.error("Failed to load users", error);
        showToast("Failed to load users", "error");
    } finally {
        setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const copyText = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- ACTIONS ---
  const handleActionClick = (userId: string, action: string, userName: string) => {
      setConfirmModal({ show: true, action, userId, userName });
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { userId, action, userName } = confirmModal;
    
    setConfirmModal(null);
    setProcessing(userId);
    
    try {
      const res = await axios.post('/api/admin/users/action', { userId, action });
      if (res.data.status || res.data.success) {
          showToast(`Successfully updated ${userName}`, "success");
          fetchUsers(); 
      } else {
          showToast(res.data.error || "Action failed", "error");
      }
    } catch (e: any) {
        showToast(e.response?.data?.error || "Action Failed", "error");
    } finally {
        setProcessing(null);
    }
  };

  // --- WALLET HANDLER ---
  const handleWalletAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingUser || !fundAmount) return;

    setIsFunding(true);
    try {
        await axios.post('/api/admin/wallet/fund', {
            userId: fundingUser.id,
            amount: Number(fundAmount),
            type: fundType
        });
        showToast(`Successfully ${fundType === 'CREDIT' ? 'Funded' : 'Deducted'} ₦${Number(fundAmount).toLocaleString()}`, "success");
        setFundingUser(null);
        setFundAmount('');
        fetchUsers(); 
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Wallet Action Failed', "error");
    } finally {
        setIsFunding(false);
    }
  };

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <Users className="text-blue-600 dark:text-blue-400" /> User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                Manage accounts, roles, access, and wallet balances.
            </p>
        </div>
        
        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Name, Email, Phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-900 dark:text-white transition-all"
                />
            </div>
            <button 
                onClick={fetchUsers} 
                className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                title="Refresh Data"
            >
                <RefreshCcw size={18} className="text-slate-500 dark:text-slate-300" />
            </button>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 font-bold">User Identity</th>
                        <th className="px-6 py-4 font-bold">Contact Info</th>
                        <th className="px-6 py-4 font-bold">Role & Status</th>
                        <th className="px-6 py-4 font-bold">Wallet Balance</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {currentUsers.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                <div className="flex flex-col items-center justify-center">
                                    <Users size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                                    <span className="font-medium">No users found matching your criteria.</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        currentUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                {/* User Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-inner">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact Info (Copyable) */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 group/copy">
                                            <span className="text-xs text-slate-600 dark:text-slate-300">{user.email}</span>
                                            <button 
                                                onClick={() => copyText(user.email, `${user.id}-email`)}
                                                className="opacity-0 group-hover/copy:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500 hover:text-blue-500"
                                            >
                                                {copiedId === `${user.id}-email` ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 group/copy">
                                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{user.phoneNumber || 'N/A'}</span>
                                            {user.phoneNumber && (
                                                <button 
                                                    onClick={() => copyText(user.phoneNumber, `${user.id}-phone`)}
                                                    className="opacity-0 group-hover/copy:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 dark:text-slate-500 hover:text-blue-500"
                                                >
                                                    {copiedId === `${user.id}-phone` ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Role & Status */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                                            <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded text-[9px] font-bold border border-purple-200 dark:border-purple-800/50 uppercase tracking-widest">
                                                <Shield size={10} /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                                                <User size={10} /> AGENT
                                            </span>
                                        )}
                                        
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-widest">
                                                <CheckCircle2 size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-[9px] font-bold border border-red-200 dark:border-red-800/50 uppercase tracking-widest">
                                                <Ban size={10} /> Blocked
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Wallet */}
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                                        ₦{Number(user.walletBalance).toLocaleString()}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        
                                        {/* Wallet Button */}
                                        <button 
                                            onClick={() => {
                                                setFundingUser(user);
                                                setFundType('CREDIT');
                                            }}
                                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
                                            title="Fund or Deduct Wallet"
                                        >
                                            <Wallet size={14} /> Wallet
                                        </button>

                                        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

                                        {/* Block / Unblock */}
                                        {user.isActive ? (
                                            <button 
                                                onClick={() => handleActionClick(user.id, 'BLOCK', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-200 dark:hover:border-orange-800/50 rounded-lg transition-all"
                                                title="Block User"
                                            >
                                                {processing === user.id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleActionClick(user.id, 'UNBLOCK', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-lg transition-all"
                                                title="Unblock User"
                                            >
                                                {processing === user.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            </button>
                                        )}

                                        {/* Make/Remove Admin */}
                                        {user.role === 'AGENT' || user.role === 'USER' ? (
                                            <button 
                                                onClick={() => handleActionClick(user.id, 'MAKE_ADMIN', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50 rounded-lg transition-all"
                                                title="Promote to Admin"
                                            >
                                                {processing === user.id ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleActionClick(user.id, 'REMOVE_ADMIN', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all"
                                                title="Demote to Agent"
                                            >
                                                {processing === user.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                                            </button>
                                        )}

                                        {/* Delete */}
                                        <button 
                                            onClick={() => handleActionClick(user.id, 'DELETE', user.firstName)}
                                            disabled={processing === user.id}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/50 rounded-lg transition-all ml-1"
                                            title="Permanently Delete"
                                        >
                                            {processing === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
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
                Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center">
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      confirmModal.action === 'DELETE' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      confirmModal.action === 'BLOCK' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                      confirmModal.action === 'MAKE_ADMIN' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                  }`}>
                      {confirmModal.action === 'DELETE' ? <Trash2 size={32} /> :
                       confirmModal.action === 'BLOCK' ? <Ban size={32} /> :
                       confirmModal.action === 'UNBLOCK' ? <CheckCircle2 size={32} /> :
                       confirmModal.action === 'MAKE_ADMIN' ? <Shield size={32} /> :
                       <ShieldOff size={32} />}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Action</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Are you sure you want to <strong className="text-slate-800 dark:text-slate-200">{confirmModal.action.replace('_', ' ')}</strong> user <span className="text-blue-600 dark:text-blue-400 font-bold">{confirmModal.userName}</span>? 
                      {confirmModal.action === 'DELETE' && " This action cannot be undone."}
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
                              confirmModal.action === 'DELETE' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' :
                              confirmModal.action === 'BLOCK' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20' :
                              'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                          }`}
                      >
                          Yes, Proceed
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* WALLET MANAGER MODAL */}
      {fundingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Wallet className="text-blue-600 dark:text-blue-400" size={20} /> Manage Wallet
                    </h3>
                    <button onClick={() => setFundingUser(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"/>
                    </button>
                </div>
                
                <form onSubmit={handleWalletAction} className="p-6 space-y-5">
                    <div className="text-center mb-2">
                        <p className="font-black text-xl text-slate-900 dark:text-white">{fundingUser.firstName} {fundingUser.lastName}</p>
                        <p className="text-xs text-slate-500 font-mono mb-3">{fundingUser.email}</p>
                        <div className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Current Balance: <span className="text-emerald-600 dark:text-emerald-400">₦{Number(fundingUser.walletBalance).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setFundType('CREDIT')}
                            className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition-all ${fundType === 'CREDIT' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Credit (+)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFundType('DEBIT')}
                            className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition-all ${fundType === 'DEBIT' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Debit (-)
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Amount (₦)</label>
                        <input 
                            type="number" 
                            required
                            min="100"
                            placeholder="e.g. 5000"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="w-full text-xl font-mono font-bold p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isFunding || !fundAmount}
                        className={`w-full py-3.5 text-white font-bold rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 ${
                            fundType === 'CREDIT' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                            : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                        }`}
                    >
                        {isFunding ? (
                            <><Loader2 className="animate-spin" size={18} /> Processing...</>
                        ) : (
                            fundType === 'CREDIT' ? 'Fund Wallet Now' : 'Deduct Funds Now'
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
