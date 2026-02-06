'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Users, Search, Shield, ShieldOff, Ban, Trash2, 
  CheckCircle2, Wallet, X, Loader2, RefreshCcw 
} from 'lucide-react';

export default function AdminUserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Action States
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Funding Modal State
  const [fundingUser, setFundingUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

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
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Using the /all endpoint to get everyone
      const res = await axios.get('/api/admin/users/all'); 
      // Handle both array response or object wrapper
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
        console.error("Failed to load users", error);
    } finally {
        setLoading(false);
    }
  };

  // --- ACTIONS (Block, Delete, etc) ---
  const handleAction = async (userId: string, action: string, userName: string) => {
    const actionText = action === 'DELETE' ? 'PERMANENTLY DELETE' : action;
    if (!confirm(`Are you sure you want to ${actionText} user: ${userName}?`)) return;

    setProcessing(userId);
    try {
      const res = await axios.post('/api/admin/users/action', { userId, action });
      if (res.data.status || res.data.success) {
          alert(`Success: User ${action}ED`);
          fetchUsers(); // Refresh list
      } else {
          alert(res.data.error || "Action failed");
      }
    } catch (e: any) {
        alert(e.response?.data?.error || "Action Failed");
    } finally {
        setProcessing(null);
    }
  };

  // --- FUNDING HANDLER ---
  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingUser || !fundAmount) return;

    setIsFunding(true);
    try {
        await axios.post('/api/admin/wallet/fund', {
            userId: fundingUser.id,
            amount: Number(fundAmount)
        });
        alert(`Successfully funded ₦${Number(fundAmount).toLocaleString()} to ${fundingUser.firstName}`);
        setFundingUser(null);
        setFundAmount('');
        fetchUsers(); // Refresh to show new balance
    } catch (error: any) {
        alert(error.response?.data?.error || 'Funding Failed');
    } finally {
        setIsFunding(false);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-blue-600" /> User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
                Manage accounts, roles, and wallet balances.
            </p>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Name, Email, Phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
            </div>
            <button onClick={fetchUsers} className="p-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <RefreshCcw size={18} className="text-slate-500" />
            </button>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
                <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 border-b border-slate-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-medium">User Details</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Wallet</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors group">
                                
                                {/* User Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Role */}
                                <td className="px-6 py-4">
                                    {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-[10px] font-bold border border-purple-200">
                                            <Shield size={10} /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200">
                                            USER
                                        </span>
                                    )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    {user.isActive ? (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                            <CheckCircle2 size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                            <Ban size={10} /> Blocked
                                        </span>
                                    )}
                                </td>

                                {/* Wallet */}
                                <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                    ₦{Number(user.walletBalance).toLocaleString()}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        
                                        {/* Fund Wallet Button */}
                                        <button 
                                            onClick={() => setFundingUser(user)}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                            title="Fund Wallet"
                                        >
                                            <Wallet size={14} /> Fund
                                        </button>

                                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-gray-700 mx-1"></div>

                                        {/* Block / Unblock */}
                                        {user.isActive ? (
                                            <button 
                                                onClick={() => handleAction(user.id, 'BLOCK', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                                title="Block User"
                                            >
                                                <Ban size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(user.id, 'UNBLOCK', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-green-500 hover:bg-green-50 rounded transition"
                                                title="Unblock User"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                        )}

                                        {/* Make Admin / Remove Admin */}
                                        {user.role === 'AGENT' || user.role === 'USER' ? (
                                            <button 
                                                onClick={() => handleAction(user.id, 'MAKE_ADMIN', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-purple-500 hover:bg-purple-50 rounded transition"
                                                title="Promote to Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(user.id, 'REMOVE_ADMIN', user.firstName)}
                                                disabled={processing === user.id}
                                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition"
                                                title="Demote to User"
                                            >
                                                <ShieldOff size={16} />
                                            </button>
                                        )}

                                        {/* Delete */}
                                        <button 
                                            onClick={() => handleAction(user.id, 'DELETE', user.firstName)}
                                            disabled={processing === user.id}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-xs text-slate-500 flex justify-between items-center">
            <span>Total Users: {filteredUsers.length}</span>
        </div>
      </div>

      {/* FUNDING MODAL */}
      {fundingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet className="text-blue-600" size={18} /> Fund Wallet
                    </h3>
                    <button onClick={() => setFundingUser(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X size={18} className="text-gray-500"/>
                    </button>
                </div>
                
                <form onSubmit={handleFundWallet} className="p-6 space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                            {fundingUser.firstName?.[0]}{fundingUser.lastName?.[0]}
                        </div>
                        <p className="text-sm text-gray-500">Funding account for</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{fundingUser.firstName} {fundingUser.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono">{fundingUser.email}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₦)</label>
                        <input 
                            type="number" 
                            required
                            min="100"
                            placeholder="e.g. 5000"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="w-full text-lg p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isFunding}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex justify-center gap-2 disabled:opacity-50"
                    >
                        {isFunding ? <Loader2 className="animate-spin" /> : 'Confirm Funding'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
