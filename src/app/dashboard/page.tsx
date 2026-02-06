'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  History,
  ShieldCheck, 
  UserCheck, 
  Fingerprint, 
  FileBadge, 
  RefreshCcw, 
  Search,
  School,
  Landmark,
  Receipt,
  Building2,
  GraduationCap,
  Wifi,
  Smartphone,
  Users
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* 1. WELCOME & WALLET SECTION */}
      <div className="bg-white dark:bg-slate-950 px-5 pt-4 pb-8 rounded-b-[2rem] shadow-sm border-b border-gray-100 dark:border-slate-800 mb-8 transition-colors">
        
        {/* Welcome Text */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">API Activity Overview</p>
        </div>

        {/* Wallet Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#334155] dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none">
          <div className="relative z-10">
            <p className="text-slate-300 text-sm font-medium mb-1">API Wallet Balance</p>
            <h2 className="text-3xl font-bold tracking-tight mb-6">{formattedBalance}</h2>
            
            <div className="flex gap-3">
              <Link 
                href="/dashboard/wallet"
                className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="flex-1 bg-white/10 backdrop-blur-md text-white py-3 rounded-xl text-sm font-semibold text-center hover:bg-white/20 transition-colors border border-white/10"
              >
                History
              </Link>
            </div>
          </div>
          <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -bottom-6 h-24 w-24 bg-blue-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* 2. SERVICES HISTORY GRID */}
      <div className="space-y-10 px-4 md:px-0">
        
        <CategorySection title="Identity Logs" icon={<Fingerprint size={18} className="text-blue-600 dark:text-blue-400"/>}>
          <HistoryItem title="NIN Verification Logs" href="/dashboard/services/nin-verification" icon={<UserCheck size={20} />} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"/>
          <HistoryItem title="NIN Validation History" href="/dashboard/services/nin/validation" icon={<Search size={20} />} color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"/>
          <HistoryItem title="VNIN Slip History" href="/dashboard/services/vnin" icon={<FileBadge size={20} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"/>
          <HistoryItem title="NIN Personalization" href="/dashboard/services/nin/personalization" icon={<Users size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
          <HistoryItem title="Modification History" href="/dashboard/services/nin/modification" icon={<FileTextIcon />} color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"/>
           <HistoryItem title=" NIN Slip History" href="/dashboard/services/nin-slips" icon={<FileBadge size={20} />} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"/>
          <HistoryItem title="IPE Clearance Logs" href="/dashboard/services/nin/ipe-clearance" icon={<ShieldCheck size={20} />} color="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"/>
        </CategorySection>

        <CategorySection title="Banking Logs" icon={<Landmark size={18} className="text-teal-600 dark:text-teal-400"/>}>
          <HistoryItem title="BVN Verification Logs" href="/dashboard/services/bvn/verification" icon={<ShieldCheck size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <HistoryItem title="VNIN to NIBSS History" href="/dashboard/services/bvn/vnin-to-nibss" icon={<RefreshCcw size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <HistoryItem title="Enrollment History" href="/dashboard/services/bvn/enrollment" icon={<UserCheck size={20} />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <HistoryItem title="BVN Modification Logs" href="/dashboard/services/bvn/modification" icon={<FileTextIcon />} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"/>
          <HistoryItem title="Premium Slip History" href="/dashboard/services/bvn/premium-slip" icon={<FileBadge size={20} />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"/>
          <HistoryItem title="Retrieval History" href="/dashboard/services/bvn/retrieval" icon={<Search size={20} />} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"/>
        </CategorySection>

        <CategorySection title="Corporate Logs" icon={<Building2 size={18} className="text-purple-600 dark:text-purple-400"/>}>
          <HistoryItem title="CAC Registration Logs" href="/dashboard/services/cac" icon={<Building2 size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
          <HistoryItem title="Tax ID Logs" href="/dashboard/services/tax-id" icon={<Receipt size={20} />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"/>
        </CategorySection>

        <CategorySection title="Education Logs" icon={<GraduationCap size={18} className="text-pink-600 dark:text-pink-400"/>}>
          <HistoryItem title="JAMB Services History" href="/dashboard/services/education/jamb" icon={<School size={20} />} color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"/>
          <HistoryItem title="Exam Pins History" href="/dashboard/services/education/exam-pins" icon={<FileBadge size={20} />} color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"/>
        </CategorySection>

        <CategorySection title="Utility Logs" icon={<Wifi size={18} className="text-cyan-600 dark:text-cyan-400"/>}>
          <HistoryItem title="Airtime History" href="/dashboard/services/utilities" icon={<Smartphone size={20} />} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"/>
          <HistoryItem title="Data Bundle History" href="/dashboard/services/utilities/data" icon={<Wifi size={20} />} color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"/>
        </CategorySection>
      </div>
    </div>
  );
}

// --- COMPONENTS ---
function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4 ml-1 border-b border-gray-100 dark:border-gray-800 pb-2">
        {icon}
        <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function HistoryItem({ title, href, icon, color }: { title: string, href: string, icon: any, color: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{title}</h4>
      </div>
      <div className="text-gray-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
        <History size={16} />
      </div>
    </Link>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
      <line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
  );
}
