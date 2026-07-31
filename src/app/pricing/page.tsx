'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, Search, Fingerprint, Landmark, Building2, 
  GraduationCap, Wifi, ChevronLeft, Zap, Info, AlertTriangle 
} from 'lucide-react';
import GlobalLoader from '@/components/GlobalLoader';

export default function PricingPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('IDENTITY');
  const [dataSearch, setDataSearch] = useState('');

  useEffect(() => {
    fetch('/api/pricing', { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if(res.status) {
            setServices(res.data.services);
            setDataPlans(res.data.dataPlans);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <GlobalLoader />;

  // Group Services
  const categories: any = {
    IDENTITY: services.filter(s => s.code.startsWith('NIN_') || s.code.includes('VNIN') || s.code.includes('IPE')),
    BANKING: services.filter(s => 
      (s.code.includes('BVN') || s.code.startsWith('BANK_')) && 
      !s.code.startsWith('BANK_') 
    ),
    CORPORATE: services.filter(s => s.code.includes('CAC') || s.code.includes('TAX')),
    EDUCATION: services.filter(s => s.code.includes('JAMB') || s.code.includes('EXAM') || s.code.includes('WAEC')),
    UTILITIES: services.filter(s => s.code.includes('AIRTIME') || s.code.includes('ELECTRICITY') || s.code.includes('CABLE')),
  };

  const filteredDataPlans = dataPlans.filter(plan => 
    plan.name.toLowerCase().includes(dataSearch.toLowerCase()) || 
    plan.network.includes(dataSearch.toUpperCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* COMPACT HEADER */}
      <div className="bg-slate-900 text-white pt-10 pb-16 px-4 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-5xl mx-auto relative z-10">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs sm:text-sm font-semibold mb-6 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">API Pricing</h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl">
                Transparent API integration rates for high-volume agents.
            </p>
        </div>
        {/* Subtle background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* HORIZONTAL SCROLLABLE TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex gap-1 mb-6 overflow-x-auto custom-scrollbar">
            <TabButton active={activeTab === 'IDENTITY'} onClick={() => setActiveTab('IDENTITY')} icon={<Fingerprint size={16} />} label="Identity" />
            <TabButton active={activeTab === 'BANKING'} onClick={() => setActiveTab('BANKING')} icon={<Landmark size={16} />} label="Banking" />
            <TabButton active={activeTab === 'CORPORATE'} onClick={() => setActiveTab('CORPORATE')} icon={<Building2 size={16} />} label="Corporate" />
            <TabButton active={activeTab === 'EDUCATION'} onClick={() => setActiveTab('EDUCATION')} icon={<GraduationCap size={16} />} label="Education" />
            <TabButton active={activeTab === 'UTILITIES'} onClick={() => setActiveTab('UTILITIES')} icon={<Zap size={16} />} label="Utilities" />
            <TabButton active={activeTab === 'DATA'} onClick={() => setActiveTab('DATA')} icon={<Wifi size={16} />} label="Data Plans" />
        </div>

        {/* BANKING SURCHARGE NOTICE */}
        {activeTab === 'BANKING' && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                    <h4 className="font-bold text-amber-900 text-xs sm:text-sm">Variable Pricing Notice</h4>
                    <p className="text-amber-700 text-[11px] sm:text-xs mt-1 leading-relaxed">
                        Prices for <strong>BVN Modifications</strong> vary by bank. Premium banks (e.g., First Bank, GTB) attract an additional surcharge automatically applied via API.
                    </p>
                </div>
            </div>
        )}

        {/* CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* GENERAL SERVICES GRID */}
            {activeTab !== 'DATA' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories[activeTab]?.length > 0 ? (
                        categories[activeTab].map((service: any) => {
                            const isBvnModification = 
                                service.code.includes('BVN') && 
                                (service.code.includes('MOD') || service.code.includes('MODIFICATION'));
                            
                            return (
                                <PricingCard 
                                    key={service.id} 
                                    service={service} 
                                    hasSurcharge={isBvnModification} 
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-sm font-medium">No services found in this category.</p>
                        </div>
                    )}
                </div>
            )}

            {/* DATA PLANS COMPACT TABLE */}
            {activeTab === 'DATA' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Data API Pricing</h3>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search network or plan..." 
                                value={dataSearch}
                                onChange={(e) => setDataSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Network</th>
                                    <th className="px-4 py-3">Plan Name</th>
                                    <th className="px-4 py-3">Validity</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">API Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {filteredDataPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No data plans found.</td>
                                    </tr>
                                ) : (
                                    filteredDataPlans.map((plan) => {
                                        // Force apiPrice specifically
                                        const apiPrice = Number(plan.apiPrice || plan.price || 0);
                                        return (
                                            <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3"><NetworkBadge network={plan.network} /></td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">{plan.name}</td>
                                                <td className="px-4 py-3 text-slate-500">{plan.validity || '30 Days'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                        {plan.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                    ₦{apiPrice.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                active 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function PricingCard({ service, hasSurcharge }: { service: any, hasSurcharge: boolean }) {
    // Explicitly target apiPrice
    const apiPrice = Number(service.apiPrice || service.price || 0);

    return (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative flex flex-col h-full">
            
            <div className="flex justify-between items-start mb-3">
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <CheckCircle2 size={16} />
                </div>
                <div className="text-right">
                    <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {service.code.includes('AIRTIME') ? (
                            <span>{100 - apiPrice}% OFF</span>
                        ) : (
                            <>
                                {hasSurcharge && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-1">From</span>}
                                ₦{apiPrice.toLocaleString()}
                            </>
                        )}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Per Request</p>
                </div>
            </div>
            
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 leading-snug">{service.name}</h3>
            
            {hasSurcharge && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-amber-700 bg-amber-50 border border-amber-100 text-[9px] font-bold uppercase tracking-wider mb-2 w-fit">
                    <Info size={10} /> Bank Fees Apply
                </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed flex-grow">
                {service.description || 'Instant processing via API integration.'}
            </p>
            
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-semibold text-slate-400">
                <span>Code: {service.serviceCode || 'N/A'}</span>
                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider">Active</span>
            </div>
        </div>
    );
}

function NetworkBadge({ network }: { network: string }) {
    const styles: any = {
        MTN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        GLO: 'bg-green-100 text-green-800 border-green-200',
        AIRTEL: 'bg-red-100 text-red-800 border-red-200',
        '9MOBILE': 'bg-emerald-900 text-emerald-100 border-emerald-800',
    };
    return (
        <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase border w-fit ${styles[network] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {network}
        </span>
    );
}
