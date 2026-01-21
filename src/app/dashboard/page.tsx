'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  ChevronRight,
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
  History,
  FileText
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
        
        // FIX: The API returns the user object directly, not wrapped in { data: ... }
        if (data && data.id) {
            setUser(data);
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

  // Format currency
  const formattedBalance = Number(user?.walletBalance || 0).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-slate-900">
      
      {/* 1. MOBILE HEADER & WALLET SECTION */}
      <div className="bg-white px-6 pt-6 pb-8 rounded-b-[2rem] shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Overview
            </h1>
            <p className="text-sm text-slate-500">Monitor your API usage & logs</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>

        {/* Wallet Card */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Wallet Balance</p>
                    <h2 className="text-3xl font-bold tracking-tight mb-6 font-mono">{formattedBalance}</h2>
                </div>
                <div className="p-2 bg-white/10 rounded-lg">
                    <Wallet size={20} className="text-blue-400" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/dashboard/wallet"
                className="bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold text-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="bg-slate-800 text-slate-300 py-3 rounded-lg text-sm font-semibold text-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HISTORY / LOGS GRID */}
      <div className="px-5 mt-8 space-y-10">
        
        {/* --- IDENTITY LOGS --- */}
        <CategorySection title="Identity Logs (NIN)" icon={<Fingerprint size={16} className="text-blue-600"/>}>
          <HistoryLink 
            title="Verification History" 
            subtitle="View NIN verification logs"
            href="/dashboard/services/nin-verification"
            icon={<UserCheck size={18} />}
          />
          <HistoryLink 
            title="Validation History" 
            subtitle="View validation requests"
            href="/dashboard/services/nin/validation"
            icon={<Search size={18} />}
          />
          <HistoryLink 
            title="VNIN Slips" 
            subtitle="Generated slip records"
            href="/dashboard/services/nin-slips"
            icon={<FileBadge size={18} />}
          />
          <HistoryLink 
            title="Modification Requests" 
            subtitle="Track status of modifications"
            href="/dashboard/services/nin/modification"
            icon={<FileText size={18} />}
          />
           <HistoryLink 
            title="IPE Clearance" 
            subtitle="Integration clearance logs"
            href="/dashboard/services/nin/ipe-clearance"
            icon={<ShieldCheck size={18} />}
          />
        </CategorySection>

        {/* --- BANKING LOGS (BVN) --- */}
        <CategorySection title="Banking Logs (BVN)" icon={<Landmark size={16} className="text-teal-600"/>}>
          <HistoryLink 
            title="Verification History" 
            subtitle="View BVN check logs"
            href="/dashboard/services/bvn/verification"
            icon={<ShieldCheck size={18} />}
          />
          <HistoryLink 
            title="VNIN to NIBSS" 
            subtitle="Push records history"
            href="/dashboard/services/bvn/vnin-to-nibss"
            icon={<RefreshCcw size={18} />}
          />
          <HistoryLink 
            title="Enrollment Requests" 
            subtitle="Track new enrollments"
            href="/dashboard/services/bvn/enrollment"
            icon={<UserCheck size={18} />}
          />
          <HistoryLink 
            title="Modification Requests" 
            subtitle="Track BVN updates"
            href="/dashboard/services/bvn/modification"
            icon={<FileText size={18} />}
          />
           <HistoryLink 
            title="Premium Slips" 
            subtitle="Downloaded slip logs"
            href="/dashboard/services/bvn/premium-slip"
            icon={<FileBadge size={18} />}
          />
           <HistoryLink 
            title="Retrieval History" 
            subtitle="Lost BVN search logs"
            href="/dashboard/services/bvn/retrieval"
            icon={<Search size={18} />}
          />
        </CategorySection>

        {/* --- CORPORATE LOGS --- */}
        <CategorySection title="Corporate Logs" icon={<Building2 size={16} className="text-purple-600"/>}>
          <HistoryLink 
            title="CAC Registrations" 
            subtitle="Track company formations"
            href="/dashboard/services/cac"
            icon={<Building2 size={18} />}
          />
          <HistoryLink 
            title="Tax ID (TIN)" 
            subtitle="TIN generation history"
            href="/dashboard/services/tax-id"
            icon={<Receipt size={18} />}
          />
        </CategorySection>

        {/* --- EDUCATION LOGS --- */}
        <CategorySection title="Education Logs" icon={<GraduationCap size={16} className="text-pink-600"/>}>
          <HistoryLink 
            title="JAMB Requests" 
            subtitle="Result & Admission logs"
            href="/dashboard/services/education/jamb"
            icon={<School size={18} />}
          />
          <HistoryLink 
            title="Exam Pins" 
            subtitle="Pin purchase history"
            href="/dashboard/services/education/exam-pins"
            icon={<FileBadge size={18} />}
          />
        </CategorySection>

        {/* --- UTILITY LOGS --- */}
        <CategorySection title="Utility Logs" icon={<Wifi size={16} className="text-cyan-600"/>}>
          <HistoryLink 
            title="Airtime Transactions" 
            subtitle="VTU top-up records"
            href="/dashboard/services/utilities"
            icon={<Smartphone size={18} />}
          />
           <HistoryLink 
            title="Data Transactions" 
            subtitle="Data bundle records"
            href="/dashboard/services/utilities/data"
            icon={<Wifi size={18} />}
          />
        </CategorySection>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4 ml-1 border-b border-gray-100 pb-2">
        {icon}
        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function HistoryLink({ title, subtitle, href, icon }: { title: string, subtitle: string, href: string, icon: any }) {
  return (
    <Link 
      href={href}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 text-sm truncate group-hover:text-blue-700 transition-colors">{title}</h4>
        <p className="text-xs text-slate-400 truncate">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
