'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, Plus, ArrowRight, Fingerprint, 
  Smartphone, Wifi, Landmark, Building2, 
  GraduationCap, FileText, Bell, TrendingUp, 
  ArrowUpRight, ArrowDownLeft, Clock
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (data && (data.id || data.data)) {
          setUser(data.id ? data : data.data);
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Agent';
  const balance = user?.walletBalance ? Number(user.walletBalance) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* 1. TOP HEADER (Mobile Friendly) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {firstName}</p>
        </div>
        <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* 2. WALLET CARD (Fintech Style) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Wallet size={16} /> Available Balance
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-green-400 border border-green-400/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span> Active
            </span>
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>

          <div className="flex gap-4">
            <Link 
              href="/dashboard/wallet"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/50"
            >
              <Plus size={18} /> Fund Wallet
            </Link>
            <Link 
              href="/dashboard/wallet"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all backdrop-blur-sm"
            >
              <HistoryIcon /> Transaction History
            </Link>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID (The "App" Feel) */}
      <div>
        <h3 className="text-slate-900 font-bold text-lg mb-4">Quick Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          
          <QuickAction 
            title="NIN Verify" 
            href="/dashboard/services/nin-verification" 
            icon={<Fingerprint size={24} />} 
            color="bg-blue-50 text-blue-600 border-blue-100"
          />
          <QuickAction 
            title="Buy Airtime" 
            href="/dashboard/services/utilities" 
            icon={<Smartphone size={24} />} 
            color="bg-orange-50 text-orange-600 border-orange-100"
          />
          <QuickAction 
            title="Buy Data" 
            href="/dashboard/services/utilities/data" 
            icon={<Wifi size={24} />} 
            color="bg-teal-50 text-teal-600 border-teal-100"
          />
          <QuickAction 
            title="BVN Services" 
            href="/dashboard/services/bvn/verification" 
            icon={<Landmark size={24} />} 
            color="bg-indigo-50 text-indigo-600 border-indigo-100"
          />
          <QuickAction 
            title="CAC Reg" 
            href="/dashboard/services/cac" 
            icon={<Building2 size={24} />} 
            color="bg-purple-50 text-purple-600 border-purple-100"
          />
          <QuickAction 
            title="JAMB" 
            href="/dashboard/services/education/jamb" 
            icon={<GraduationCap size={24} />} 
            color="bg-green-50 text-green-600 border-green-100"
          />
          <QuickAction 
            title="Print Slips" 
            href="/dashboard/services/nin-slips" 
            icon={<FileText size={24} />} 
            color="bg-pink-50 text-pink-600 border-pink-100"
          />
          <QuickAction 
            title="More..." 
            href="/dashboard/services" 
            icon={<ArrowRight size={24} />} 
            color="bg-gray-50 text-gray-600 border-gray-100"
          />

        </div>
      </div>

      {/* 4. RECENT ACTIVITY PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats (Placeholder for now) */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={18}/></div>
                <span className="text-slate-500 text-sm font-medium">Daily Spend</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">₦0.00</p>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Clock size={18}/></div>
                <span className="text-slate-500 text-sm font-medium">Last Login</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* Right: Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            <Link href="/dashboard/wallet" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {/* Placeholder Empty State or Map Real Data Here */}
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <HistoryIcon className="text-slate-300 w-8 h-8" />
                </div>
                <p className="text-slate-500 text-sm">No recent transactions found.</p>
                <Link href="/dashboard/services/utilities" className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Start Transacting
                </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function QuickAction({ title, href, icon, color }: { title: string, href: string, icon: React.ReactNode, color: string }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${color} bg-opacity-30 bg-white`}
    >
      <div className={`p-3 rounded-xl mb-3 ${color.split(' ')[0]}`}> {/* Use the bg-color part for the icon container */}
        {icon}
      </div>
      <span className="font-bold text-sm text-slate-700">{title}</span>
    </Link>
  );
}

function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
        </svg>
    )
}
