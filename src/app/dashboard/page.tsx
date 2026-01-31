'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  CreditCard, Smartphone, Wifi, UserCheck, 
  Building2, GraduationCap, ChevronRight, Clock, 
  CheckCircle2, XCircle, AlertCircle, History
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch User & Recent Transactions
  useEffect(() => {
    async function initData() {
      try {
        const [userRes, txRes] = await Promise.all([
            fetch('/api/user/me'),
            fetch('/api/user/transactions?limit=5') 
        ]);

        const userData = userRes.ok ? await userRes.json() : null;
        const txData = txRes.ok ? await txRes.json() : { data: [] }; 
        
        if (userData) {
            setUser(userData.id ? userData : userData.data);
        }
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Agent';
  const balance = Number(user?.walletBalance || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500 text-sm">Here is what's happening with your account today.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/wallet" 
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Clock size={16} /> History
          </Link>
          <Link 
            href="/dashboard/wallet" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <ArrowUpRight size={16} /> Fund Wallet
          </Link>
        </div>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Wallet Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
              <Wallet size={14} /> Available Balance
            </div>
            <div className="text-3xl font-bold tracking-tight mb-4">
              ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex gap-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">ID: {user?.id?.slice(0,8).toUpperCase()}</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> Active
                </span>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 h-32 w-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700"></div>
        </div>

        {/* Quick Stats 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Spent</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₦0.00</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Total volume processed</p>
        </div>

        {/* Quick Stats 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Services Used</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">0</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Successful transactions</p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickAction href="/dashboard/services/utilities/airtime" icon={<Smartphone size={20} />} label="Buy Airtime" color="cyan" />
          <QuickAction href="/dashboard/services/utilities/data" icon={<Wifi size={20} />} label="Buy Data" color="indigo" />
          <QuickAction href="/dashboard/services/nin-verification" icon={<UserCheck size={20} />} label="Verify NIN" color="green" />
          <QuickAction href="/dashboard/services/nin-slips" icon={<CreditCard size={20} />} label="Print Slip" color="emerald" />
          <QuickAction href="/dashboard/services/education/exam-pins" icon={<GraduationCap size={20} />} label="Exam Pins" color="pink" />
          <QuickAction href="/dashboard/services/cac" icon={<Building2 size={20} />} label="CAC Reg" color="purple" />
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <Link href="/dashboard/wallet" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                        {/* FIX: Wrapped Icon in a DIV to prevent passing props directly to SVG if conflicting */}
                        <div className="opacity-20">
                            <History size={32} />
                        </div>
                        <p>No recent transactions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{tx.reference}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{tx.description}</td>
                    <td className="px-5 py-4 text-slate-600">₦{Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
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

// --- SUB COMPONENTS ---

function QuickAction({ href, icon, label, color }: { href: string, icon: any, label: string, color: string }) {
  const colorStyles: any = {
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
    green: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
  };

  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${colorStyles[color] || 'bg-white'}`}
    >
      <div className="mb-2 p-2 bg-white rounded-full shadow-sm">{icon}</div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETED') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 size={10} /> Success</span>;
  }
  if (status === 'FAILED') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={10} /> Failed</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertCircle size={10} /> Pending</span>;
}
