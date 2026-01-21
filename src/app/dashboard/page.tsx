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
  History
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
        if (data.status) setUser(data.data);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) return <GlobalLoader />;

  // 1. Safe Balance Formatting (Prevents NaN)
  const balance = user?.walletBalance ? Number(user.walletBalance) : 0.00;
  const formattedBalance = balance.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

  // 2. Get First Name
  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      
      {/* --- HEADER & WALLET SECTION --- */}
      <div className="bg-white px-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        
        {/* Welcome Row */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              API Overview & Transaction Logs
            </p>
          </div>
          <div className="h-11 w-11 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-100 shadow-sm">
            {firstName[0]}
          </div>
        </div>

        {/* Wallet Card - Professional Look */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-7 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Wallet size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {formattedBalance}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/dashboard/wallet"
                className="bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold text-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="bg-white/10 backdrop-blur-md text-white py-3 rounded-lg text-sm font-semibold text-center hover:bg-white/20 transition-colors border border-white/10"
              >
                Transactions
              </Link>
            </div>
          </div>
          
          {/* Subtle Background Art */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        </div>
      </div>

      {/* --- SERVICES HISTORY GRID --- */}
      <div className="px-5 -mt-4 space-y-8 relative z-10">
        
        {/* 1. IDENTITY (NIN) */}
        <CategorySection title="Identity Logs" icon={<Fingerprint size={16} className="text-blue-600"/>}>
          <ServiceHistoryLink 
            title="NIN Verification" 
            subtitle="View verification history"
            href="/dashboard/services/nin-verification"
            icon={<UserCheck size={18} />}
            color="bg-blue-50 text-blue-600"
          />
          <ServiceHistoryLink 
            title="NIN Validation" 
            subtitle="View validation logs"
            href="/dashboard/services/nin/validation"
            icon={<Search size={18} />}
            color="bg-blue-50 text-blue-600"
          />
          <ServiceHistoryLink 
            title="VNIN Slips" 
            subtitle="View generated slips"
            href="/dashboard/services/nin-slips"
            icon={<FileBadge size={18} />}
            color="bg-indigo-50 text-indigo-600"
          />
          <ServiceHistoryLink 
            title="NIN Modifications" 
            subtitle="View modification requests"
            href="/dashboard/services/nin/modification"
            icon={<FileTextIcon />}
            color="bg-indigo-50 text-indigo-600"
          />
           <ServiceHistoryLink 
            title="IPE Clearance" 
            subtitle="View clearance history"
            href="/dashboard/services/nin/ipe-clearance"
            icon={<ShieldCheck size={18} />}
            color="bg-indigo-50 text-indigo-600"
          />
        </CategorySection>

        {/* 2. BANKING (BVN) */}
        <CategorySection title="Banking Logs" icon={<Landmark size={16} className="text-teal-600"/>}>
          <ServiceHistoryLink 
            title="BVN Verification" 
            subtitle="View verification history"
            href="/dashboard/services/bvn/verification"
            icon={<ShieldCheck size={18} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceHistoryLink 
            title="VNIN to NIBSS" 
            subtitle="View linking history"
            href="/dashboard/services/bvn/vnin-to-nibss"
            icon={<RefreshCcw size={18} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceHistoryLink 
            title="BVN Enrollments" 
            subtitle="View enrollment requests"
            href="/dashboard/services/bvn/enrollment"
            icon={<UserCheck size={18} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceHistoryLink 
            title="BVN Modifications" 
            subtitle="View modification requests"
            href="/dashboard/services/bvn/modification"
            icon={<FileTextIcon />}
            color="bg-teal-50 text-teal-600"
          />
           <ServiceHistoryLink 
            title="BVN Premium Slips" 
            subtitle="View slip history"
            href="/dashboard/services/bvn/premium-slip"
            icon={<FileBadge size={18} />}
            color="bg-teal-50 text-teal-600"
          />
           <ServiceHistoryLink 
            title="BVN Retrievals" 
            subtitle="View retrieval logs"
            href="/dashboard/services/bvn/retrieval"
            icon={<Search size={18} />}
            color="bg-teal-50 text-teal-600"
          />
        </CategorySection>

        {/* 3. CORPORATE */}
        <CategorySection title="Corporate Logs" icon={<Building2 size={16} className="text-purple-600"/>}>
          <ServiceHistoryLink 
            title="CAC Registrations" 
            subtitle="View registration status"
            href="/dashboard/services/cac"
            icon={<Building2 size={18} />}
            color="bg-purple-50 text-purple-600"
          />
          <ServiceHistoryLink 
            title="Tax ID (TIN)" 
            subtitle="View TIN generation logs"
            href="/dashboard/services/tax-id"
            icon={<Receipt size={18} />}
            color="bg-purple-50 text-purple-600"
          />
        </CategorySection>

        {/* 4. EDUCATION */}
        <CategorySection title="Education Logs" icon={<GraduationCap size={16} className="text-pink-600"/>}>
          <ServiceHistoryLink 
            title="JAMB Services" 
            subtitle="View results & letters"
            href="/dashboard/services/education/jamb"
            icon={<School size={18} />}
            color="bg-pink-50 text-pink-600"
          />
          <ServiceHistoryLink 
            title="Exam Pins" 
            subtitle="View purchase history"
            href="/dashboard/services/education/exam-pins"
            icon={<FileBadge size={18} />}
            color="bg-pink-50 text-pink-600"
          />
        </CategorySection>

        {/* 5. UTILITIES */}
        <CategorySection title="Utility Logs" icon={<Wifi size={16} className="text-cyan-600"/>}>
          <ServiceHistoryLink 
            title="Airtime Logs" 
            subtitle="View airtime history"
            href="/dashboard/services/utilities"
            icon={<Smartphone size={18} />}
            color="bg-cyan-50 text-cyan-600"
          />
           <ServiceHistoryLink 
            title="Data Logs" 
            subtitle="View data history"
            href="/dashboard/services/utilities/data"
            icon={<Wifi size={18} />}
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
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
          {icon}
        </div>
        <h3 className="font-bold text-slate-700 text-sm tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function ServiceHistoryLink({ title, subtitle, href, icon, color }: { title: string, subtitle: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] group"
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${color} group-hover:bg-blue-600 group-hover:text-white`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm truncate">{title}</h4>
        <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center text-slate-300 group-hover:text-blue-500 transition-colors">
        <History size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        <ChevronRight size={16} />
      </div>
    </Link>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
      <line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
  );
}
