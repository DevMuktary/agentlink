'use client';

import Link from 'next/link';
import { 
  ArrowUpRight, 
  Wallet, 
  ShieldCheck, 
  Wifi, 
  Building2, 
  GraduationCap 
} from 'lucide-react';

export default function DashboardHome() {
  // Mock User Data (We will fetch real data next)
  const user = {
    name: "Agent",
    balance: 50400.00,
    bonus: 1200.00
  };

  const services = [
    { title: "NIN Services", icon: ShieldCheck, href: "/dashboard/services/nin-verification", color: "bg-blue-500", desc: "Verify, Validate & Print Slips" },
    { title: "Airtime & Data", icon: Wifi, href: "/dashboard/services/utilities", color: "bg-green-500", desc: "MTN, Glo, Airtel, 9mobile" },
    { title: "CAC Registration", icon: Building2, href: "/dashboard/services/cac", color: "bg-purple-500", desc: "Business Name & Company Reg" },
    { title: "Exam Pins", icon: GraduationCap, href: "/dashboard/services/education", color: "bg-orange-500", desc: "WAEC, NECO, JAMB" },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. WELCOME & WALLET SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Wallet Balance</h2>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-bold">₦{user.balance.toLocaleString()}</span>
            </div>
            <div className="mt-6 flex space-x-3">
              <button className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition">
                + Fund Wallet
              </button>
              <button className="bg-blue-800/50 text-white border border-blue-400/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition">
                Transaction History
              </button>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        </div>

        {/* Bonus / Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Bonus Balance</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₦{user.bonus.toLocaleString()}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <p className="text-xs text-green-600 font-medium flex items-center">
               <ArrowUpRight className="w-3 h-3 mr-1" />
               API System Operational
             </p>
          </div>
        </div>
      </div>

      {/* 2. SERVICE GRID (The Command Center) */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <Link 
              key={index} 
              href={service.href}
              className="group bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className={`${service.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <service.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white">{service.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{service.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
