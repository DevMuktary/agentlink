'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  Users, Clock, DollarSign, Briefcase, 
  ArrowRight, ShieldAlert, Building2, 
  GraduationCap, Smartphone, Search, 
  TrendingUp, CreditCard, Activity,
  ChevronRight, Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    axios.get('/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-black p-8 text-white shadow-2xl border border-slate-800">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-red-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" /> {currentDate}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Console</h1>
            <p className="text-slate-300 mt-2 max-w-lg">
              Overview of system performance, pending requests, and financial liability.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition border border-white/10 flex items-center gap-2">
              <Users className="w-4 h-4" /> Users
            </Link>
            <Link href="/admin/transactions" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-red-900/20 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Finance
            </Link>
          </div>
        </div>
      </div>

      {/* --- METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Total Revenue (Today)" 
          value={`₦${Number(stats?.today_revenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-green-500" 
          trend="+12% from yesterday" // Placeholder trend
        />
        <MetricCard 
          title="Pending Requests" 
          value={stats?.pending_jobs || 0} 
          icon={Clock} 
          color="bg-orange-500" 
          trend="Requires attention"
          alert={stats?.pending_jobs > 0}
        />
        <MetricCard 
          title="Active Users" 
          value={stats?.users_count || 0} 
          icon={Users} 
          color="bg-blue-500" 
          trend="Total registered agents"
        />
        <MetricCard 
          title="Wallet Liability" 
          value={`₦${Number(stats?.total_user_wallets || 0).toLocaleString()}`} 
          icon={Briefcase} 
          color="bg-purple-600" 
          trend="Funds held in system"
        />
      </div>

      {/* --- COMMAND CENTER (QUEUES) --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-600" /> Action Queues
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* 1. Identity Group */}
          <QueueGroup 
            title="Identity Management" 
            icon={ShieldAlert}
            color="text-teal-600 bg-teal-50 dark:bg-teal-900/20"
            links={[
              { name: "NIN Validation", href: "/admin/requests/nin/validation" },
              { name: "NIN Modification", href: "/admin/requests/nin/modification" },
              { name: "IPE Clearance", href: "/admin/requests/nin/ipe" },
            ]}
          />

          {/* 2. BVN Services Group */}
          <QueueGroup 
            title="BVN Services" 
            icon={Smartphone}
            color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
            links={[
              { name: "BVN Modification", href: "/admin/requests/bvn/modification" },
              { name: "BVN Retrieval", href: "/admin/requests/bvn/retrieval" },
              { name: "Enrollment", href: "/admin/requests/bvn/enrollment" },
              { name: "VNIN to NIBSS", href: "/admin/requests/bvn/vnin-nibss" },
            ]}
          />

          {/* 3. Corporate & Education Group */}
          <QueueGroup 
            title="Corporate & Education" 
            icon={Building2}
            color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
            links={[
              { name: "CAC Registration", href: "/admin/requests/corporate/cac" },
              { name: "Tax ID Generation", href: "/admin/requests/corporate/tax" },
              { name: "JAMB Services", href: "/admin/requests/education/jamb" },
            ]}
          />

        </div>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function MetricCard({ title, value, icon: Icon, color, trend, alert }: any) {
  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
      {alert && <span className="absolute top-4 right-4 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl text-white shadow-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${alert ? 'text-red-500' : 'text-gray-400'}`}>{trend}</p>
      </div>
    </div>
  );
}

function QueueGroup({ title, icon: Icon, color, links }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-800 dark:text-white">{title}</h3>
      </div>
      <div className="flex-1 p-2">
        {links.map((link: any, i: number) => (
          <Link 
            key={i} 
            href={link.href}
            className="flex items-center justify-between p-3 mx-1 my-1 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white group transition-all"
          >
            {link.name}
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-md text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:text-gray-600 dark:group-hover:text-white transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
