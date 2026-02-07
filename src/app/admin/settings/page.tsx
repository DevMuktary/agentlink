'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Search, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
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

  const handleUpdate = async (type: 'SERVICE' | 'DATAPLAN', item: any, newPrice: string, newActive: boolean) => {
    setSavingId(item.id);
    try {
        await axios.put('/api/admin/settings/services', {
            type,
            id: item.id,
            price: Number(newPrice),
            isActive: newActive
        });

        // Optimistic Update
        if (type === 'SERVICE') {
            setServices(prev => prev.map(s => s.id === item.id ? { ...s, price: newPrice, isActive: newActive } : s));
        } else {
            setDataPlans(prev => prev.map(p => p.id === item.id ? { ...p, price: newPrice, isActive: newActive } : p));
        }
    } catch (e) {
        alert("Failed to save changes");
    } finally {
        setSavingId('');
    }
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
  const filteredData = dataPlans.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <GlobalLoader />;

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400"/> Service Pricing
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage API prices and toggle service availability.</p>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                    className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                />
            </div>
        </div>

        {/* CORE SERVICES TABLE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">
                Core Services
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Service Name</th>
                            <th className="px-6 py-3 font-semibold">Price (₦)</th>
                            <th className="px-6 py-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredServices.map(s => (
                            <Row key={s.id} item={s} type="SERVICE" onUpdate={handleUpdate} savingId={savingId} />
                        ))}
                        {filteredServices.length === 0 && (
                            <tr><td colSpan={3} className="p-6 text-center text-gray-500">No services found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* DATA PLANS TABLE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 font-bold text-blue-700 dark:text-blue-400">
                Data Plans
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Plan Name</th>
                            <th className="px-6 py-3 font-semibold">Price (₦)</th>
                            <th className="px-6 py-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredData.map(p => (
                            <Row key={p.id} item={p} type="DATAPLAN" onUpdate={handleUpdate} savingId={savingId} />
                        ))}
                        {filteredData.length === 0 && (
                            <tr><td colSpan={3} className="p-6 text-center text-gray-500">No data plans found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

// --- ROW COMPONENT ---
function Row({ item, type, onUpdate, savingId }: any) {
    const [price, setPrice] = useState(item.price);
    
    // Update local state when prop changes (for search filtering consistency)
    useEffect(() => {
        setPrice(item.price);
    }, [item.price]);

    const hasChanged = Number(price) !== Number(item.price);
    const isSaving = savingId === item.id;

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {item.name} 
                {item.network && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        {item.network}
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-24 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                    {hasChanged && (
                        <button 
                            onClick={() => onUpdate(type, item, price, item.isActive)} 
                            disabled={isSaving} 
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition"
                            title="Save Price"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button 
                    onClick={() => onUpdate(type, item, item.price, !item.isActive)} 
                    disabled={isSaving}
                    className={`text-2xl transition-colors ${item.isActive ? 'text-green-500 dark:text-green-400 hover:text-green-600' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'}`}
                    title={item.isActive ? "Deactivate" : "Activate"}
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : (
                        item.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />
                    )}
                </button>
            </td>
        </tr>
    );
}
