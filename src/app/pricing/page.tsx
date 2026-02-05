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
    fetch('/api/pricing')
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
    
    // Hide individual "Bank: XXX" items, keep only the main services
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
      
      {/* HEADER */}
      <div className="bg-[#0B1120] text-white py-16 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Service Pricing</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Transparent rates for high-volume agents.
            </p>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* TABS */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-2 flex flex-wrap justify-center gap-2 mb-8 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'IDENTITY'} onClick={() => setActiveTab('IDENTITY')} icon={<Fingerprint size={18} />} label="Identity" />
            <TabButton active={activeTab === 'BANKING'} onClick={() => setActiveTab('BANKING')} icon={<Landmark size={18} />} label="Banking" />
            <TabButton active={activeTab === 'CORPORATE'} onClick={() => setActiveTab('CORPORATE')} icon={<Building2 size={18} />} label="Corporate" />
            <TabButton active={activeTab === 'EDUCATION'} onClick={() => setActiveTab('EDUCATION')} icon={<GraduationCap size={18} />} label="Education" />
            <TabButton active={activeTab === 'UTILITIES'} onClick={() => setActiveTab('UTILITIES')} icon={<Zap size={18} />} label="Utilities" />
            <TabButton active={activeTab === 'DATA'} onClick={() => setActiveTab('DATA')} icon={<Wifi size={18} />} label="Data Plans" />
        </div>

        {/* BANKING SURCHARGE NOTICE */}
        {activeTab === 'BANKING' && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Variable Pricing Notice</h4>
                    <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                        Prices for BVN Modifications may vary depending on the target bank selected. 
                        Premium banks (e.g., First Bank, GTB) may attract an additional surcharge automatically applied at checkout.
                    </p>
                </div>
            </div>
        )}

        {/* CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* GENERAL SERVICES GRID */}
            {activeTab !== 'DATA' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories[activeTab]?.length > 0 ? (
                        categories[activeTab].map((service: any) => (
                            <PricingCard 
                                key={service.id} 
                                service={service} 
                                isBanking={activeTab === 'BANKING'} 
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <p>No services found in this category.</p>
                        </div>
                    )}
                </div>
            )}

            {/* DATA PLANS TABLE (Unchanged) */}
            {activeTab === 'DATA' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Data Bundles</h3>
                            <p className="text-slate-500 text-sm">SME, Corporate & Gifting Plans</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search network or plan..." 
                                value={dataSearch}
                                onChange={(e) => setDataSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Network</th>
                                    <th className="px-6 py-3">Plan Name</th>
                                    <th className="px-6 py-3">Validity</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDataPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4"><NetworkBadge network={plan.network} /></td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{plan.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{plan.validity || '30 Days'}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {plan.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            ₦{Number(plan.price).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active 
                ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function PricingCard({ service, isBanking }: { service: any, isBanking: boolean }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-1 group relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <CheckCircle2 size={20} />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                        {service.code.includes('AIRTIME') ? (
                            <span className="text-lg">{100 - Number(service.price)}% OFF</span>
                        ) : (
                            // LOGIC: If banking, show "From X", else show exact price
                            <>
                                {isBanking && <span className="text-xs text-slate-400 font-normal mr-1">From</span>}
                                ₦{Number(service.price).toLocaleString()}
                            </>
                        )}
                    </p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Per Request</p>
                </div>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg mb-2 relative z-10">{service.name}</h3>
            
            {/* Banking Surcharge Warning Tag */}
            {isBanking && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wide mb-3 relative z-10">
                    <Info size={12} /> Bank Fees Apply
                </div>
            )}

            <p className="text-sm text-slate-500 leading-relaxed mb-4 relative z-10">
                {service.description || 'Instant processing available via API and Dashboard.'}
            </p>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
                <span>Code: {service.serviceCode || 'N/A'}</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-sans font-medium">Active</span>
            </div>

            {/* Subtle Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
}

function NetworkBadge({ network }: { network: string }) {
    const styles: any = {
        MTN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        GLO: 'bg-green-100 text-green-800 border-green-200',
        AIRTEL: 'bg-red-100 text-red-800 border-red-200',
        '9MOBILE': 'bg-green-900 text-green-100 border-green-800',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded border w-fit ${styles[network] || 'bg-gray-100'}`}>
            {network}
        </span>
    );
}
