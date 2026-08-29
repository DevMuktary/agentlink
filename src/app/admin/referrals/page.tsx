'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import { 
  Gift, Users, Wallet, CheckCircle2, XCircle, Clock, 
  Copy, Check, Search, Settings, Save, AlertTriangle, 
  Loader2, X, Building2, Phone, Mail, ArrowUpRight, 
  Sliders, ShieldCheck, RefreshCcw, Filter
} from 'lucide-react';

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'referrers' | 'history' | 'settings'>('pending');

  // Search & Filter
  const [referrerFilter, setReferrerFilter] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED'>('ALL');

  // Action Modal State
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    payout: any;
    action: 'APPROVE' | 'REJECT';
    note: string;
  }>({
    open: false,
    payout: null,
    action: 'APPROVE',
    note: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Settings State
  const [minPayoutBankInput, setMinPayoutBankInput] = useState('3000');
  const [minPayoutWalletInput, setMinPayoutWalletInput] = useState('1000');
  const [isReferralActive, setIsReferralActive] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Toast / Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAdminReferralData = async () => {
    try {
      const res = await axios.get('/api/admin/referrals');
      if (res.data.status) {
        setData(res.data.data);
        setMinPayoutBankInput(String(res.data.data.stats?.minPayoutBank || res.data.data.stats?.minPayoutThreshold || 3000));
        setMinPayoutWalletInput(String(res.data.data.stats?.minPayoutWallet || 1000));
        setIsReferralActive(res.data.data.stats?.isReferralActive !== false);
      }
    } catch (error: any) {
      console.error('Failed to load admin referral data:', error);
      showToast(error.response?.data?.error || 'Failed to load referral data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminReferralData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.payout) return;

    setActionLoading(true);
    try {
      const res = await axios.post('/api/admin/referrals/payout-action', {
        payoutId: actionModal.payout.id,
        action: actionModal.action,
        note: actionModal.note,
      });

      if (res.data.status) {
        showToast(res.data.message);
        setActionModal({ open: false, payout: null, action: 'APPROVE', note: '' });
        await fetchAdminReferralData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await axios.put('/api/admin/referrals', {
        minPayoutBank: Number(minPayoutBankInput),
        minPayoutWallet: Number(minPayoutWalletInput),
        isReferralActive,
      });
      if (res.data.status) {
        showToast('Referral program settings saved successfully!');
        await fetchAdminReferralData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <GlobalLoader />;

  const stats = data?.stats || {};
  const pendingPayouts = data?.pendingPayouts || [];
  const allPayouts = data?.allPayouts || [];
  const referrers = data?.referrers || [];

  const filteredReferrers = referrers.filter((r: any) =>
    r.name.toLowerCase().includes(referrerFilter.toLowerCase()) ||
    r.email.toLowerCase().includes(referrerFilter.toLowerCase()) ||
    (r.phone && r.phone.includes(referrerFilter)) ||
    (r.referralCode && r.referralCode.toLowerCase().includes(referrerFilter.toLowerCase()))
  );

  const filteredHistory = allPayouts.filter((p: any) => {
    if (historyFilter === 'ALL') return true;
    return p.status === historyFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-28 max-w-7xl mx-auto">
      
      {/* TOAST ALERT */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold ${
            toast.type === 'success' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' 
              : 'bg-red-600 text-white border-red-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
            )}
            <span className="flex-1 text-xs sm:text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 1. MOBILE-FRIENDLY HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
              <Gift className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Referrals & Payouts Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage agent commission payouts, track enrolled referrers, and configure program thresholds.
          </p>
        </div>

        <button
          onClick={fetchAdminReferralData}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <RefreshCcw size={14} /> Refresh Data
        </button>
      </div>

      {/* 2. STATS CARDS (MOBILE OPTIMIZED) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Pending Payouts (High Priority) */}
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-200 uppercase tracking-widest">Pending Payouts</span>
              {pendingPayouts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                  {pendingPayouts.length} Action
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">₦{stats.pendingPayoutsAmount?.toLocaleString() || 0}</h3>
          </div>
          <p className="text-[11px] text-purple-200 mt-3 sm:mt-4">{pendingPayouts.length} bank transfer request(s)</p>
        </div>

        {/* Total Paid Commissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Paid Commissions</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">₦{stats.totalCommissionsPaid?.toLocaleString() || 0}</h3>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Cumulative distributed</p>
        </div>

        {/* Enrolled Referrers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Referrers</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.enrolledReferrers || 0}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active affiliates</p>
        </div>

        {/* Total Referees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Referred Customers</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalReferees || 0}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Acquired via referrals</p>
        </div>

      </div>

      {/* 3. TABS NAVIGATION (TOUCH FRIENDLY) */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock size={15} /> Pending Queue ({pendingPayouts.length})
        </button>
        <button
          onClick={() => setActiveTab('referrers')}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === 'referrers'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users size={15} /> Referrers Directory ({referrers.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckCircle2 size={15} /> All Payouts Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Settings size={15} /> Program Settings
        </button>
      </div>

      {/* TAB 1: PENDING PAYOUTS QUEUE (MOBILE CARD LIST) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Pending Bank Withdrawal Requests ({pendingPayouts.length})
            </h3>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">All Clear!</h4>
              <p className="text-xs text-slate-400 mt-1">There are no pending bank payout requests to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayouts.map((p: any) => (
                <div 
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-purple-200 dark:border-purple-900/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          Bank Transfer Request
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">{p.user.name}</h4>
                        <p className="text-xs text-slate-400">{p.user.phone} • {p.user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium">Amount:</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                          ₦{p.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Bank Details Box with 1-Tap Copy */}
                    <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Bank</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{p.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account No.</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(p.accountNumber, p.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-purple-600 dark:text-purple-400 active:scale-95 transition-all"
                        >
                          {copiedId === p.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{p.accountNumber}</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Name</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">{p.accountName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => setActionModal({ open: true, payout: p, action: 'APPROVE', note: 'Transfer completed via Bank' })}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Mark as Paid
                    </button>
                    <button
                      onClick={() => setActionModal({ open: true, payout: p, action: 'REJECT', note: '' })}
                      className="px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REFERRERS DIRECTORY */}
      {activeTab === 'referrers' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Enrolled Referrers Directory</h3>
              <p className="text-xs text-slate-400">Search and audit agents currently in the referral program.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search referrer..."
                value={referrerFilter}
                onChange={(e) => setReferrerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Agent Name / Code</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Referees</th>
                  <th className="px-6 py-4">Unpaid Balance</th>
                  <th className="px-6 py-4">Lifetime Earned</th>
                  <th className="px-6 py-4 text-right">Bank Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredReferrers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No referrers found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredReferrers.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                        <span className="text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                          {r.referralCode || 'NO CODE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        <div>{r.email}</div>
                        <div>{r.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {r.refereesCount} agents
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        ₦{r.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₦{r.totalEarned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">{r.bankName}</div>
                        <div className="font-mono text-slate-400">{r.accountNumber}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{r.accountName}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL PAYOUTS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Payout History Log</h3>
              <p className="text-xs text-slate-400">Complete audit list of wallet transfers and bank payouts.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {(['ALL', 'COMPLETED', 'REJECTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    historyFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Type / Bank</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No payout records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {p.user.name}
                        <div className="text-xs text-slate-400 font-normal">{p.user.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {p.type === 'WALLET' ? (
                          <span className="font-bold text-blue-600 dark:text-blue-400">Main Wallet</span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{p.bankName}</span>
                            <div className="font-mono text-slate-400">{p.accountNumber} ({p.accountName})</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₦{p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : p.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        {p.adminNote || 'Processed'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROGRAM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Referral Global Parameters</h3>
              <p className="text-xs text-slate-400">Configure minimum threshold and system switches.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Minimum Wallet Transfer Threshold */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Minimum Wallet Transfer Amount (₦)
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Agents can instantly transfer referral earnings to their platform wallet starting from this amount.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={minPayoutWalletInput}
                  onChange={(e) => setMinPayoutWalletInput(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Minimum Bank Withdrawal Threshold */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Minimum Bank Withdrawal Amount (₦)
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Agents can only request a direct bank transfer once their referral balance reaches this amount.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={minPayoutBankInput}
                  onChange={(e) => setMinPayoutBankInput(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Master Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Referral Program Active</p>
                <p className="text-xs text-slate-400">Toggle whether commissions are awarded upon dashboard service completion.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReferralActive(!isReferralActive)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  isReferralActive ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    isReferralActive ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={16} /> Save Referral Settings</>}
            </button>
          </form>
        </div>
      )}

      {/* ACTION CONFIRMATION MODAL */}
      {actionModal.open && actionModal.payout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActionModal({ open: false, payout: null, action: 'APPROVE', note: '' })}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                actionModal.action === 'APPROVE' 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' 
                  : 'bg-red-50 dark:bg-red-500/10 text-red-600'
              }`}>
                {actionModal.action === 'APPROVE' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {actionModal.action === 'APPROVE' ? 'Confirm Bank Payout' : 'Reject Payout Request'}
                </h3>
                <p className="text-xs text-slate-400">
                  {actionModal.action === 'APPROVE' 
                    ? 'Confirm that you have transferred the funds to the agent.' 
                    : 'Funds will be refunded back to the agent\'s referral balance.'}
                </p>
              </div>
            </div>

            {/* Payout Summary Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Agent:</span>
                <span className="font-bold text-slate-900 dark:text-white">{actionModal.payout.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Amount:</span>
                <span className="font-black text-purple-600 dark:text-purple-400 text-sm">₦{actionModal.payout.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Bank & Account:</span>
                <span className="font-bold text-slate-900 dark:text-white">{actionModal.payout.bankName} ({actionModal.payout.accountNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Account Name:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{actionModal.payout.accountName}</span>
              </div>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder={actionModal.action === 'APPROVE' ? 'e.g. Paid via GTBank App' : 'e.g. Invalid account name or suspected fraud'}
                  value={actionModal.note}
                  onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, payout: null, action: 'APPROVE', note: '' })}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 py-3 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
                    actionModal.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    actionModal.action === 'APPROVE' ? 'Mark as Paid' : 'Confirm Reject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
