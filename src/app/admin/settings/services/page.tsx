'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Search, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ServiceSettings() {
  const [services, setServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    axios.get('/api/admin/settings/services').then(res => {
        setServices(res.data.services);
        setDataPlans(res.data.dataPlans);
    });
  }, []);

  const handleUpdate = async (type: 'SERVICE' | 'DATAPLAN', item: any, newPrice: string, newActive: boolean) => {
    setSaving(item.id);
    try {
        await axios.put('/api/admin/settings/services', {
            type,
            id: item.id,
            price: Number(newPrice),
            isActive: newActive
        });
        // Optimistic update
        if (type === 'SERVICE') {
            setServices(prev => prev.map(s => s.id === item.id ? { ...s, price: newPrice, isActive: newActive } : s));
        } else {
            setDataPlans(prev => prev.map(p => p.id === item.id ? { ...p, price: newPrice, isActive: newActive } : p));
        }
    } catch(e) { alert("Failed to save"); }
    finally { setSaving(''); }
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
  const filteredData = dataPlans.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-8 h-8 text-gray-600"/> Service Pricing</h1>
            <input type="text" placeholder="Search services..." value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-4 py-2 w-64 bg-white" />
        </div>

        {/* CORE SERVICES */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-gray-100 px-6 py-3 font-bold text-gray-600">Core Services</div>
            <table className="w-full text-left text-sm">
                <thead><tr className="text-gray-500 border-b"><th className="px-6 py-3">Name</th><th className="px-6 py-3">Price (₦)</th><th className="px-6 py-3 text-right">Status</th></tr></thead>
                <tbody>
                    {filteredServices.map(s => (
                        <Row key={s.id} item={s} type="SERVICE" onUpdate={handleUpdate} saving={saving} />
                    ))}
                </tbody>
            </table>
        </div>

        {/* DATA PLANS */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-blue-50 px-6 py-3 font-bold text-blue-600">Data Plans</div>
            <table className="w-full text-left text-sm">
                <thead><tr className="text-gray-500 border-b"><th className="px-6 py-3">Plan Name</th><th className="px-6 py-3">Price (₦)</th><th className="px-6 py-3 text-right">Status</th></tr></thead>
                <tbody>
                    {filteredData.map(p => (
                        <Row key={p.id} item={p} type="DATAPLAN" onUpdate={handleUpdate} saving={saving} />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

function Row({ item, type, onUpdate, saving }: any) {
    const [price, setPrice] = useState(item.price);
    const hasChanged = Number(price) !== Number(item.price);

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="px-6 py-3 font-medium">{item.name} <span className="text-gray-400 text-xs ml-2">{item.network}</span></td>
            <td className="px-6 py-3 flex items-center gap-2">
                <input 
                    type="number" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-24 border rounded px-2 py-1" 
                />
                {hasChanged && (
                    <button onClick={() => onUpdate(type, item, price, item.isActive)} disabled={saving === item.id} className="text-green-600 hover:bg-green-100 p-1 rounded">
                        <Save className="w-4 h-4" />
                    </button>
                )}
            </td>
            <td className="px-6 py-3 text-right">
                <button onClick={() => onUpdate(type, item, item.price, !item.isActive)} className={`text-2xl ${item.isActive ? 'text-green-500' : 'text-gray-300'}`}>
                    {item.isActive ? <ToggleRight /> : <ToggleLeft />}
                </button>
            </td>
        </tr>
    );
}
