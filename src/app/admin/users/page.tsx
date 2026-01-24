'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Users, Search, Shield, ShieldOff, Ban, Trash2, CheckCircle2, MoreVertical, Wallet
} from 'lucide-react';

export default function AdminUserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Action State
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const res = await axios.get('/api/admin/users/list');
      if (res.data.status) {
          setUsers(res.data.data);
          setFilteredUsers(res.data.data);
      }
    } catch (error) {
        console.error("Failed to load users", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string, userName: string) => {
    const actionText = action === 'DELETE' ? 'PERMANENTLY DELETE' : action;
    if (!confirm(`Are you sure you want to ${actionText} user: ${userName}?`)) return;

    setProcessing(userId);
    try {
      const res = await axios.post('/api/admin/users/action', { userId, action });
      if (res.data.status) {
          alert(res.data.message);
          fetchUsers(); // Refresh list
      } else {
          alert(res.data.error);
      }
    } catch (e: any) {
        alert(e.response?.data?.error || "Action Failed");
    } finally {
        setProcessing(null);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-blue-600" /> User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
                Manage accounts, roles, and access permissions.
            </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search Name, Email, Phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-medium">User Details</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Wallet</th>
                        <th className="px-6 py-4 font-medium">Activity</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                
                                {/* User Info */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 text-sm">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <span className="text-xs text-slate-500">{user.email}</span>
                                        <span className="text-[10px] text-slate-400">{user.phoneNumber}</span>
                                    </div>
                                </td>

                                {/* Role */}
                                <td className="px-6 py-4">
                                    {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold border border-purple-200">
                                            <Shield size={10} /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200">
                                            USER
                                        </span>
                                    )}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    {user.isActive ? (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                            <CheckCircle2 size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                            <Ban size={10} /> Blocked
                                        </span>
                                    )}
                                </td>

                                {/* Wallet */}
                                <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                    ₦{Number(user.walletBalance).toLocaleString()}
                                </td>

                                {/* Activity (FIXED: Changed serviceRequests to requests) */}
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                        {user._count?.requests || 0} Requests
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                        
                                        {/* Block / Unblock */}
                                        {user.isActive ? (
                                            <button 
                                                onClick={() => handleAction(user.id, 'BLOCK', user.email)}
                                                disabled={processing === user.id}
                                                className="p-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded shadow-sm"
                                                title="Block User"
                                            >
                                                <Ban size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(user.id, 'UNBLOCK', user.email)}
                                                disabled={processing === user.id}
                                                className="p-2 bg-white border border-green-200 text-green-600 hover:bg-green-50 rounded shadow-sm"
                                                title="Unblock User"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                        )}

                                        {/* Make Admin / Remove Admin */}
                                        {user.role === 'AGENT' || user.role === 'USER' ? (
                                            <button 
                                                onClick={() => handleAction(user.id, 'MAKE_ADMIN', user.email)}
                                                disabled={processing === user.id}
                                                className="p-2 bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 rounded shadow-sm"
                                                title="Promote to Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(user.id, 'REMOVE_ADMIN', user.email)}
                                                disabled={processing === user.id}
                                                className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded shadow-sm"
                                                title="Demote to User"
                                            >
                                                <ShieldOff size={16} />
                                            </button>
                                        )}

                                        {/* Delete */}
                                        <button 
                                            onClick={() => handleAction(user.id, 'DELETE', user.email)}
                                            disabled={processing === user.id}
                                            className="p-2 bg-red-600 text-white hover:bg-red-700 rounded shadow-sm"
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
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
            <span>Total Users: {filteredUsers.length}</span>
        </div>
      </div>
    </div>
  );
}
