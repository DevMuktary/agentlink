'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wallet, Clock, Sun, Moon, Mail, MessageCircle, X, Gift, ArrowRight, Sparkles } from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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
    <div className="animate-in fade-in duration-500 pb-10 relative">
      
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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1E293B] dark:from-slate-800 dark:to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg shadow-slate-200/40 dark:shadow-none mb-4 border border-slate-800/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5" /> Available Balance
            </p>
            <Link 
              href="/dashboard/history"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all active:scale-95 border border-white/10"
            >
              <Clock className="w-3 h-3" /> History
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{formattedBalance}</h2>
            
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
              <Link 
                href="/dashboard/wallet"
                className="w-full sm:w-auto bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-center hover:bg-slate-100 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
              >
                + Fund Wallet
              </Link>
              <Link 
                href="/dashboard/referrals"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-center transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Gift className="w-4 h-4 shrink-0" /> Refer & Earn
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle Background Glows */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* 2. REFER & EARN QUICK PROMO CARD */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-purple-950/40 border border-purple-200/70 dark:border-purple-900/40 rounded-3xl p-5 sm:p-6 mb-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Refer Agents & Earn for 1 Year</h3>
              <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                1-Year Commission
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Earn automatic rewards for 365 days on all services completed by your referees (Airtime & Data excluded).
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/referrals"
          className="px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto text-center"
        >
          View Program & Link <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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

      {/* FLOATING SUPPORT WIDGET */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {supportOpen && (
          <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200 w-64 origin-bottom-right">
            <a 
              href="mailto:agenthub.ng@gmail.com" 
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Email Support</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">agenthub.ng@gmail.com</p>
              </div>
            </a>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
            <a 
              href="https://whatsapp.com/channel/0029Vb8wFRQIHphRAJnlib1O" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-full text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Channel</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Join our community</p>
              </div>
            </a>
          </div>
        )}

        <div className="relative group">
          {!supportOpen && (
            <>
              {/* Bouncing Welcome Bubble */}
              <div className="absolute -top-12 right-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg whitespace-nowrap animate-bounce">
                Need Help? 👋
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 dark:bg-white rotate-45"></div>
              </div>
              {/* Outer Pulsing Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-30 w-full h-full pointer-events-none scale-[1.3]"></div>
            </>
          )}

          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform active:scale-95 hover:scale-105 z-10"
          >
            {supportOpen ? (
              <div className="bg-slate-900 dark:bg-white w-full h-full flex items-center justify-center">
                <X size={28} className="text-white dark:text-slate-900" />
              </div>
            ) : (
              // Anime-style avatar using DiceBear Micah styling
              <img
                src="https://api.dicebear.com/9.x/micah/svg?seed=SupportAgent&backgroundColor=b6e3f4"
                alt="Support Agent"
                className="w-full h-full object-cover scale-[1.15] mt-1"
              />
            )}
          </button>
        </div>
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
