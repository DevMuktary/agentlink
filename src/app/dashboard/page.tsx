'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ShieldCheck, UserCheck, Fingerprint, FileBadge, 
  RefreshCcw, Search, School, Landmark, Receipt, Building2, 
  GraduationCap, Wifi, Smartphone, Users, FileText, Wallet, Clock
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FETCH REAL DATA - NO MOCKS
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* 1. WELCOME & WALLET SECTION (Using your premium gradient design) */}
      <div className="bg-white dark:bg-slate-950 px-4 md:px-8 pt-6 pb-10 rounded-b-[2rem] shadow-sm border-b border-gray-100 dark:border-slate-800 mb-10 transition-colors">
        
        {/* Welcome Text */}
        <div className="mb-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Select a service below to start a new transaction.
          </p>
        </div>

        {/* Wallet Card */}
        <div className="max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#334155] dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1.5 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Available Balance
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight">{formattedBalance}</h2>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Link 
                href="/dashboard/wallet/fund"
                className="flex-1 sm:flex-none bg-white text-slate-900 px-8 py-3 rounded-xl text-sm font-bold text-center hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/history"
                className="flex-1 sm:flex-none bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl text-sm font-semibold text-center hover:bg-white/20 transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" /> History
              </Link>
            </div>
          </div>
          
          {/* Glowing Orbs */}
          <div className="absolute -right-6 -top-6 h-40 w-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 h-32 w-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* 2. FULL SERVICES GRID */}
      <div className="max-w-7xl mx-auto space-y-10 px-4 md:px-8">
        
        <CategorySection title="Identity Services" icon={<Fingerprint size={18} className="text-blue-600 dark:text-blue-400"/>}>
          <ServiceItem title="NIN Verification" href="/dashboard/nin-verification" icon={<UserCheck size={20} />} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"/>
          <ServiceItem title="NIN Validation" href="/dashboard/nin-validation" icon={<Search size={20} />} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"/>
          <ServiceItem title="VNIN Slip" href="/dashboard/vnin-slip" icon={<FileBadge size={20} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"/>
          <ServiceItem title="NIN Personalization" href="/dashboard/nin-personalization" icon={<Users size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
          <ServiceItem title="NIN Modification" href="/dashboard/nin-modification" icon={<FileText size={20} />} color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"/>
          <ServiceItem title="NIN Slip Generation" href="/dashboard/nin-slip" icon={<FileBadge size={20} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"/>
          <ServiceItem title="IPE Clearance" href="/dashboard/ipe-clearance" icon={<ShieldCheck size={20} />} color="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"/>
        </CategorySection>

        <CategorySection title="Banking & BVN" icon={<Landmark size={18} className="text-teal-600 dark:text-teal-400"/>}>
          <ServiceItem title="BVN Verification" href="/dashboard/bvn-verification" icon={<ShieldCheck size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <ServiceItem title="VNIN to NIBSS" href="/dashboard/vnin-to-nibss" icon={<RefreshCcw size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <ServiceItem title="BVN Enrollment" href="/dashboard/bvn-enrollment" icon={<UserCheck size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <ServiceItem title="BVN Modification" href="/dashboard/bvn-modification" icon={<FileText size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <ServiceItem title="BVN Premium Slip" href="/dashboard/bvn-premium-slip" icon={<FileBadge size={20} />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"/>
          <ServiceItem title="BVN Retrieval" href="/dashboard/bvn-retrieval" icon={<Search size={20} />} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"/>
        </CategorySection>

        <CategorySection title="Corporate Filings" icon={<Building2 size={18} className="text-purple-600 dark:text-purple-400"/>}>
          <ServiceItem title="CAC Registration" href="/dashboard/cac" icon={<Building2 size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
          <ServiceItem title="Tax ID Search" href="/dashboard/tax-id" icon={<Receipt size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
        </CategorySection>

        <CategorySection title="Education" icon={<GraduationCap size={18} className="text-pink-600 dark:text-pink-400"/>}>
          <ServiceItem title="JAMB Services" href="/dashboard/jamb" icon={<School size={20} />} color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"/>
          <ServiceItem title="Buy Exam Pins" href="/dashboard/exam-pins" icon={<FileBadge size={20} />} color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"/>
        </CategorySection>

        <CategorySection title="Utilities" icon={<Wifi size={18} className="text-orange-600 dark:text-orange-400"/>}>
          <ServiceItem title="Buy Airtime" href="/dashboard/airtime" icon={<Smartphone size={20} />} color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"/>
          <ServiceItem title="Buy Data Bundle" href="/dashboard/data" icon={<Wifi size={20} />} color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"/>
        </CategorySection>
        
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4 ml-1 border-b border-gray-200/60 dark:border-gray-800 pb-2">
        {icon}
        <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}

function ServiceItem({ title, href, icon, color }: { title: string, href: string, icon: any, color: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all active:scale-[0.98] group">
      <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h4>
      </div>
      <div className="text-gray-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform duration-300 group-hover:translate-x-1">
        <ChevronRight size={18} strokeWidth={2.5} />
      </div>
    </Link>
  );
}
