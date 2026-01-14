'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ShieldCheck, Wifi, Building2, GraduationCap, 
  Activity, ArrowRight, FileText, Users, Eye, EyeOff, 
  CreditCard, Smartphone, UserCheck, Printer,
  FileCog, Search, Zap, FileBadge, FileDigit
} from 'lucide-react';

interface UserData {
  firstName: string;
  lastName: string;
  businessName: string | null;
  walletBalance: string;
  _count: { requests: number };
}

export default function DashboardHome() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back to your AgentLink workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/wallet" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Fund Wallet
          </Link>
        </div>
      </div>

      {/* Stats & Wallet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 dark:bg-black rounded-2xl p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">Wallet Balance</p>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    {showBalance 
                      ? `₦${Number(user?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                      : '••••••••'}
                  </h2>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-slate-400 hover:text-white transition-colors">
                    {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm text-slate-300">
              <span className="font-mono">{user?.businessName || 'Agent Account'}</span>
              <span className="flex items-center gap-2 text-green-400">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-rows-2 gap-6">
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
             <div>
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Transactions</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{user?._count.requests || 0}</h3>
             </div>
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
               <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
          </div>

          <Link href="/dashboard/developers" className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
             <div>
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Developer API</p>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">View Keys</h3>
             </div>
             <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
               <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
             </div>
          </Link>
        </div>
      </div>

      {/* --- SERVICES SECTION --- */}
      
      {/* 1. Identity (NIN) */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" /> NIN Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ServiceCard title="Verification" icon={UserCheck} href="/dashboard/services/nin-verification" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
          <ServiceCard title="Slip History" icon={Printer} href="/dashboard/services/nin-slips" color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
          <ServiceCard title="IPE Clearance" icon={ShieldCheck} href="/dashboard/services/nin/ipe-clearance" color="text-red-600 bg-red-50 dark:bg-red-900/20" />
          <ServiceCard title="Validation" icon={FileBadge} href="/dashboard/services/nin/validation" color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
          <ServiceCard title="Personalization" icon={Users} href="/dashboard/services/nin/personalization" color="text-pink-600 bg-pink-50 dark:bg-pink-900/20" />
          <ServiceCard title="Modification" icon={FileCog} href="/dashboard/services/nin/modification" color="text-teal-600 bg-teal-50 dark:bg-teal-900/20" />
          <ServiceCard title="VNIN Slip" icon={FileDigit} href="/dashboard/services/vnin" color="text-green-600 bg-green-50 dark:bg-green-900/20" />
        </div>
      </div>

      {/* 2. Identity (BVN) */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-600" /> BVN Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ServiceCard title="Verification" icon={UserCheck} href="/dashboard/services/bvn/verification" color="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" />
          <ServiceCard title="Premium Slip" icon={FileBadge} href="/dashboard/services/bvn/premium-slip" color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
          <ServiceCard title="Retrieval" icon={Search} href="/dashboard/services/bvn/retrieval" color="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
          <ServiceCard title="Modification" icon={FileCog} href="/dashboard/services/bvn/modification" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
          <ServiceCard title="Android Enroll" icon={Smartphone} href="/dashboard/services/bvn/enrollment" color="text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20" />
        </div>
      </div>

      {/* 3. Education */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-600" /> Education
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ServiceCard title="Exam Pins" icon={FileText} href="/dashboard/services/education/exam-pins" color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
          <ServiceCard title="JAMB Services" icon={GraduationCap} href="/dashboard/services/education/jamb" color="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" />
        </div>
      </div>

      {/* 4. Corporate & Utilities */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" /> Corporate
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ServiceCard title="CAC Reg" icon={Building2} href="/dashboard/services/cac" color="text-orange-600 bg-orange-50 dark:bg-orange-900/20" />
              <ServiceCard title="Tax ID" icon={CreditCard} href="/dashboard/services/tax-id" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-600" /> Utilities
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ServiceCard title="Airtime" icon={Wifi} href="/dashboard/services/utilities" color="text-green-600 bg-green-50 dark:bg-green-900/20" />
              <ServiceCard title="Data Bundles" icon={Zap} href="/dashboard/services/utilities/data" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
            </div>
        </div>
      </div>

    </div>
  );
}

// Reusable Service Card Component
function ServiceCard({ title, icon: Icon, href, color }: { title: string, icon: any, href: string, color: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group text-center h-full">
      <div className={`p-3 rounded-full mb-3 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{title}</span>
    </Link>
  );
}
