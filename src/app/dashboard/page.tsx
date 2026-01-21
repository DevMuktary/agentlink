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
  Smartphone
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

  // Format currency safely to avoid NaN
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
              Hello, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-sm text-slate-500">What would you like to do today?</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
            {user?.name?.[0] || 'U'}
          </div>
        </div>

        {/* Wallet Card - Premium Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#334155] rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10">
            <p className="text-slate-300 text-sm font-medium mb-1">Total Balance</p>
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
                className="flex-1 bg-white/10 backdrop-blur-md text-white py-3 rounded-xl text-sm font-semibold text-center hover:bg-white/20 transition-colors"
              >
                History
              </Link>
            </div>
          </div>
          
          {/* Decorative Circle */}
          <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -bottom-6 h-24 w-24 bg-blue-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* 2. SERVICES GRID */}
      <div className="px-5 mt-6 space-y-8">
        
        {/* --- IDENTITY (NIN) --- */}
        <CategorySection title="Identity Verification" icon={<Fingerprint size={18} className="text-blue-600"/>}>
          <ServiceItem 
            title="NIN Verification" 
            subtitle="Verify identity via Number"
            href="/dashboard/services/nin-verification"
            icon={<UserCheck size={20} />}
            color="bg-blue-50 text-blue-600"
          />
          <ServiceItem 
            title="NIN Validation" 
            subtitle="Validate search status"
            href="/dashboard/services/nin/validation"
            icon={<Search size={20} />}
            color="bg-blue-50 text-blue-600"
          />
          <ServiceItem 
            title="VNIN Slip Generation" 
            subtitle="Generate Virtual NIN Slip"
            href="/dashboard/services/nin-slips"
            icon={<FileBadge size={20} />}
            color="bg-indigo-50 text-indigo-600"
          />
          <ServiceItem 
            title="NIN Modification" 
            subtitle="Correct Name, DOB, Phone"
            href="/dashboard/services/nin/modification"
            icon={<FileTextIcon />}
            color="bg-orange-50 text-orange-600"
          />
           <ServiceItem 
            title="IPE Clearance" 
            subtitle="Resolve integration issues"
            href="/dashboard/services/nin/ipe-clearance"
            icon={<ShieldCheck size={20} />}
            color="bg-red-50 text-red-600"
          />
        </CategorySection>

        {/* --- BANKING (BVN) --- */}
        <CategorySection title="Banking Services" icon={<Landmark size={18} className="text-teal-600"/>}>
          <ServiceItem 
            title="BVN Verification" 
            subtitle="Deep identity check"
            href="/dashboard/services/bvn/verification"
            icon={<ShieldCheck size={20} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceItem 
            title="VNIN to NIBSS" 
            subtitle="Push VNIN to Bank DB"
            href="/dashboard/services/bvn/vnin-to-nibss"
            icon={<RefreshCcw size={20} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceItem 
            title="BVN Enrollment" 
            subtitle="Register new BVN"
            href="/dashboard/services/bvn/enrollment"
            icon={<UserCheck size={20} />}
            color="bg-teal-50 text-teal-600"
          />
          <ServiceItem 
            title="BVN Modification" 
            subtitle="Update BVN details"
            href="/dashboard/services/bvn/modification"
            icon={<FileTextIcon />}
            color="bg-teal-50 text-teal-600"
          />
           <ServiceItem 
            title="BVN Premium Slip" 
            subtitle="High-res Document"
            href="/dashboard/services/bvn/premium-slip"
            icon={<FileBadge size={20} />}
            color="bg-emerald-50 text-emerald-600"
          />
           <ServiceItem 
            title="BVN Retrieval" 
            subtitle="Recover lost BVN"
            href="/dashboard/services/bvn/retrieval"
            icon={<Search size={20} />}
            color="bg-teal-50 text-teal-600"
          />
        </CategorySection>

        {/* --- CORPORATE --- */}
        <CategorySection title="Corporate & Business" icon={<Building2 size={18} className="text-purple-600"/>}>
          <ServiceItem 
            title="CAC Registration" 
            subtitle="Register Company/Business"
            href="/dashboard/services/cac"
            icon={<Building2 size={20} />}
            color="bg-purple-50 text-purple-600"
          />
          <ServiceItem 
            title="Tax ID (TIN)" 
            subtitle="Generate/Retrieve TIN"
            href="/dashboard/services/tax-id"
            icon={<Receipt size={20} />}
            color="bg-purple-50 text-purple-600"
          />
        </CategorySection>

        {/* --- EDUCATION --- */}
        <CategorySection title="Education" icon={<GraduationCap size={18} className="text-pink-600"/>}>
          <ServiceItem 
            title="JAMB Services" 
            subtitle="Result, Admission Letter"
            href="/dashboard/services/education/jamb"
            icon={<School size={20} />}
            color="bg-pink-50 text-pink-600"
          />
          <ServiceItem 
            title="Exam Pins" 
            subtitle="WAEC, NECO Cards"
            href="/dashboard/services/education/exam-pins"
            icon={<FileBadge size={20} />}
            color="bg-pink-50 text-pink-600"
          />
        </CategorySection>

        {/* --- UTILITIES --- */}
        <CategorySection title="Utilities" icon={<Wifi size={18} className="text-cyan-600"/>}>
          <ServiceItem 
            title="Buy Airtime" 
            subtitle="Instant VTU Topup"
            href="/dashboard/services/utilities"
            icon={<Smartphone size={20} />}
            color="bg-cyan-50 text-cyan-600"
          />
           <ServiceItem 
            title="Buy Data" 
            subtitle="SME & Direct Bundles"
            href="/dashboard/services/utilities/data"
            icon={<Wifi size={20} />}
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
      <div className="flex items-center gap-2 mb-3 ml-1">
        {icon}
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function ServiceItem({ title, subtitle, href, icon, color }: { title: string, subtitle: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 truncate">{title}</h4>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
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
