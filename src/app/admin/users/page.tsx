'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { Users, Search, DollarSign, Wallet } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Fund State
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    axios.get('/api/admin/users').then(res => {
        setUsers(res.data);
        setFiltered(res.data);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.email.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q)));
  }, [search, users]);

  const handleFund = async () => {
    if (!fundAmount) return;
    if(!confirm(`${fundType} user wallet by ₦${fundAmount}?`)) return;

    setProcessing(true);
    try {
      await axios.post('/api/admin/users/fund', {
        userId: selectedUser.id,
        amount: fundAmount,
        type: fundType,
        description: 'Manual Admin Adjustment'
      });
      alert("Success");
      setSelectedUser(null);
      // Refresh list
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch(e) { alert("Failed"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Users className="w-8 h-8 text-blue-600"/> User Management</h1>
        <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 bg-white dark:bg-gray-800" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                        <td className="px-6 py-4 text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 font-mono font-bold text-green-600">₦{user.walletBalance}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedUser(user)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200">Manage</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6">
                <h3 className="font-bold text-lg mb-4">Manage Wallet: {selectedUser.firstName}</h3>
                
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setFundType('CREDIT')} className={`flex-1 py-2 text-sm font-bold rounded ${fundType === 'CREDIT' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Credit (+)</button>
                    <button onClick={() => setFundType('DEBIT')} className={`flex-1 py-2 text-sm font-bold rounded ${fundType === 'DEBIT' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Debit (-)</button>
                </div>

                <div className="relative mb-4">
                    <span className="absolute left-3 top-2.5 text-gray-500">₦</span>
                    <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded text-lg font-bold" placeholder="0.00" />
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setSelectedUser(null)} className="flex-1 py-2 border rounded text-sm font-bold">Cancel</button>
                    <button onClick={handleFund} disabled={processing} className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-bold">
                        {processing ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
