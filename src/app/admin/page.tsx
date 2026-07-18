'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, AlertCircle, Wallet, 
  ChevronRight, ArrowRight, Activity, Database, Cloud, ShieldCheck, Sun, Moon, BarChart3
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

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

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  if (loading) return <GlobalLoader />;

  // Formatting Helper
  const formatCurrency = (amount: any) => {
    return Number(amount || 0).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER & THEME TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Command Center</h1>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monitor platform metrics, queues, and system health.</p>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95 self-start md:self-auto"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* 2. KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Replaced Revenue with Total Transactions */}
        <MetricCard 
          title="Total Transactions" 
          value={(stats?.totalTransactions || 0).toLocaleString()} 
          icon={<BarChart3 size={22} />} 
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-100 dark:bg-emerald-900/30"
          border="border-emerald-200 dark:border-emerald-800/50"
          sub="Platform volume"
        />
        
        <MetricCard 
          title="Wallet Liability" 
          value={formatCurrency(stats?.walletLiability)} 
          icon={<Wallet size={22} />} 
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-900/30"
          border="border-blue-200 dark:border-blue-800/50"
          sub="User funds held"
        />

        <MetricCard 
          title="Pending Requests" 
          value={stats?.pendingRequests || 0} 
          icon={<AlertCircle size={22} />} 
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-100 dark:bg-amber-900/30"
          border="border-amber-200 dark:border-amber-800/50"
          sub="Requires attention"
          highlight={stats?.pendingRequests > 0}
        />

        <MetricCard 
          title="Total Agents" 
          value={(stats?.totalUsers || 0).toLocaleString()} 
          icon={<Users size={22} />} 
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-100 dark:bg-purple-900/30"
          border="border-purple-200 dark:border-purple-800/50"
          sub="Registered accounts"
        />
      </div>

      {/* 3. ACTION CENTER (QUEUES & LINKS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* PENDING ACTIONS COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Activity size={20} />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight">
              Action Queues
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CORPORATE */}
            <QueueCard 
              title="CAC Registrations" 
              count={stats?.queues?.cac || 0} 
              href="/admin/requests/corporate/cac"
              desc="Business registration filings"
            />
            <QueueCard 
              title="Tax ID Requests" 
              count={stats?.queues?.tax || 0} 
              href="/admin/requests/corporate/tax"
              desc="TIN generation requests"
            />

            {/* IDENTITY (BVN) */}
            <QueueCard 
              title="BVN Enrollments" 
              count={stats?.queues?.bvn_enrollment || 0} 
              href="/admin/requests/bvn/enrollment"
              desc="New BVN applications"
            />
            <QueueCard 
              title="BVN Modifications" 
              count={stats?.queues?.bvn_modification || 0} 
              href="/admin/requests/bvn/modification"
              desc="BVN Data updates"
            />
             <QueueCard 
              title="BVN Retrievals" 
              count={stats?.queues?.bvn_retrieval || 0} 
              href="/admin/requests/bvn/retrieval"
              desc="Lost BVN recovery"
            />
             <QueueCard 
              title="VNIN to NIBSS" 
              count={stats?.queues?.vnin_nibss || 0} 
              href="/admin/requests/bvn/vnin-nibss"
              desc="Link VNIN to Bank Profile"
            />

            {/* IDENTITY (NIN) */}
            <QueueCard 
              title="NIN Modifications" 
              count={stats?.queues?.nin_modification || 0} 
              href="/admin/requests/nin/modification"
              desc="NIN Data corrections"
            />
            <QueueCard 
              title="NIN Validations" 
              count={stats?.queues?.nin_validation || 0} 
              href="/admin/requests/nin/validation"
              desc="NIN Search requests"
            />

            {/* EDUCATION */}
             <QueueCard 
              title="JAMB Services" 
              count={stats?.queues?.jamb || 0} 
              href="/admin/requests/education/jamb"
              desc="Result & Admission letters"
            />
          </div>
        </div>

        {/* QUICK LINKS & SYSTEM HEALTH */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight mb-2">Quick Actions</h3>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <Link href="/admin/users" className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 group">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Manage Users</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"/>
                </div>
             </Link>
             <Link href="/admin/transactions" className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 group">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View All Transactions</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"/>
                </div>
             </Link>
             <Link href="/admin/settings" className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Service Pricing & Toggle</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"/>
                </div>
             </Link>
          </div>

          {/* System Health */}
           <div className="bg-slate-900 dark:bg-[#0B1120] rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-extrabold text-sm mb-5 text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  System Health
                </h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-slate-400"><Database size={14} /> Database</span>
                      <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">Connected</span>
                   </div>
                   <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-slate-400"><Cloud size={14} /> Cloudinary</span>
                      <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">Online</span>
                   </div>
                   <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-slate-400"><Activity size={14} /> API Gateway</span>
                      <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">Active</span>
                   </div>
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function MetricCard({ title, value, icon, color, bg, border, sub, highlight }: any) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${highlight ? 'border-amber-300 dark:border-amber-700 ring-4 ring-amber-50 dark:ring-amber-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color} ${bg} ${border} border`}>
          {icon}
        </div>
        {highlight && (
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">{value}</h3>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">{sub}</p>
      </div>
    </div>
  );
}

function QueueCard({ title, count, href, desc }: any) {
  const hasPending = count > 0;
  
  return (
    <Link 
      href={href} 
      className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[140px]
        ${hasPending 
          ? 'border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-amber-500/5' 
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-blue-500/5'
        }
      `}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{desc}</p>
        </div>
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
          hasPending 
            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        }`}>
          {count} Pending
        </div>
      </div>
      
      <div className={`mt-4 flex items-center text-xs font-bold transition-all duration-300 ${
        hasPending 
          ? 'text-amber-600 dark:text-amber-400 group-hover:translate-x-1' 
          : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1'
      }`}>
        {hasPending ? 'Review Now' : 'Manage Queue'} 
        <ArrowRight size={14} className="ml-1.5" />
      </div>
    </Link>
  );
}
