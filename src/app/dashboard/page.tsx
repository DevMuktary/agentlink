'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wallet, Clock, Sun, Moon } from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme and fetch user data
  useEffect(() => {
    // Check initial theme preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Partner';
  const balanceValue = user?.walletBalance ? Number(user.walletBalance) : 0;
  
  const formattedBalance = balanceValue.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  });

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* HEADER WITH THEME TOGGLE */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Select a service below to get started.
          </p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* 1. COMPACT WALLET CARD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1E293B] dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200/40 dark:shadow-none mb-10 border border-slate-800/50">
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-2 uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5" /> Available Balance
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{formattedBalance}</h2>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Link 
              href="/dashboard/wallet"
              className="flex-1 sm:flex-none bg-white text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold text-center hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
            >
              Fund Wallet
            </Link>
            <Link 
              href="/dashboard/history"
              className="flex-1 sm:flex-none bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-white/20 transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5" /> History
            </Link>
          </div>
        </div>
        
        {/* Subtle Background Glows */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* 2. CARD-BASED SERVICES GRID */}
      <div className="space-y-10">
        
        <CategorySection title="Identity Verification">
          <ServiceCard title="NIN Verification" href="/dashboard/nin-verification" imageSrc="/nimc.png" />
          <ServiceCard title="NIN Validation" href="/dashboard/nin-validation" imageSrc="/nimc.png" />
          <ServiceCard title="Slip Generation" href="/dashboard/nin-slip" imageSrc="/nimc.png" />
          <ServiceCard title="VNIN Slip" href="/dashboard/vnin-slip" imageSrc="/nimc.png" />
          <ServiceCard title="NIN Personalization" href="/dashboard/nin-personalization" imageSrc="/nimc.png" />
          <ServiceCard title="NIN Modification" href="/dashboard/nin-modification" imageSrc="/nimc.png" />
          <ServiceCard title="IPE Clearance" href="/dashboard/ipe-clearance" imageSrc="/nimc.png" />
        </CategorySection>

        <CategorySection title="Banking & BVN">
          <ServiceCard title="BVN Verification" href="/dashboard/bvn-verification" imageSrc="/nibss.png" />
          <ServiceCard title="VNIN to NIBSS" href="/dashboard/vnin-to-nibss" imageSrc="/nibss.png" />
          <ServiceCard title="BVN User" href="/dashboard/bvn-enrollment" imageSrc="/nibss.png" />
          <ServiceCard title="BVN Modification" href="/dashboard/bvn-modification" imageSrc="/nibss.png" />
          <ServiceCard title="Premium Slip" href="/dashboard/bvn-slip" imageSrc="/nibss.png" />
          <ServiceCard title="BVN Retrieval" href="/dashboard/bvn-retrieval" imageSrc="/nibss.png" />
        </CategorySection>

        <CategorySection title="Corporate Filings">
          <ServiceCard title="CAC Registration" href="/dashboard/cac-registration" imageSrc="/cac.png" />
          <ServiceCard title="Tax ID Search" href="/dashboard/tax-id" imageSrc="/nrs.png" />
        </CategorySection>

        <CategorySection title="Education">
          {/* Marked as coming soon, href ignored */}
          <ServiceCard title="JAMB Services" href="#" imageSrc="/jamb.png" comingSoon />
          <ServiceCard title="Exam Pins" href="#" imageSrc="/jamb.png" comingSoon />
        </CategorySection>

        <CategorySection title="Utilities & Bills">
          <ServiceCard title="Buy Airtime" href="/dashboard/airtime" imageSrc="/airtime.png" />
          <ServiceCard title="Data Bundles" href="/dashboard/data" imageSrc="/data.png" />
        </CategorySection>
        
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function CategorySection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-1 bg-blue-500 rounded-full"></div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">{title}</h3>
      </div>
      {/* Tighter gaps for a more compact layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}

function ServiceCard({ title, href, imageSrc, comingSoon }: { title: string, href: string, imageSrc: string, comingSoon?: boolean }) {
  const CardContent = (
    <div className={`group relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 h-full ${comingSoon ? 'opacity-75 grayscale-[20%]' : 'hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 hover:border-blue-200 dark:hover:border-slate-700 hover:-translate-y-1'}`}>
      
      {/* Coming Soon Animated Badge */}
      {comingSoon && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Soon</span>
        </div>
      )}

      {/* Reduced icon container size */}
      <div className={`h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-transform duration-500 shadow-inner ${comingSoon ? '' : 'group-hover:scale-110'}`}>
        <Image 
          src={imageSrc} 
          alt={title} 
          width={26} 
          height={26} 
          className="object-contain drop-shadow-sm"
        />
      </div>
      
      <h4 className={`font-semibold text-xs leading-snug transition-colors ${comingSoon ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
        {title}
      </h4>
    </div>
  );

  // If it's coming soon, render a non-clickable div
  if (comingSoon) {
    return <div className="cursor-not-allowed block h-full">{CardContent}</div>;
  }

  // Otherwise, render the active link
  return (
    <Link href={href} className="block h-full">
      {CardContent}
    </Link>
  );
}
