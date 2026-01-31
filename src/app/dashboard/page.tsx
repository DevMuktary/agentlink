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
  ChevronRight,
  Wallet
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-slate-50 pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* 1. HEADER & WALLET SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Welcome Text Section */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold w-fit mb-4 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              System Operational
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Welcome back, {firstName}
            </h1>
            <p className="text-lg text-slate-500 max-w-lg">
              Manage your verification logs, identity services, and API usage all in one place.
            </p>
          </div>

          {/* Premium Wallet Card */}
          <div className="relative group perspective-1000">
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-slate-200 transition-transform transform hover:scale-[1.02] duration-300 border border-slate-700/50">
              
              {/* Background Effects */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
              
              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{formattedBalance}</h2>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <Wallet size={20} className="text-blue-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Link 
                    href="/dashboard/wallet"
                    className="flex items-center justify-center bg-white text-slate-950 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
                  >
                    Fund Wallet
                  </Link>
                  <Link 
                    href="/dashboard/wallet"
                    className="flex items-center justify-center bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SERVICES HISTORY GRID */}
        <div className="space-y-12">
          
          <CategorySection 
            title="Identity Services" 
            description="NIN Verification, Validations & Slips"
            icon={<Fingerprint size={18} className="text-blue-600"/>}
          >
            <HistoryItem title="NIN Verification" href="/dashboard/services/nin-verification" icon={<UserCheck size={20} />} color="bg-blue-100 text-blue-600" />
            <HistoryItem title="NIN Validation" href="/dashboard/services/nin/validation" icon={<Search size={20} />} color="bg-blue-100 text-blue-600" />
            <HistoryItem title="VNIN Slips" href="/dashboard/services/nin-slips" icon={<FileBadge size={20} />} color="bg-indigo-100 text-indigo-600" />
            <HistoryItem title="NIN Modifications" href="/dashboard/services/nin/modification" icon={<FileTextIcon />} color="bg-orange-100 text-orange-600" />
            <HistoryItem title="IPE Clearance" href="/dashboard/services/nin/ipe-clearance" icon={<ShieldCheck size={20} />} color="bg-red-100 text-red-600" />
          </CategorySection>

          <CategorySection 
            title="Banking & Finance" 
            description="BVN Checks & NIBSS Integration"
            icon={<Landmark size={18} className="text-teal-600"/>}
          >
            <HistoryItem title="BVN Verification" href="/dashboard/services/bvn/verification" icon={<ShieldCheck size={20} />} color="bg-teal-100 text-teal-600" />
            <HistoryItem title="VNIN to NIBSS" href="/dashboard/services/bvn/vnin-to-nibss" icon={<RefreshCcw size={20} />} color="bg-teal-100 text-teal-600" />
            <HistoryItem title="Enrollment Logs" href="/dashboard/services/bvn/enrollment" icon={<UserCheck size={20} />} color="bg-teal-100 text-teal-600" />
            <HistoryItem title="BVN Modification" href="/dashboard/services/bvn/modification" icon={<FileTextIcon />} color="bg-teal-100 text-teal-600" />
            <HistoryItem title="Premium Slips" href="/dashboard/services/bvn/premium-slip" icon={<FileBadge size={20} />} color="bg-emerald-100 text-emerald-600" />
            <HistoryItem title="Data Retrieval" href="/dashboard/services/bvn/retrieval" icon={<Search size={20} />} color="bg-teal-100 text-teal-600" />
          </CategorySection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategorySection 
              title="Corporate" 
              description="Business Registration"
              icon={<Building2 size={18} className="text-purple-600"/>}
              compact
            >
              <HistoryItem title="CAC Registry" href="/dashboard/services/cac" icon={<Building2 size={20} />} color="bg-purple-100 text-purple-600" />
              <HistoryItem title="Tax ID Logs" href="/dashboard/services/tax-id" icon={<Receipt size={20} />} color="bg-purple-100 text-purple-600" />
            </CategorySection>

            <CategorySection 
              title="Education" 
              description="Academic Records"
              icon={<GraduationCap size={18} className="text-pink-600"/>}
              compact
            >
              <HistoryItem title="JAMB Services" href="/dashboard/services/education/jamb" icon={<School size={20} />} color="bg-pink-100 text-pink-600" />
              <HistoryItem title="Exam Pins" href="/dashboard/services/education/exam-pins" icon={<FileBadge size={20} />} color="bg-pink-100 text-pink-600" />
            </CategorySection>

            <CategorySection 
              title="Utilities" 
              description="Bills & Top-ups"
              icon={<Wifi size={18} className="text-cyan-600"/>}
              compact
            >
              <HistoryItem title="Airtime Logs" href="/dashboard/services/utilities" icon={<Smartphone size={20} />} color="bg-cyan-100 text-cyan-600" />
              <HistoryItem title="Data Bundles" href="/dashboard/services/utilities/data" icon={<Wifi size={20} />} color="bg-cyan-100 text-cyan-600" />
            </CategorySection>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- REDESIGNED COMPONENTS ---

function CategorySection({ title, description, icon, children, compact = false }: { title: string, description?: string, icon: any, children: React.ReactNode, compact?: boolean }) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end gap-3 mb-6 border-b border-slate-200 pb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-none">{title}</h3>
          {description && <p className="text-slate-500 text-xs mt-1 font-medium">{description}</p>}
        </div>
      </div>
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {children}
      </div>
    </section>
  );
}

function HistoryItem({ title, href, icon, color }: { title: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href} 
      className="group relative flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:border-blue-500/30 transition-all duration-300"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${color} group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors text-sm">{title}</h4>
        <div className="flex items-center gap-1 mt-0.5">
          <History size={12} className="text-slate-400" />
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">View History</span>
        </div>
      </div>
      <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300">
        <ChevronRight size={18} />
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
