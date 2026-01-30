'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Wifi, Copy, CheckCircle2 } from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function DataPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [filterNetwork, setFilterNetwork] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/utilities/data/plans')
      .then(res => {
          if (res.data.status) setPlans(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter Logic
  const filteredPlans = plans.filter(plan => {
      const matchesNetwork = filterNetwork === 'ALL' || plan.network === filterNetwork;
      const matchesSearch = plan.name.toLowerCase().includes(search.toLowerCase()) || 
                            plan.productCode.toLowerCase().includes(search.toLowerCase());
      return matchesNetwork && matchesSearch;
  });

  const getNetworkColor = (net: string) => {
      switch(net) {
          case 'MTN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'GLO': return 'bg-green-100 text-green-800 border-green-200';
          case 'AIRTEL': return 'bg-red-100 text-red-800 border-red-200';
          case '9MOBILE': return 'bg-green-900 text-green-100 border-green-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 justify-center md:justify-start">
            <Wifi className="text-indigo-600" /> Data Plan Pricing
        </h1>
        <p className="text-slate-500 mt-2">View available data plans, prices, and product codes for API integration.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Network Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['ALL', 'MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                <button 
                    key={net}
                    onClick={() => setFilterNetwork(net)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                        filterNetwork === net 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {net}
                </button>
            ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search plan name or code..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition relative group">
                
                {/* Badge */}
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getNetworkColor(plan.network)}`}>
                        {plan.network}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{plan.category}</span>
                </div>

                {/* Info */}
                <h3 className="font-bold text-lg text-slate-800 mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{plan.validity} Validity</p>

                {/* Price & Code */}
                <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Price</p>
                        <p className="text-xl font-bold text-slate-900">
                            {Number(plan.price) === 0 ? 'Check Status' : `₦${Number(plan.price).toLocaleString()}`}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Product Code</p>
                        <button 
                            onClick={() => copyToClipboard(plan.productCode)}
                            className="flex items-center gap-1 text-xs font-mono font-medium text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition"
                        >
                            {copiedCode === plan.productCode ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            {plan.productCode}
                        </button>
                    </div>
                </div>

            </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
          <div className="text-center py-20 text-slate-400">
              <p>No plans found matching your criteria.</p>
          </div>
      )}

    </div>
  );
}
