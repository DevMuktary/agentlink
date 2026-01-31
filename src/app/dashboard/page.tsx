'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Activity, 
  CheckCircle2, XCircle, Clock, MoreHorizontal,
  CreditCard, Smartphone, UserCheck, RefreshCw
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch User
        const userRes = await fetch('/api/user/me');
        const userData = await userRes.json();
        
        // Fetch Recent Transactions (Limit 5)
        const txRes = await fetch('/api/user/transactions?limit=5'); // Assuming you have/will create this
        // Mocking transactions for now if API isn't ready
        const txData = { data: [] }; 

        if (userData.status || userData.id) {
          setUser(userData.data || userData);
        }
        setTransactions(txData.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <GlobalLoader />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const balance = user?.walletBalance ? Number(user.walletBalance) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of your wallet and api activities.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/wallet" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition flex items-center gap-2">
            <Wallet size={16} /> Fund Wallet
          </Link>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Wallet size={20} /></div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+ Active</span>
          </div>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Wallet Balance</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Total Spent (Mock Logic) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><ArrowUpRight size={20} /></div>
          </div>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Spent (30d)</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">₦0.00</h2>
        </div>

        {/* Request Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Activity size={20} /></div>
          </div>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Requests</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">0</h2>
        </div>
      </div>

      {/* 3. MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/dashboard/services/nin-verification" icon={<UserCheck size={18}/>} label="Verify NIN" color="bg-blue-50 text-blue-600" />
            <QuickAction href="/dashboard/services/utilities/data" icon={<Activity size={18}/>} label="Buy Data" color="bg-green-50 text-green-600" />
            <QuickAction href="/dashboard/services/utilities" icon={<Smartphone size={18}/>} label="Airtime" color="bg-orange-50 text-orange-600" />
            <QuickAction href="/dashboard/services/bvn/verification" icon={<CreditCard size={18}/>} label="Verify BVN" color="bg-teal-50 text-teal-600" />
          </div>
        </div>

        {/* RIGHT: Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No recent transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-700">{tx.serviceId}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{tx.reference}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">₦{Number(tx.amount).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function QuickAction({ href, icon, label, color }: any) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 hover:border-slate-300 hover:shadow-sm transition bg-slate-50/50">
      <div className={`p-2 rounded-full mb-2 ${color}`}>{icon}</div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETED') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700"><CheckCircle2 size={12} /> Success</span>;
  if (status === 'FAILED') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700"><XCircle size={12} /> Failed</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending</span>;
}
