'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, ShieldCheck, Wifi, Building2, GraduationCap, 
  Activity, ArrowRight, FileText, Users, Eye, EyeOff, 
  CreditCard, Smartphone, ScrollText, UserCheck, Printer
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
            Here is what's happening with your account today.
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
        
        {/* Modern Wallet Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 dark:bg-black rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
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
              <span className="font-mono">{user?.businessName || 'Personal Account'}</span>
              <div className="flex gap-4">
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active
                 </span>
              </div>
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
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Developer Center</p>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">View API Keys</h3>
             </div>
             <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
               <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
             </div>
          </Link>
        </div>
      </div>

      {/* Services Grid Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ServiceCard 
            title="NIN Verification" 
            icon={ShieldCheck} 
            href="/dashboard/services/nin-verification" 
            color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
          />
          {/* --- NEW CARD ADDED HERE --- */}
          <ServiceCard 
            title="NIN Slips History" 
            icon={Printer} 
            href="/dashboard/services/nin-slips" 
            color="text-amber-600 bg-amber-50 dark:bg-amber-900/20"
          />
          {/* --------------------------- */}
          <ServiceCard 
            title="VNIN Slip" 
            icon={FileText} 
            href="/dashboard/services/vnin" 
            color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
          />
           <ServiceCard 
            title="IPE Clearance" 
            icon={UserCheck} 
            href="/dashboard/services/nin/ipe-clearance" 
            color="text-red-600 bg-red-50 dark:bg-red-900/20"
          />
           <ServiceCard 
            title="Airtime & Data" 
            icon={Wifi} 
            href="/dashboard/services/utilities" 
            color="text-green-600 bg-green-50 dark:bg-green-900/20"
          />
           <ServiceCard 
            title="BVN Services" 
            icon={Smartphone} 
            href="/dashboard/services/bvn" 
            color="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
          />
           <ServiceCard 
            title="CAC Reg" 
            icon={Building2} 
            href="/dashboard/services/cac" 
            color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
          />
           <ServiceCard 
            title="Transactions" 
            icon={ScrollText} 
            href="/dashboard/history" 
            color="text-gray-600 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}

// Reusable Service Card Component
function ServiceCard({ title, icon: Icon, href, color }: { title: string, icon: any, href: string, color: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group text-center">
      <div className={`p-3 rounded-full mb-3 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{title}</span>
    </Link>
  );
}
