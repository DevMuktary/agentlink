'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Wallet, 
  ShieldCheck, 
  Wifi, 
  Building2, 
  GraduationCap,
  Activity,
  ArrowRight
} from 'lucide-react';

interface UserData {
  firstName: string;
  lastName: string;
  businessName: string | null;
  walletBalance: string;
  _count: {
    requests: number;
  };
}

export default function DashboardHome() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const services = [
    { title: "NIN Services", icon: ShieldCheck, href: "/dashboard/services/nin-verification", color: "bg-blue-600", desc: "Verify IDs & Print Slips" },
    { title: "Airtime & Data", icon: Wifi, href: "/dashboard/services/utilities", color: "bg-green-600", desc: "VTU for all Networks" },
    { title: "CAC Registration", icon: Building2, href: "/dashboard/services/cac", color: "bg-purple-600", desc: "Register Companies" },
    { title: "Exam Pins", icon: GraduationCap, href: "/dashboard/services/education", color: "bg-orange-600", desc: "WAEC, NECO & JAMB" },
  ];

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. GREETING & WALLET SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Wallet Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wider">Available Balance</h2>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                    ₦{Number(user?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="mt-2 text-slate-400 text-sm">
                  {user?.businessName ? user.businessName : `${user?.firstName} ${user?.lastName}`}
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard/wallet" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                + Fund Wallet
              </Link>
              <Link href="/dashboard/history" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2.5 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all">
                View History
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <div className="absolute left-0 bottom-0 h-40 w-40 bg-purple-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        </div>

        {/* Stats / Quick Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white font-bold">Activity Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Total Transactions</span>
                <span className="font-bold text-gray-900 dark:text-white">{user?._count.requests || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">API Status</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
          
          <Link href="/dashboard/developers" className="mt-4 flex items-center justify-between text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium group">
            View API Keys
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. SERVICE GRID */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center">
          Access Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, index) => (
            <Link 
              key={index} 
              href={service.href}
              className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-300"
            >
              <div className={`${service.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {service.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {service.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
