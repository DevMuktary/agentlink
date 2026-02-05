'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, XCircle, Search, User, 
  Phone, Mail, Calendar, Briefcase, ShieldAlert
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function RegistrationRequests() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users/pending');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.email.toLowerCase().includes(q) || 
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        (u.businessName && u.businessName.toLowerCase().includes(q))
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Action Handler (Approve/Reject)
  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to ${action} this user? They will be notified via email.`)) return;

    setProcessing(true);
    try {
      const res = await axios.post('/api/admin/users/action', {
        userId: selectedUser.id,
        action: action
      });

      if (res.data.success) {
        alert(`User ${action === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully!`);
        setSelectedItem(null);
        fetchPendingUsers(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      alert('Action Failed. Check console.');
    } finally {
      setProcessing(false);
    }
  };

  // Helper for modal
  const setSelectedItem = (item: any) => setSelectedUser(item);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-8 h-8 text-blue-600" /> Registration Requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review and approve new agent accounts.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Name, Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg text-orange-600 dark:text-orange-200">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredUsers.length === 0 ? (
           <div className="p-12 text-center text-gray-500 dark:text-gray-400">
             <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>No pending registration requests found.</p>
           </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Business</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {user.businessName || '---'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {user.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedUser(user)} 
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !processing && setSelectedUser(null)}
          />

          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Applicant Details</h3>
              <button 
                onClick={() => !processing && setSelectedUser(null)}
                disabled={processing}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
              >
                <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Profile Card */}
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                 </div>
                 <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                       <Mail className="w-3 h-3" /> {selectedUser.email}
                    </p>
                 </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block mb-1">Business Name</span>
                    <span className="font-medium text-gray-900 dark:text-white block flex items-center gap-2">
                       <Briefcase className="w-3 h-3" /> {selectedUser.businessName || 'N/A'}
                    </span>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block mb-1">Phone Number</span>
                    <span className="font-medium text-gray-900 dark:text-white block flex items-center gap-2">
                       <Phone className="w-3 h-3" /> {selectedUser.phoneNumber || 'N/A'}
                    </span>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block mb-1">Registered On</span>
                    <span className="font-medium text-gray-900 dark:text-white block flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                 </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                 <button
                    onClick={() => handleAction('REJECT')}
                    disabled={processing}
                    className="flex-1 py-3 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                 >
                    {processing ? 'Processing...' : 'Reject Account'}
                 </button>
                 <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={processing}
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    {processing ? (
                      'Processing...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Approve Account
                      </>
                    )}
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
