'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Users, AlertCircle, Wallet, 
  ChevronRight, ArrowUpRight, Activity
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will create this API next
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.status) setStats(data.data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500">Real-time platform metrics and pending actions.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          System Operational
        </div>
      </div>

      {/* 2. KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <MetricCard 
          title="Total Revenue" 
          value={`₦${Number(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={<TrendingUp size={20} />} 
          color="bg-emerald-500"
          sub="Lifetime earnings"
        />
        
        <MetricCard 
          title="Wallet Liability" 
          value={`₦${Number(stats?.walletLiability || 0).toLocaleString()}`} 
          icon={<Wallet size={20} />} 
          color="bg-blue-500"
          sub="User funds held"
        />

        <MetricCard 
          title="Pending Requests" 
          value={stats?.pendingRequests || 0} 
          icon={<AlertCircle size={20} />} 
          color="bg-amber-500"
          sub="Requires attention"
          highlight={stats?.pendingRequests > 0}
        />

        <MetricCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={<Users size={20} />} 
          color="bg-purple-500"
          sub="Registered accounts"
        />
      </div>

      {/* 3. ACTION CENTER (QUEUES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PENDING ACTIONS COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            Action Queues
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QueueCard 
              title="CAC Registrations" 
              count={stats?.queues?.cac || 0} 
              href="/admin/requests/corporate/cac"
              desc="Business registration filings"
            />
            <QueueCard 
              title="BVN Enrollments" 
              count={stats?.queues?.bvn_enrollment || 0} 
              href="/admin/requests/bvn/enrollment"
              desc="New BVN applications"
            />
            <QueueCard 
              title="NIN Modifications" 
              count={stats?.queues?.nin_modification || 0} 
              href="/admin/requests/nin/modification"
              desc="Data correction requests"
            />
            <QueueCard 
              title="Tax ID Requests" 
              count={stats?.queues?.tax || 0} 
              href="/admin/requests/corporate/tax"
              desc="TIN generation requests"
            />
             <QueueCard 
              title="JAMB Services" 
              count={stats?.queues?.jamb || 0} 
              href="/admin/requests/education/jamb"
              desc="Result & Admission letters"
            />
          </div>
        </div>

        {/* QUICK LINKS / RECENT ACTIVITY */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800 text-lg">Quick Actions</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
             <Link href="/admin/users" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700">Manage Users</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600"/>
             </Link>
             <Link href="/admin/transactions" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700">View All Transactions</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600"/>
             </Link>
             <Link href="/admin/settings" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700">Service Pricing & Toggle</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600"/>
             </Link>
          </div>

          {/* System Health */}
           <div className="bg-slate-900 rounded-xl p-5 text-white">
              <h4 className="font-bold text-sm mb-3">System Health</h4>
              <div className="space-y-3">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Database</span>
                    <span className="text-emerald-400">Connected</span>
                 </div>
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>API Gateway</span>
                    <span className="text-emerald-400">Online</span>
                 </div>
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Cloudinary</span>
                    <span className="text-emerald-400">Connected</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function MetricCard({ title, value, icon, color, sub, highlight }: any) {
  return (
    <div className={`bg-white rounded-xl p-6 border shadow-sm transition-all ${highlight ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${color} shadow-lg shadow-${color}/20`}>
          {icon}
        </div>
        {highlight && <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function QueueCard({ title, count, href, desc }: any) {
  return (
    <Link href={href} className="group bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
          {count} Pending
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Process Queue <ArrowUpRight size={14} className="ml-1" />
      </div>
    </Link>
  );
}
