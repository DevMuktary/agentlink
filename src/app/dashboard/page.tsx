'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Activity, 
  CreditCard, Search, Zap, Building2, ChevronRight, 
  MoreHorizontal, FileText, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mocking recent transactions for visual demo (Connect to your /api/transactions later)
  const recentTransactions = [
    { id: 'TX-10293', service: 'NIN Verification', amount: 100, status: 'SUCCESS', date: 'Just now' },
    { id: 'TX-10292', service: 'Airtime Vending', amount: 500, status: 'FAILED', date: '2 mins ago' },
    { id: 'TX-10291', service: 'CAC Registration', amount: 15000, status: 'PENDING', date: '1 hour ago' },
    { id: 'TX-10290', service: 'Data Bundle (MTN)', amount: 2500, status: 'SUCCESS', date: '3 hours ago' },
  ];

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        
        if (data && data.id) {
          setUser(data);
        } else if (data.status && data.data) {
          setUser(data.data);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <GlobalLoader />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const balanceValue = user?.walletBalance ? Number(user.walletBalance) : 0;
  
  const formattedBalance = balanceValue.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans text-slate-900">
      
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of your wallet and api activities.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/wallet" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition flex items-center gap-2">
            <Wallet size={16} /> Fund Wallet
          </Link>
        </div>
      </div>

      {/* 2. FINANCIAL OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Wallet Card */}
        <div className="bg-black text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40 relative overflow-hidden group">
          <div className="z-10">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Available Balance</p>
            <h2 className="text-3xl font-bold font-mono tracking-tight">{formattedBalance}</h2>
          </div>
          <div className="z-10 flex gap-4 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span>
            <span className="flex items-center gap-1"><CreditCard size={14} /> NGN Wallet</span>
          </div>
          {/* Decor */}
          <div className="absolute right-0 top-0 h-32 w-32 bg-slate-800/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>

        {/* Quick Stats 1 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-40">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
            <span className="text-slate-500 text-sm font-medium">Total Transactions</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">1,204</h3>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> +12% this month
          </p>
        </div>

        {/* Quick Stats 2 */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center h-40">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Zap size={20} />
            </div>
            <span className="text-slate-500 text-sm font-medium">Services Used</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">8 Services</h3>
          <p className="text-xs text-slate-400 mt-1">Most used: NIN Verification</p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS (The "Do It Now" Section) */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction href="/dashboard/services/nin-verification" icon={<Search size={24} />} title="Verify NIN" desc="Lookup Identity" />
          <QuickAction href="/dashboard/services/utilities/data" icon={<Zap size={24} />} title="Buy Data" desc="SME & Corporate" />
          <QuickAction href="/dashboard/services/cac" icon={<Building2 size={24} />} title="CAC Reg" desc="Business Name" />
          <QuickAction href="/dashboard/services/nin-slips" icon={<FileText size={24} />} title="Print Slip" desc="NIN & BVN" />
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <Link href="/dashboard/transactions" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.service}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tx.id}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">₦{tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// --- COMPONENTS ---

function QuickAction({ href, icon, title, desc }: { href: string, icon: any, title: string, desc: string }) {
  return (
    <Link href={href} className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-900 hover:shadow-md transition-all group">
      <div className="mb-3 text-slate-500 group-hover:text-slate-900 transition-colors">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'SUCCESS') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 size={12} /> Success</span>;
  }
  if (status === 'FAILED') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} /> Failed</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
}
