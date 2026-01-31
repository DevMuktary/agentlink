'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, 
  Smartphone, Wifi, UserCheck, CreditCard, 
  Building2, GraduationCap, CheckCircle2, XCircle, Clock, ChevronRight, 
  Search, Bell, MoreHorizontal, ShieldCheck, Zap
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        const [userRes, txRes] = await Promise.all([
            fetch('/api/user/me'),
            fetch('/api/user/transactions?limit=5') 
        ]);

        const userData = await userRes.json();
        const txData = txRes.ok ? await txRes.json() : { data: [] }; 
        
        setUser(userData.id ? userData : userData.data);
        setTransactions(txData.data || []);
      } catch (error) {
        console.error('Dashboard Data Error', error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  if (loading) return <GlobalLoader />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const balance = Number(user?.walletBalance || 0);

  // Calculate generic stats from loaded transactions (Real data usage)
  const totalSpent = transactions
    .filter((t: any) => t.type === 'SERVICE_CHARGE' && t.status === 'COMPLETED')
    .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, <span className="font-semibold text-slate-700">{firstName}</span></p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
           </button>
           <Link 
             href="/dashboard/profile"
             className="flex items-center gap-2 bg-white border border-slate-200 pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-50 transition-all group"
           >
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {firstName[0]}
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">My Profile</span>
           </Link>
        </div>
      </div>

      {/* 2. MAIN STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WALLET CARD (Dark Theme) */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#0B1120] rounded-2xl p-8 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold tracking-tight text-white">
                  ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                <Wallet className="text-white opacity-80" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Link 
                href="/dashboard/wallet"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-md transition-all active:scale-95"
              >
                Transaction History
              </Link>
            </div>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute left-0 bottom-0 h-48 w-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* QUICK STATS (Light Theme) */}
        <div className="grid grid-rows-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-colors">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-900">₦{totalSpent.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight size={20} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-colors">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownLeft size={20} />
                </div>
            </div>
        </div>
      </div>

      {/* 3. SERVICES HUB */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-900 text-lg">Services Hub</h3>
            <span className="text-xs text-slate-400 font-medium">Quick Access</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ServiceCard href="/dashboard/services/utilities/airtime" icon={<Smartphone size={24} />} title="Airtime" subtitle="Top-up" color="cyan" />
            <ServiceCard href="/dashboard/services/utilities/data" icon={<Wifi size={24} />} title="Data Bundle" subtitle="Internet" color="indigo" />
            <ServiceCard href="/dashboard/services/nin-verification" icon={<UserCheck size={24} />} title="Verify NIN" subtitle="Identity" color="blue" />
            <ServiceCard href="/dashboard/services/nin-slips" icon={<CreditCard size={24} />} title="Print Slip" subtitle="NIN/BVN" color="emerald" />
            <ServiceCard href="/dashboard/services/education/exam-pins" icon={<GraduationCap size={24} />} title="Exam Pins" subtitle="WAEC/NECO" color="pink" />
            <ServiceCard href="/dashboard/services/cac" icon={<Building2 size={24} />} title="CAC" subtitle="Corporate" color="orange" />
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recent Activity</h3>
            <p className="text-slate-500 text-xs mt-0.5">Your latest financial movements</p>
          </div>
          <Link href="/dashboard/wallet" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Service Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Clock size={24} />
                        </div>
                        <div className="text-slate-500">
                            <p className="font-medium text-slate-900">No transactions yet</p>
                            <p className="text-xs mt-1">Your recent activity will appear here.</p>
                        </div>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-slate-700">{tx.reference}</td>
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{tx.description}</div>
                        <div className="text-xs text-slate-500 capitalize">{tx.serviceId?.replace(/_/g, ' ').toLowerCase()}</div>
                    </td>
                    <td className={`px-6 py-4 font-medium ${tx.type === 'REFUND' || tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {tx.type === 'REFUND' || tx.type === 'DEPOSIT' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()} <span className="text-slate-300">|</span> {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// --- COMPONENTS ---

function ServiceCard({ href, icon, title, subtitle, color }: any) {
    const colorStyles: any = {
        cyan: 'text-cyan-600 bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white',
        indigo: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
        blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white',
        emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
        pink: 'text-pink-600 bg-pink-50 group-hover:bg-pink-600 group-hover:text-white',
        orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white',
    };

    return (
        <Link 
            href={href} 
            className="flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
        >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 ${colorStyles[color]}`}>
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 text-sm text-center">{title}</h4>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-1">{subtitle}</span>
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        FAILED: 'bg-red-100 text-red-700 border-red-200',
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    
    const style = styles[status as keyof typeof styles] || styles.PENDING;
    const label = status === 'COMPLETED' ? 'Success' : status.charAt(0) + status.slice(1).toLowerCase();

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
            {status === 'COMPLETED' && <CheckCircle2 size={10} className="mr-1" />}
            {status === 'FAILED' && <XCircle size={10} className="mr-1" />}
            {label}
        </span>
    );
}
