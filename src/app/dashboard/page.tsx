'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
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
        const data = await res.json();
        
        // FIX: Your API returns the user object directly, not wrapped in { data: ... }
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

  // Safely format balance
  const formattedBalance = Number(user?.walletBalance || 0).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900">
      
      {/* 1. HEADER & WALLET */}
      <div className="bg-white px-6 pt-6 pb-8 rounded-b-[2rem] shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Overview
            </h1>
            <p className="text-sm text-slate-500">API Usage & Wallet Statement</p>
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
            {user?.name?.[0] || 'A'}
          </div>
        </div>

        {/* Wallet Card */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet size={16} />
              <p className="text-xs font-medium uppercase tracking-wider">API Wallet Balance</p>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-6 font-mono">{formattedBalance}</h2>
            
            <div className="flex gap-3">
              <Link 
                href="/dashboard/wallet"
                className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-sm font-bold text-center hover:bg-gray-50 transition-colors"
              >
                Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="flex-1 bg-white/10 backdrop-blur-md text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-white/20 transition-colors"
              >
                Transaction History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOGS & HISTORY GRID */}
      <div className="px-5 mt-8 space-y-10">
        
        {/* --- IDENTITY LOGS --- */}
        <CategorySection title="Identity Services History" icon={<History size={16} className="text-blue-600"/>}>
          <LogLink 
            title="NIN Verification Logs" 
            subtitle="View verification attempts"
            href="/dashboard/services/nin-verification" // This page should show a TABLE of history
            icon={<UserCheck size={18} />}
            color="text-blue-600 bg-blue-50"
          />
          <LogLink 
            title="NIN Validation Logs" 
            subtitle="View validation history"
            href="/dashboard/services/nin/validation"
            icon={<Search size={18} />}
            color="text-blue-600 bg-blue-50"
          />
          <LogLink 
            title="VNIN Slips History" 
            subtitle="View generated slips"
            href="/dashboard/services/nin-slips"
            icon={<FileBadge size={18} />}
            color="text-indigo-600 bg-indigo-50"
          />
          <LogLink 
            title="NIN Modification Requests" 
            subtitle="Track modification status"
            href="/dashboard/services/nin/modification"
            icon={<RefreshCcw size={18} />}
            color="text-orange-600 bg-orange-50"
          />
           <LogLink 
            title="IPE Clearance Logs" 
            subtitle="View clearance requests"
            href="/dashboard/services/nin/ipe-clearance"
            icon={<ShieldCheck size={18} />}
            color="text-red-600 bg-red-50"
          />
        </CategorySection>

        {/* --- BANKING LOGS --- */}
        <CategorySection title="Banking Services History" icon={<History size={16} className="text-teal-600"/>}>
          <LogLink 
            title="BVN Verification Logs" 
            subtitle="View past checks"
            href="/dashboard/services/bvn/verification"
            icon={<ShieldCheck size={18} />}
            color="text-teal-600 bg-teal-50"
          />
          <LogLink 
            title="VNIN to NIBSS Logs" 
            subtitle="View submission history"
            href="/dashboard/services/bvn/vnin-to-nibss"
            icon={<RefreshCcw size={18} />}
            color="text-teal-600 bg-teal-50"
          />
          <LogLink 
            title="BVN Enrollment Requests" 
            subtitle="Track new enrollments"
            href="/dashboard/services/bvn/enrollment"
            icon={<UserCheck size={18} />}
            color="text-teal-600 bg-teal-50"
          />
          <LogLink 
            title="BVN Modification Requests" 
            subtitle="Track update status"
            href="/dashboard/services/bvn/modification"
            icon={<Activity size={18} />}
            color="text-teal-600 bg-teal-50"
          />
           <LogLink 
            title="BVN Premium Slip Logs" 
            subtitle="View generated docs"
            href="/dashboard/services/bvn/premium-slip"
            icon={<FileBadge size={18} />}
            color="text-emerald-600 bg-emerald-50"
          />
           <LogLink 
            title="BVN Retrieval Logs" 
            subtitle="View retrieval history"
            href="/dashboard/services/bvn/retrieval"
            icon={<Search size={18} />}
            color="text-teal-600 bg-teal-50"
          />
        </CategorySection>

        {/* --- CORPORATE LOGS --- */}
        <CategorySection title="Corporate Requests" icon={<History size={16} className="text-purple-600"/>}>
          <LogLink 
            title="CAC Registrations" 
            subtitle="Track company status"
            href="/dashboard/services/cac"
            icon={<Building2 size={18} />}
            color="text-purple-600 bg-purple-50"
          />
          <LogLink 
            title="Tax ID (TIN) Logs" 
            subtitle="View TIN requests"
            href="/dashboard/services/tax-id"
            icon={<Receipt size={18} />}
            color="text-purple-600 bg-purple-50"
          />
        </CategorySection>

        {/* --- EDUCATION & UTILITY LOGS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategorySection title="Education Logs" icon={<History size={16} className="text-pink-600"/>}>
            <LogLink 
                title="JAMB Requests" 
                subtitle="Track results/letters"
                href="/dashboard/services/education/jamb"
                icon={<School size={18} />}
                color="text-pink-600 bg-pink-50"
            />
            <LogLink 
                title="Exam Pins History" 
                subtitle="View purchased pins"
                href="/dashboard/services/education/exam-pins"
                icon={<FileBadge size={18} />}
                color="text-pink-600 bg-pink-50"
            />
            </CategorySection>

            <CategorySection title="Utility Logs" icon={<History size={16} className="text-cyan-600"/>}>
            <LogLink 
                title="Airtime Transactions" 
                subtitle="View topup log"
                href="/dashboard/services/utilities"
                icon={<Smartphone size={18} />}
                color="text-cyan-600 bg-cyan-50"
            />
            <LogLink 
                title="Data Transactions" 
                subtitle="View data bundle log"
                href="/dashboard/services/utilities/data"
                icon={<Wifi size={18} />}
                color="text-cyan-600 bg-cyan-50"
            />
            </CategorySection>
        </div>
      </div>
    </div>
  );
}

// --- SUBTLE LIST ITEM COMPONENT ---
function CategorySection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon}
        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{title}</h3>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function LogLink({ title, subtitle, href, icon, color }: { title: string, subtitle: string, href: string, icon: any, color: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 truncate text-sm">{title}</h4>
        <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
    </Link>
  );
}
