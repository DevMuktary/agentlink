'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, UserCheck, Fingerprint, FileBadge, 
  RefreshCcw, Search, School, Landmark, Receipt, Building2, 
  GraduationCap, Wifi, Smartphone, Users, FileText, Wallet, Clock
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
    <div className="animate-in fade-in duration-500">
      
      {/* 1. WALLET & WELCOME CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 border border-slate-800/50">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 uppercase tracking-wider">
              <Wallet className="w-4 h-4" /> Available API Balance
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{formattedBalance}</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link 
              href="/dashboard/wallet/fund"
              className="flex-1 sm:flex-none bg-white text-slate-900 px-8 py-3.5 rounded-xl text-sm font-bold text-center hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
            >
              Fund Wallet
            </Link>
            <Link 
              href="/dashboard/history"
              className="flex-1 sm:flex-none bg-white/5 backdrop-blur-md text-white px-6 py-3.5 rounded-xl text-sm font-semibold text-center hover:bg-white/10 transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" /> History
            </Link>
          </div>
        </div>
        
        {/* Abstract Glowing Orbs for the premium feel */}
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 h-48 w-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. CARD-BASED SERVICES GRID */}
      <div className="space-y-12">
        
        <CategorySection title="Identity Verification" icon={<Fingerprint size={20} className="text-blue-500"/>}>
          <ServiceCard title="NIN Verification" desc="Verify via standard NIN" href="/dashboard/nin-verification" icon={<UserCheck size={24} />} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
          <ServiceCard title="NIN Validation" desc="Deep database validation" href="/dashboard/nin-validation" icon={<Search size={24} />} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
          <ServiceCard title="VNIN Slip" desc="Generate Virtual NIN slip" href="/dashboard/vnin-slip" icon={<FileBadge size={24} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" />
          <ServiceCard title="NIN Personalization" desc="Update profile details" href="/dashboard/nin-personalization" icon={<Users size={24} />} color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" />
          <ServiceCard title="NIN Modification" desc="Modify existing records" href="/dashboard/nin-modification" icon={<FileText size={24} />} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
          <ServiceCard title="Slip Generation" desc="Print standard slips" href="/dashboard/nin-slip" icon={<FileBadge size={24} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" />
          <ServiceCard title="IPE Clearance" desc="Clearance verification" href="/dashboard/ipe-clearance" icon={<ShieldCheck size={24} />} color="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" />
        </CategorySection>

        <CategorySection title="Banking & BVN" icon={<Landmark size={20} className="text-teal-500"/>}>
          <ServiceCard title="BVN Verification" desc="Verify bank identity" href="/dashboard/bvn-verification" icon={<ShieldCheck size={24} />} color="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" />
          <ServiceCard title="VNIN to NIBSS" href="/dashboard/vnin-to-nibss" desc="Sync with NIBSS" icon={<RefreshCcw size={24} />} color="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" />
          <ServiceCard title="BVN Enrollment" href="/dashboard/bvn-enrollment" desc="Register new BVN" icon={<UserCheck size={24} />} color="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" />
          <ServiceCard title="BVN Modification" href="/dashboard/bvn-modification" desc="Update bank details" icon={<FileText size={24} />} color="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" />
          <ServiceCard title="Premium Slip" href="/dashboard/bvn-premium-slip" desc="Generate premium BVN" icon={<FileBadge size={24} />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
          <ServiceCard title="BVN Retrieval" href="/dashboard/bvn-retrieval" desc="Recover lost BVN" icon={<Search size={24} />} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400" />
        </CategorySection>

        <CategorySection title="Corporate Filings" icon={<Building2 size={20} className="text-purple-500"/>}>
          <ServiceCard title="CAC Registration" desc="Register business names" href="/dashboard/cac" icon={<Building2 size={24} />} color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" />
          <ServiceCard title="Tax ID Search" desc="Lookup TIN records" href="/dashboard/tax-id" icon={<Receipt size={24} />} color="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" />
        </CategorySection>

        <CategorySection title="Education" icon={<GraduationCap size={20} className="text-pink-500"/>}>
          <ServiceCard title="JAMB Services" desc="Pins and profiles" href="/dashboard/jamb" icon={<School size={24} />} color="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400" />
          <ServiceCard title="Exam Pins" desc="WAEC, NECO & NABTEB" href="/dashboard/exam-pins" icon={<FileBadge size={24} />} color="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400" />
        </CategorySection>

        <CategorySection title="Utilities & Bills" icon={<Wifi size={20} className="text-orange-500"/>}>
          <ServiceCard title="Buy Airtime" desc="All networks supported" href="/dashboard/airtime" icon={<Smartphone size={24} />} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
          <ServiceCard title="Data Bundles" desc="Instant top-up" href="/dashboard/data" icon={<Wifi size={24} />} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
        </CategorySection>
        
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{title}</h3>
      </div>
      {/* PERFECT GRID SIZING: 2 cards on mobile, 3 on tablet, 4 on desktop, 5 on large screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {children}
      </div>
    </div>
  );
}

function ServiceCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href} 
      className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center gap-3"
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${color}`}>
        {icon}
      </div>
      <div className="mt-1">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </Link>
  );
}
