'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, Eye, EyeOff, Plus, Fingerprint, ShieldCheck, 
  Building2, Wifi, Code2, ArrowRight, Clock, ChevronRight, Activity
} from 'lucide-react';

export default function DashboardCommandCenter() {
  const [hideBalance, setHideBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real scenario, you would fetch the balance and recent history here
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setBalance(145000.50); // Mock balance
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to load dashboard data");
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Welcome to your AgentHub Command Center.
            </p>
          </div>
          <div className="flex items-center gap-3">
             {/* Link to the history folder you just organized */}
             <Link 
              href="/dashboard/history" 
              className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
             >
               <Clock className="w-4 h-4" /> View History
             </Link>
          </div>
        </div>

        {/* TOP ROW: WALLET & QUICK STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Main Wallet Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-900/20 border border-blue-500/30">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-blue-100 font-medium text-sm">
                  <Wallet className="w-4 h-4" /> Available Balance
                </div>
                <button 
                  onClick={() => setHideBalance(!hideBalance)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-blue-50"
                >
                  {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                {loading ? (
                  <div className="h-10 w-48 bg-white/20 animate-pulse rounded-lg mt-2"></div>
                ) : (
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                    {hideBalance ? '••••••••' : (balance !== null ? formatCurrency(balance) : '₦0.00')}
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-sm active:scale-95 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Fund Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Quick API/Developer Stats Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
             <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <Link href="/dashboard/api-keys" className="text-slate-400 group-hover:text-blue-500 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </Link>
             </div>
             <div className="mt-6">
               <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">API Requests (Today)</h3>
               <div className="flex items-baseline gap-2 mt-1">
                 <span className="text-3xl font-bold text-slate-900 dark:text-white">1,248</span>
                 <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
               </div>
               <p className="text-xs text-slate-400 mt-3 font-medium">Manage your API keys & Webhooks →</p>
             </div>
          </div>
        </div>

        {/* MIDDLE GRID: QUICK ACTIONS */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Services & Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Identity Group */}
            <Link href="/dashboard/services/nin" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col gap-3">
               <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                 <Fingerprint className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white">NIN Verification</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Premium Slip & Validation</p>
               </div>
            </Link>

            <Link href="/dashboard/services/bvn" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white">BVN Services</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Lookup & NIBSS Sync</p>
               </div>
            </Link>

            <Link href="/dashboard/services/cac" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col gap-3">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                 <Building2 className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Corporate Filing</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">CAC & Tax ID Search</p>
               </div>
            </Link>

            <Link href="/dashboard/services/utilities" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col gap-3">
               <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                 <Wifi className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white">Utilities & Bills</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Airtime, Data & Exams</p>
               </div>
            </Link>

          </div>
        </div>

        {/* BOTTOM ROW: RECENT ACTIVITY MINI-VIEW */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link href="/dashboard/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Example Row 1 */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">NIN Premium Slip</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reference: AGT-98234-NIN</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">- ₦350.00</p>
                <p className="text-xs text-green-500 font-semibold">Successful</p>
              </div>
            </div>

            {/* Example Row 2 */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">CAC Search</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reference: AGT-22119-CAC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">- ₦150.00</p>
                <p className="text-xs text-green-500 font-semibold">Successful</p>
              </div>
            </div>
            
            {/* Example Row 3 (Fund Wallet) */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Wallet Top-up</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bank Transfer (Wema)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">+ ₦10,000.00</p>
                <p className="text-xs text-green-500 font-semibold">Successful</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}