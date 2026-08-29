'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import {
  Gift, Users, Wallet, ArrowUpRight, Copy, Check, Share2,
  Building2, CheckCircle2, AlertCircle, Loader2, X, Info,
  Sparkles, TrendingUp, History, CreditCard, ChevronRight,
  ShieldCheck, Smartphone, ExternalLink, RefreshCcw
} from 'lucide-react';

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'referees' | 'earnings' | 'payouts' | 'rates'>('referees');

  // Paystack Onboarding States
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ name: string; code: string } | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Payout Modal States
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutType, setPayoutType] = useState<'WALLET' | 'BANK'>('WALLET');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Toast / Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchReferralData = async () => {
    try {
      const res = await axios.get('/api/user/referrals');
      if (res.data.status) {
        setDashboardData(res.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load referral data:', error);
      showToast(error.response?.data?.error || 'Failed to load referral dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    if (banks.length > 0) return;
    setBanksLoading(true);
    try {
      const res = await axios.get('/api/paystack/banks');
      if (res.data.status && Array.isArray(res.data.data)) {
        setBanks(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
      showToast('Could not load banks from Paystack.', 'error');
    } finally {
      setBanksLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
    fetchBanks();
  }, []);

  // Live account number resolution when 10 digits & bank selected
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      handleResolveAccount();
    } else {
      setAccountName('');
    }
  }, [accountNumber, selectedBank]);

  const handleResolveAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setResolvingAccount(true);
    setAccountName('');
    try {
      const res = await axios.post('/api/paystack/resolve-account', {
        accountNumber,
        bankCode: selectedBank.code,
      });
      if (res.data.status && res.data.data.accountName) {
        setAccountName(res.data.data.accountName);
      } else {
        showToast(res.data.error || 'Account could not be resolved.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Invalid account details.', 'error');
    } finally {
      setResolvingAccount(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountNumber || !accountName) {
      showToast('Please provide verified bank details.', 'error');
      return;
    }

    setEnrolling(true);
    try {
      const res = await axios.post('/api/user/referrals/enroll', {
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        accountNumber,
        accountName,
      });
      if (res.data.status) {
        showToast('Successfully enrolled in Refer & Earn program!');
        await fetchReferralData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Enrollment failed. Please try again.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await axios.post('/api/user/referrals/payout', {
        type: payoutType,
        amount,
      });
      if (res.data.status) {
        showToast(res.data.message);
        setPayoutModalOpen(false);
        setPayoutAmount('');
        await fetchReferralData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Payout request failed.', 'error');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!dashboardData?.user?.referralCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agentlink.ng';
    const link = `${origin}/register?ref=${dashboardData.user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    if (!dashboardData?.user?.referralCode) return;
    navigator.clipboard.writeText(dashboardData.user.referralCode);
    setCopiedCode(true);
    showToast('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleWhatsAppShare = () => {
    if (!dashboardData?.user?.referralCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agentlink.ng';
    const link = `${origin}/register?ref=${dashboardData.user.referralCode}`;
    const text = encodeURIComponent(`Join AgentHub for fast NIN, BVN, Utilities, and Corporate agent services! Sign up with my link:\n${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) return <GlobalLoader />;

  const isEnrolled = dashboardData?.user?.isReferralEnrolled;
  const user = dashboardData?.user;
  const referees = dashboardData?.referees || [];
  const earnings = dashboardData?.earnings || [];
  const payouts = dashboardData?.payouts || [];
  const matrix = dashboardData?.commissionMatrix || { services: [], dataPlans: [] };
  const minPayoutBank = dashboardData?.minPayoutBank || dashboardData?.minPayout || 3000;
  const minPayoutWallet = dashboardData?.minPayoutWallet || 1000;
  const availableBalance = Number(user?.referralEarningsBalance || 0);
  const lifetimeEarned = Number(user?.referralEarningsTotal || 0);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agentlink.ng';
  const referralLink = user?.referralCode ? `${originUrl}/register?ref=${user.referralCode}` : '';

  return (
    <div className="space-y-6 animate-in fade-in pb-24 max-w-7xl mx-auto">

      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold ${toast.type === 'success'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
              : 'bg-red-600 text-white border-red-500'
            }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            )}
            <span className="flex-1 text-xs sm:text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
              <Gift className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Refer & Earn Program</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Invite fellow agents and earn recurring commissions whenever they perform dashboard services (except Airtime & Data).
          </p>
        </div>

        {isEnrolled && (
          <button
            onClick={() => setPayoutModalOpen(true)}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" /> Withdraw Earnings
          </button>
        )}
      </div>

      {/* PHASE 1: UNENROLLED ONBOARDING VIEW */}
      {!isEnrolled ? (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <div className="max-w-2xl relative z-10">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30 inline-flex items-center gap-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5" /> 1-Year Affiliate Program
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Turn your network into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">passive income.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                Connect other agents to AgentHub. Every time your referee purchases NIN Slips, BVN Verifications, or Corporate Filings on their dashboard, you earn instant commission for a full year from their signup date (Airtime & Data excluded).
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
                <h4 className="font-bold text-sm">1-Year Commission Window</h4>
                <p className="text-xs text-slate-400 mt-1">Continuous rewards for 365 days on every referee.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm">Dual Payout Options</h4>
                <p className="text-xs text-slate-400 mt-1">Transfer to your wallet or withdraw to your bank.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm">Automated Tracking</h4>
                <p className="text-xs text-slate-400 mt-1">Live transparent logs of every referee transaction.</p>
              </div>
            </div>
          </div>

          {/* Onboarding Bank Verification Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activate Your Referral Account</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter your bank account details. We verify your account in real-time via Paystack for instant, secure payouts.
                </p>
              </div>

              <form onSubmit={handleEnroll} className="space-y-5">
                {/* Bank Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Select Bank
                  </label>
                  <select
                    value={selectedBank?.code || ''}
                    onChange={(e) => {
                      const found = banks.find(b => b.code === e.target.value);
                      setSelectedBank(found || null);
                    }}
                    disabled={banksLoading || enrolling}
                    required
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="">{banksLoading ? 'Loading bank directory...' : '-- Choose your bank --'}</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    10-Digit NUBAN Account Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      inputMode="numeric"
                      pattern="\d*"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 0123456789"
                      disabled={enrolling}
                      required
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all tracking-widest"
                    />
                    {resolvingAccount && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Account Name Badge */}
                {accountName && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Verified Account Holder</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{accountName}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enrolling || resolvingAccount || !accountName}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
                >
                  {enrolling ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Activating Program...</>
                  ) : (
                    <>Join Refer & Earn Program <ArrowUpRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE 2: ENROLLED REFERRAL DASHBOARD VIEW */
        <div className="space-y-6">

          {/* KPI STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-200 uppercase tracking-widest">Available Earnings</p>
                <h3 className="text-3xl font-black mt-2 tracking-tight">₦{availableBalance.toLocaleString()}</h3>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-purple-200">Ready to withdraw</span>
                <button
                  onClick={() => setPayoutModalOpen(true)}
                  disabled={availableBalance < 100}
                  className="px-3.5 py-1.5 bg-white text-purple-900 hover:bg-purple-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>
            </div>

            {/* Lifetime Earned */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Earned</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₦{lifetimeEarned.toLocaleString()}</h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">Total rewards accumulated</p>
            </div>

            {/* Referred Agents */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Referred Agents</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{referees.length}</h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">Agents signed up via your link</p>
            </div>

            {/* Active Referees */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Referees</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {referees.filter((r: any) => r.completedServicesCount > 0).length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">Referees who ran at least 1 service</p>
            </div>

          </div>

          {/* SHARE CARD & BANK SNAPSHOT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Share Link Card (2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Share Your Referral Link
                  </h3>
                  <span className="text-xs font-mono font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                    CODE: {user?.referralCode}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Share your link with agents, POS operators, and businesses. When they register using your code or link, you'll earn automatic commission on all their dashboard transactions.
                </p>

                {/* Link Box */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
                  <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 truncate select-all flex items-center">
                    {referralLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-5 py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied Link' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <Smartphone className="w-4 h-4" /> Share to WhatsApp
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Code Copied' : 'Copy Code Only'}
                </button>
              </div>
            </div>

            {/* Registered Bank Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Payout Bank Account
                </h3>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bank Name</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.referralBankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Number</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-widest">{user?.referralAccountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Name</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{user?.referralAccountName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Min. Bank Payout: <strong>₦{minPayoutBank.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Min. Wallet Transfer: <strong>₦{minPayoutWallet.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

          </div>

          {/* NAVIGATION TABS */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('referees')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'referees'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Users size={14} /> Referred Agents ({referees.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'earnings'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <History size={14} /> Commission Log ({earnings.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'payouts'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <CreditCard size={14} /> Payout History ({payouts.length})
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'rates'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <TrendingUp size={14} /> Commission Rates Matrix
            </button>
          </div>

          {/* TAB CONTENT 1: REFERRED AGENTS */}
          {activeTab === 'referees' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Your Referred Agents</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">List of users who registered using your referral code.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Agent Name / Business</th>
                      <th className="px-6 py-4">Date Joined</th>
                      <th className="px-6 py-4">Completed Services</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {referees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          No referees yet. Share your referral link to start earning!
                        </td>
                      </tr>
                    ) : (
                      referees.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            <div>{r.name}</div>
                            {r.businessName && (
                              <span className="text-xs text-slate-400 font-normal">{r.businessName}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(r.joinedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {r.completedServicesCount} services
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.completedServicesCount > 0
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}>
                              {r.completedServicesCount > 0 ? 'Active Customer' : 'Registered'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: COMMISSION EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Commission Earnings History</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time breakdown of rewards generated from referee activity.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Referee</th>
                      <th className="px-6 py-4">Service Type</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4 text-right">Commission (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {earnings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                          <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          No commissions earned yet. They will appear here automatically when referees complete services.
                        </td>
                      </tr>
                    ) : (
                      earnings.map((e: any) => (
                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{e.refereeName}</td>
                          <td className="px-6 py-4 text-xs text-purple-600 dark:text-purple-400 font-semibold">{e.serviceType.replace(/_/g, ' ')}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{e.reference}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +₦{e.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PAYOUT HISTORY */}
          {activeTab === 'payouts' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Withdrawal & Payout Requests</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track your wallet transfers and bank withdrawal requests.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {payouts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                          <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          No withdrawal requests found.
                        </td>
                      </tr>
                    ) : (
                      payouts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {p.type === 'WALLET' ? (
                              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                <Wallet size={14} /> Main Wallet
                              </span>
                            ) : (
                              <div>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                  <Building2 size={14} /> {p.bankName}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">{p.accountNumber} ({p.accountName})</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                            ₦{p.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.status === 'COMPLETED'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : p.status === 'PENDING'
                                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                              }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400">
                            {p.adminNote || (p.type === 'WALLET' ? 'Instant Transfer' : 'Awaiting Review')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: COMMISSION RATES MATRIX */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              {/* Core Services Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Services Commission Rates Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin-configured referral payout per completed service (Airtime & Data excluded).</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                    1-Year Earning Period
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Service Name</th>
                        <th className="px-6 py-4">Dashboard Price</th>
                        <th className="px-6 py-4 text-right">Referral Reward (You Earn)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {matrix.services.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                            No active commissionable services configured currently.
                          </td>
                        </tr>
                      ) : (
                        matrix.services.map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">₦{s.price.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                              {s.reward > 0 ? `₦${s.reward.toLocaleString()}` : <span className="text-slate-400 font-normal">₦0.00 (No reward)</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* WITHDRAWAL / PAYOUT MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPayoutModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Wallet size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Withdraw Referral Earnings</h3>
                <p className="text-xs text-slate-400">Available Balance: ₦{availableBalance.toLocaleString()}</p>
              </div>
            </div>

            {/* Payout Channel Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPayoutType('WALLET')}
                className={`py-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${payoutType === 'WALLET'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Wallet size={16} />
                <span>To Main Wallet</span>
                <span className="text-[10px] opacity-75 font-normal">Instant Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPayoutType('BANK')}
                className={`py-3 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${payoutType === 'BANK'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Building2 size={16} />
                <span>To Bank Account</span>
                <span className="text-[10px] opacity-75 font-normal">Admin Approval</span>
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              {/* Destination Summary */}
              {payoutType === 'WALLET' ? (
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Instant Transfer to Main Platform Wallet</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Funds will be added immediately for service purchases.</p>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">Min. transfer: ₦{minPayoutWallet.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{user?.referralBankName} — {user?.referralAccountNumber}</p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400">{user?.referralAccountName}</p>
                    <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-1">Min. bank withdrawal: ₦{minPayoutBank.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Withdrawal Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder={payoutType === 'WALLET' ? `Min ₦${minPayoutWallet.toLocaleString()}` : `Min ₦${minPayoutBank.toLocaleString()}`}
                    max={availableBalance}
                    required
                    className="w-full pl-8 pr-20 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(availableBalance))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-lg"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  payoutLoading ||
                  !payoutAmount ||
                  Number(payoutAmount) <= 0 ||
                  Number(payoutAmount) > availableBalance ||
                  (payoutType === 'WALLET' && Number(payoutAmount) < minPayoutWallet) ||
                  (payoutType === 'BANK' && Number(payoutAmount) < minPayoutBank)
                }
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {payoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
