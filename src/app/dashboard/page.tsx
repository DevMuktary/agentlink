'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  History, ShieldCheck, UserCheck, Fingerprint, FileBadge, 
  RefreshCcw, Search, School, Landmark, Receipt, Building2, 
  GraduationCap, Wifi, Smartphone, Zap, Wallet, ChevronRight, Plus
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER & WALLET SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Message */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your AgentHub identity and utility services from one central dashboard.
          </p>
        </div>

        {/* Wallet Card */}
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Wallet size={14} /> Agent Wallet
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">{formattedBalance}</h2>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Link 
                href="/dashboard/wallet"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Plus size={16} /> Fund Wallet
              </Link>
              <Link 
                href="/dashboard/wallet"
                className="px-4 bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                History
              </Link>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 2. SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* IDENTITY */}
        <ServiceCategory title="Identity Services" icon={<Fingerprint className="text-blue-600" />} color="blue">
          <ServiceLink title="NIN Verification" href="/dashboard/services/nin-verification" />
          <ServiceLink title="NIN Validation" href="/dashboard/services/nin/validation" />
          <ServiceLink title="VNIN Slip" href="/dashboard/services/nin-slips" />
          <ServiceLink title="Modifications" href="/dashboard/services/nin/modification" />
          <ServiceLink title="IPE Clearance" href="/dashboard/services/nin/ipe-clearance" />
        </ServiceCategory>

        {/* BANKING */}
        <ServiceCategory title="Banking Services" icon={<Landmark className="text-teal-600" />} color="teal">
          <ServiceLink title="BVN Verification" href="/dashboard/services/bvn/verification" />
          <ServiceLink title="VNIN to NIBSS" href="/dashboard/services/bvn/vnin-to-nibss" />
          <ServiceLink title="BVN Enrollment" href="/dashboard/services/bvn/enrollment" />
          <ServiceLink title="BVN Modification" href="/dashboard/services/bvn/modification" />
          <ServiceLink title="Premium Slips" href="/dashboard/services/bvn/premium-slip" />
          <ServiceLink title="BVN Retrieval" href="/dashboard/services/bvn/retrieval" />
        </ServiceCategory>

        {/* CORPORATE */}
        <ServiceCategory title="Corporate Affairs" icon={<Building2 className="text-purple-600" />} color="purple">
          <ServiceLink title="CAC Registration" href="/dashboard/services/cac" />
          <ServiceLink title="Tax ID (TIN)" href="/dashboard/services/tax-id" />
        </ServiceCategory>

        {/* EDUCATION */}
        <ServiceCategory title="Education" icon={<GraduationCap className="text-pink-600" />} color="pink">
          <ServiceLink title="JAMB Services" href="/dashboard/services/education/jamb" />
          <ServiceLink title="Exam Pins" href="/dashboard/services/education/exam-pins" />
        </ServiceCategory>

        {/* UTILITIES */}
        <ServiceCategory title="Utilities & Bills" icon={<Zap className="text-orange-600" />} color="orange">
          <ServiceLink title="Airtime Vending" href="/dashboard/services/utilities" />
          <ServiceLink title="Data Bundles" href="/dashboard/services/utilities/data" />
        </ServiceCategory>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ServiceCategory({ title, icon, color, children }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) {
  const colorMap: any = {
    blue: 'bg-blue-50 border-blue-100',
    teal: 'bg-teal-50 border-teal-100',
    purple: 'bg-purple-50 border-purple-100',
    pink: 'bg-pink-50 border-pink-100',
    orange: 'bg-orange-50 border-orange-100',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || 'bg-white border-slate-100'} flex flex-col h-full`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-2 flex-1">
        {children}
      </div>
    </div>
  );
}

function ServiceLink({ title, href }: { title: string, href: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between group bg-white hover:bg-slate-50 border border-slate-200/60 p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-slate-900 transition-colors"></div>
        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{title}</span>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
