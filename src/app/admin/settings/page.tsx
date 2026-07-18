'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Settings, Save, Search, ToggleLeft, ToggleRight, 
    Loader2, Globe, Code, Database, Server
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Pricing Mode Toggle
  const [priceMode, setPriceMode] = useState<'DASHBOARD' | 'API'>('DASHBOARD');
  
  // Updating state
  const [savingId, setSavingId] = useState('');

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
      updates: { dashboardPrice: number, apiPrice: number, isActive: boolean }
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
        alert("Failed to save changes. Please try again.");
    } finally {
        setSavingId('');
    }
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
  const filteredData = dataPlans.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400"/> Service Pricing Matrix
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage pricing and toggle service availability across channels.</p>
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

        {/* PRICING TOGGLE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-fit border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setPriceMode('DASHBOARD')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        priceMode === 'DASHBOARD' 
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Globe size={14} /> Dashboard Pricing
                </button>
                <button
                    onClick={() => setPriceMode('API')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        priceMode === 'API' 
                        ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Code size={14} /> API Pricing
                </button>
            </div>
            
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2">
                Currently Editing: <span className={priceMode === 'DASHBOARD' ? 'text-blue-500' : 'text-purple-500'}>{priceMode} Prices</span>
            </p>
        </div>

        {/* CORE SERVICES TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Server size={18} className="text-slate-400" /> API Services
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-bold">Service Name</th>
                            <th className="px-6 py-4 font-bold">Price Configuration (₦)</th>
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <Database size={18} className="text-blue-400 dark:text-blue-500" /> Data Plans
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-bold">Plan Name</th>
                            <th className="px-6 py-4 font-bold">Price Configuration (₦)</th>
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
    // Fallback to item.price if the specific channel price isn't set yet (legacy support)
    const [dashPrice, setDashPrice] = useState(item.dashboardPrice ?? item.price ?? 0);
    const [apiPrice, setApiPrice] = useState(item.apiPrice ?? item.price ?? 0);
    
    useEffect(() => {
        setDashPrice(item.dashboardPrice ?? item.price ?? 0);
        setApiPrice(item.apiPrice ?? item.price ?? 0);
    }, [item.dashboardPrice, item.apiPrice, item.price]);

    // Determine current active input based on mode
    const currentVal = priceMode === 'DASHBOARD' ? dashPrice : apiPrice;
    const setVal = priceMode === 'DASHBOARD' ? setDashPrice : setApiPrice;
    
    // Check if the current visible price has been modified
    const originalVal = priceMode === 'DASHBOARD' 
        ? (item.dashboardPrice ?? item.price ?? 0) 
        : (item.apiPrice ?? item.price ?? 0);
        
    const hasChanged = Number(currentVal) !== Number(originalVal);
    const isSaving = savingId === item.id;

    // Handle Saving Pricing Update
    const handleSavePrice = () => {
        onUpdate(type, item, {
            dashboardPrice: Number(dashPrice),
            apiPrice: Number(apiPrice),
            isActive: item.isActive
        });
    };

    // Handle Toggling Service
    const handleToggleActive = () => {
        onUpdate(type, item, {
            dashboardPrice: Number(dashPrice),
            apiPrice: Number(apiPrice),
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
                            className={`w-32 pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white font-mono font-bold outline-none transition-all shadow-sm ${
                                priceMode === 'DASHBOARD' 
                                ? 'focus:ring-2 focus:ring-blue-500 border-slate-200 dark:border-slate-700' 
                                : 'focus:ring-2 focus:ring-purple-500 border-slate-200 dark:border-slate-700'
                            }`} 
                        />
                    </div>
                    {hasChanged && (
                        <button 
                            onClick={handleSavePrice} 
                            disabled={isSaving} 
                            className="flex items-center justify-center h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md shadow-green-600/20 active:scale-95 disabled:opacity-50 font-bold text-xs"
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
