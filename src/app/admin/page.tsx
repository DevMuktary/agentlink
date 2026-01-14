'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, Clock, DollarSign, Briefcase, 
  ArrowRight, ShieldAlert, Building2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios.get('/api/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pending Jobs" 
          value={stats?.pending_jobs || 0} 
          icon={Clock} 
          color="bg-orange-500" 
          subtext="Requires attention"
        />
        <StatCard 
          title="Today's Revenue" 
          value={`₦${Number(stats?.today_revenue || 0).toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-600" 
          subtext="Gross sales today"
        />
        <StatCard 
          title="Total Users" 
          value={stats?.users_count || 0} 
          icon={Users} 
          color="bg-blue-600" 
          subtext="Registered agents"
        />
        <StatCard 
          title="User Funds Liability" 
          value={`₦${Number(stats?.total_user_wallets || 0).toLocaleString()}`} 
          icon={Briefcase} 
          color="bg-purple-600" 
          subtext="Total held in wallets"
        />
      </div>

      {/* Action Centers */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Identity Queue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-blue-600" /> Identity Queue
                    </h3>
                    <p className="text-sm text-gray-500">NIN, BVN Modifications, Validations</p>
                </div>
                {stats?.pending_jobs > 0 && <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">Action Needed</span>}
            </div>
            <Link href="/admin/requests/identity" className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 hover:text-blue-600 rounded-lg flex items-center justify-center gap-2 transition">
                Go to Queue <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        {/* Corporate Queue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-600" /> Corporate Queue
                    </h3>
                    <p className="text-sm text-gray-500">CAC Registrations, Tax IDs</p>
                </div>
            </div>
            <Link href="/admin/requests/corporate" className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-200 hover:text-orange-600 rounded-lg flex items-center justify-center gap-2 transition">
                Go to Queue <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg text-white shadow-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
