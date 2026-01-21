'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight,
  ShieldCheck, 
  UserCheck, 
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
  Activity
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/me');
        // FIX: The API returns the user object directly, not wrapped in { data: ... }
        const userData = await res.json(); 
        
        if (userData && userData.id) {
          setUser(userData);
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

  // Format currency safely
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
            <p className="text-sm text-slate-500">API Transaction History</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-100">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>

        {/* Wallet Card */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Wallet Balance</p>
              <h2 className="text-3xl font-bold tracking-tight text-white">{formattedBalance}</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
              <Activity className="text-green-400" size={24} />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
             <Link 
                href="/dashboard/wallet"
                className="flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span>View Wallet History</span>
                <ChevronRight size={16} />
              </Link>
          </div>
        </div>
      </div>

      {/* 2. SERVICES LOGS GRID */}
      <div className="px-5 mt-8 space-y-10">
        
        {/* --- IDENTITY LOGS --- */}
        <CategorySection title="Identity Services Logs" icon={<History size={16} className="text-blue-600"/>}>
          <LogItem 
            title="NIN Verification" 
            subtitle="View Verification History"
            href="/dashboard/services/nin-verification"
            color="bg-blue-50 text-blue-600"
          />
          <LogItem 
            title="NIN Validation" 
            subtitle="View Validation History"
            href="/dashboard/services/nin/validation"
            color="bg-blue-50 text-blue-600"
          />
          <LogItem 
            title="VNIN Slips" 
            subtitle="View Generated Slips"
            href="/dashboard/services/nin-slips"
            color="bg-indigo-50 text-indigo-600"
          />
          <LogItem 
            title="NIN Modification" 
            subtitle="View Modification Requests"
            href="/dashboard/services/nin/modification"
            color="bg-orange-50 text-orange-600"
          />
           <LogItem 
            title="IPE Clearance" 
            subtitle="View Clearance Logs"
            href="/dashboard/services/nin/ipe-clearance"
            color="bg-red-50 text-red-600"
          />
        </CategorySection>

        {/* --- BANKING LOGS --- */}
        <CategorySection title="Banking Services Logs" icon={<Landmark size={16} className="text-teal-600"/>}>
          <LogItem 
            title="BVN Verification" 
            subtitle="View Verification History"
            href="/dashboard/services/bvn/verification"
            color="bg-teal-50 text-teal-600"
          />
          <LogItem 
            title="VNIN to NIBSS" 
            subtitle="View Submission Logs"
            href="/dashboard/services/bvn/vnin-to-nibss"
            color="bg-teal-50 text-teal-600"
          />
          <LogItem 
            title="BVN Enrollment" 
            subtitle="View Enrollment Status"
            href="/dashboard/services/bvn/enrollment"
            color="bg-teal-50 text-teal-600"
          />
          <LogItem 
            title="BVN Modification" 
            subtitle="View Modification Requests"
            href="/dashboard/services/bvn/modification"
            color="bg-teal-50 text-teal-600"
          />
           <LogItem 
            title="BVN Premium Slip" 
            subtitle="View Generated Slips"
            href="/dashboard/services/bvn/premium-slip"
            color="bg-emerald-50 text-emerald-600"
          />
           <LogItem 
            title="BVN Retrieval" 
            subtitle="View Retrieval Logs"
            href="/dashboard/services/bvn/retrieval"
            color="bg-teal-50 text-teal-600"
          />
        </CategorySection>

        {/* --- CORPORATE LOGS --- */}
        <CategorySection title="Corporate Logs" icon={<Building2 size={16} className="text-purple-600"/>}>
          <LogItem 
            title="CAC Registration" 
            subtitle="View Registration Status"
            href="/dashboard/services/cac"
            color="bg-purple-50 text-purple-600"
          />
          <LogItem 
            title="Tax ID (TIN)" 
            subtitle="View TIN Requests"
            href="/dashboard/services/tax-id"
            color="bg-purple-50 text-purple-600"
          />
        </CategorySection>

        {/* --- EDUCATION LOGS --- */}
        <CategorySection title="Education Logs" icon={<GraduationCap size={16} className="text-pink-600"/>}>
          <LogItem 
            title="JAMB Services" 
            subtitle="View Result/Admission Logs"
            href="/dashboard/services/education/jamb"
            color="bg-pink-50 text-pink-600"
          />
          <LogItem 
            title="Exam Pins" 
            subtitle="View Purchased Pins"
            href="/dashboard/services/education/exam-pins"
            color="bg-pink-50 text-pink-600"
          />
        </CategorySection>

        {/* --- UTILITY LOGS --- */}
        <CategorySection title="Utility Logs" icon={<Wifi size={16} className="text-cyan-600"/>}>
          <LogItem 
            title="Airtime" 
            subtitle="View Airtime Transactions"
            href="/dashboard/services/utilities"
            color="bg-cyan-50 text-cyan-600"
          />
           <LogItem 
            title="Data Bundles" 
            subtitle="View Data Transactions"
            href="/dashboard/services/utilities/data"
            color="bg-cyan-50 text-cyan-600"
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
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function LogItem({ title, subtitle, href, color }: { title: string, subtitle: string, href: string, color: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}>
        <FileBadge size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 truncate text-sm">{title}</h4>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}
