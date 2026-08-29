'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Settings, Save, Search, ToggleLeft, ToggleRight, 
    Loader2, Globe, Code, Database, Server, Gift
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Pricing Mode Toggle: DASHBOARD, API, or REFERRAL REWARDS
  const [priceMode, setPriceMode] = useState<'DASHBOARD' | 'API' | 'REFERRAL'>('DASHBOARD');
  
  // Updating state
  const [savingId, setSavingId] = useState('');
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await axios.get('/api/admin/settings/services');
        setServices(res.data.services || []);
        setDataPlans(res.data.dataPlans || []);
    } catch (error) {
        console.error("Failed to load settings");
    } finally {
        setLoading(false);
    }
  };

  const handleUpdate = async (
      type: 'SERVICE' | 'DATAPLAN', 
      item: any, 
      updates: { dashboardPrice: number; apiPrice: number; referralReward: number; isActive: boolean }
  ) => {
    setSavingId(item.id);
    try {
        await axios.put('/api/admin/settings/services', {
            type,
            id: item.id,
            ...updates
        });

        // Optimistic Update
        if (type === 'SERVICE') {
            setServices(prev => prev.map(s => s.id === item.id ? { ...s, ...updates } : s));
        } else {
            setDataPlans(prev => prev.map(p => p.id === item.id ? { ...p, ...updates } : p));
        }
    } catch (e) {
        setErrorToast("Failed to save changes. Please try again.");
        setTimeout(() => setErrorToast(''), 4000);
    } finally {
        setSavingId('');
    }
  };

  const filteredServices = services.filter(s => {
    const matchesQuery = s.name.toLowerCase().includes(filter.toLowerCase()) || (s.code && s.code.toLowerCase().includes(filter.toLowerCase()));
    if (!matchesQuery) return false;

    // In Referral Rewards mode, hide internal bank toggles, 0-priced services, airtime, and inactive services
    if (priceMode === 'REFERRAL') {
      if (s.code && (s.code.startsWith('BANK_') || s.code.startsWith('AIRTIME_') || s.code === 'DATA')) return false;
      if (!s.isActive) return false;
      const currentDashPrice = Number(s.dashboardPrice ?? s.price ?? 0);
      if (currentDashPrice <= 0) return false;
    }

    return true;
  });

  const filteredData = dataPlans.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(filter.toLowerCase()) || (p.network && p.network.toLowerCase().includes(filter.toLowerCase()));
    if (!matchesQuery) return false;

    if (priceMode === 'REFERRAL') {
      if (!p.isActive) return false;
      const currentDashPrice = Number(p.dashboardPrice ?? p.price ?? 0);
      if (currentDashPrice <= 0) return false;
    }

    return true;
  });

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-7xl mx-auto">
        
        {/* TOAST ERROR */}
        {errorToast && (
          <div className="fixed top-6 right-6 z-50 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold">
            {errorToast}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400"/> Service Pricing Matrix
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Manage dashboard prices, API prices, referral commissions, and service availability.
                </p>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                    className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                />
            </div>
        </div>

        {/* PRICING MODE TOGGLE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setPriceMode('DASHBOARD')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        priceMode === 'DASHBOARD' 
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Globe size={14} /> Dashboard Pricing
                </button>
                <button
                    onClick={() => setPriceMode('API')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        priceMode === 'API' 
                        ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Code size={14} /> API Pricing
                </button>
                <button
                    onClick={() => setPriceMode('REFERRAL')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        priceMode === 'REFERRAL' 
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Gift size={14} /> Referral Reward (₦)
                </button>
            </div>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2">
                Currently Editing: <span className={
                  priceMode === 'DASHBOARD' ? 'text-blue-500' : priceMode === 'API' ? 'text-purple-500' : 'text-emerald-500'
                }>{priceMode === 'REFERRAL' ? 'Referral Rewards (₦)' : `${priceMode} Prices`}</span>
            </p>
        </div>

        {/* CORE SERVICES TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Server size={18} className="text-slate-400" /> Core Services
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-bold">Service Name</th>
                            <th className="px-6 py-4 font-bold">
                              {priceMode === 'REFERRAL' ? 'Referral Reward (₦)' : 'Price Configuration (₦)'}
                            </th>
                            <th className="px-6 py-4 font-bold text-right">Global Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filteredServices.map(s => (
                            <Row key={s.id} item={s} type="SERVICE" priceMode={priceMode} onUpdate={handleUpdate} savingId={savingId} />
                        ))}
                        {filteredServices.length === 0 && (
                            <tr><td colSpan={3} className="p-12 text-center text-slate-500 font-medium">No core services found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* DATA PLANS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <Database size={18} className="text-blue-400 dark:text-blue-500" /> Data Plans
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-bold">Plan Name</th>
                            <th className="px-6 py-4 font-bold">
                              {priceMode === 'REFERRAL' ? 'Referral Reward (₦)' : 'Price Configuration (₦)'}
                            </th>
                            <th className="px-6 py-4 font-bold text-right">Global Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filteredData.map(p => (
                            <Row key={p.id} item={p} type="DATAPLAN" priceMode={priceMode} onUpdate={handleUpdate} savingId={savingId} />
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan={3} className="p-12 text-center text-slate-500 font-medium">No data plans found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

// --- ROW COMPONENT ---
function Row({ item, type, priceMode, onUpdate, savingId }: any) {
    const [dashPrice, setDashPrice] = useState(item.dashboardPrice ?? item.price ?? 0);
    const [apiPrice, setApiPrice] = useState(item.apiPrice ?? item.price ?? 0);
    const [referralReward, setReferralReward] = useState(item.referralReward ?? 0);
    
    useEffect(() => {
        setDashPrice(item.dashboardPrice ?? item.price ?? 0);
        setApiPrice(item.apiPrice ?? item.price ?? 0);
        setReferralReward(item.referralReward ?? 0);
    }, [item.dashboardPrice, item.apiPrice, item.referralReward, item.price]);

    // Determine current active input based on mode
    const currentVal = priceMode === 'DASHBOARD' ? dashPrice : priceMode === 'API' ? apiPrice : referralReward;
    const setVal = priceMode === 'DASHBOARD' ? setDashPrice : priceMode === 'API' ? setApiPrice : setReferralReward;
    
    // Check if the current visible price has been modified
    const originalVal = priceMode === 'DASHBOARD' 
        ? (item.dashboardPrice ?? item.price ?? 0) 
        : priceMode === 'API'
        ? (item.apiPrice ?? item.price ?? 0)
        : (item.referralReward ?? 0);
        
    const hasChanged = Number(currentVal) !== Number(originalVal);
    const isSaving = savingId === item.id;

    // Handle Saving Pricing Update
    const handleSavePrice = () => {
        onUpdate(type, item, {
            dashboardPrice: Number(dashPrice),
            apiPrice: Number(apiPrice),
            referralReward: Number(referralReward),
            isActive: item.isActive
        });
    };

    // Handle Toggling Service
    const handleToggleActive = () => {
        onUpdate(type, item, {
            dashboardPrice: Number(dashPrice),
            apiPrice: Number(apiPrice),
            referralReward: Number(referralReward),
            isActive: !item.isActive
        });
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                {item.name} 
                {item.network && (
                    <span className="ml-2 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {item.network}
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                        <input 
                            type="number" 
                            value={currentVal} 
                            onChange={e => setVal(e.target.value)} 
                            className={`w-32 pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white font-mono font-bold outline-none transition-all shadow-sm ${
                                priceMode === 'DASHBOARD' 
                                ? 'focus:ring-2 focus:ring-blue-500 border-slate-200 dark:border-slate-700' 
                                : priceMode === 'API'
                                ? 'focus:ring-2 focus:ring-purple-500 border-slate-200 dark:border-slate-700'
                                : 'focus:ring-2 focus:ring-emerald-500 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400'
                            }`} 
                        />
                    </div>
                    {hasChanged && (
                        <button 
                            onClick={handleSavePrice} 
                            disabled={isSaving} 
                            className="flex items-center justify-center h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 font-bold text-xs"
                            title="Save Pricing Configuration"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</span>}
                        </button>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button 
                    onClick={handleToggleActive} 
                    disabled={isSaving} 
                    className={`text-3xl transition-all active:scale-90 ${
                        item.isActive 
                        ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-sm' 
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                    title={item.isActive ? "Deactivate Globally" : "Activate Globally"}
                >
                    {isSaving ? <Loader2 className="w-7 h-7 animate-spin text-slate-400 inline-block" /> : (
                        item.isActive ? <ToggleRight className="w-9 h-9 inline-block" /> : <ToggleLeft className="w-9 h-9 inline-block" />
                    )}
                </button>
            </td>
        </tr>
    );
}
