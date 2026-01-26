'use client';

import Link from 'next/link';

export default function DocsLandingPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* HERO SECTION */}
      <div className="mb-16 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
          AgentHub <span className="text-blue-600">API Reference</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-3xl">
          Welcome to the unified infrastructure for Identity, Corporate, and Utility services in Nigeria. 
          Select a service below to view detailed documentation.
        </p>
        
        <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl shadow-lg">
          <span className="flex items-center gap-2">
            <span className="text-slate-500">Base URL:</span> 
            <span className="text-blue-400 font-bold">https://agenthub.ng/api</span>
          </span>
          <Link href="/dashboard/developers" className="text-slate-900 bg-white px-4 py-2 rounded font-bold hover:bg-slate-200 transition-colors text-xs uppercase tracking-wider">
            Get API Key
          </Link>
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="space-y-16">
      
        {/* IDENTITY SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
             <span className="text-2xl">🆔</span>
             <h2 className="text-2xl font-bold text-slate-900">Identity Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NIN CARD */}
            <ServiceCard 
              href="/docs/nin"
              title="NIN Services"
              description="National Identity Number verification, modification, slips, and clearance."
              endpoints={[
                { method: 'POST', path: '/v1/identity/nin-validation' },
                { method: 'POST', path: '/v1/identity/nin-verify' },
                { method: 'POST', path: '/v1/identity/phone-verify' },
                { method: 'POST', path: '/v1/identity/nin-modification' },
                { method: 'POST', path: '/v1/identity/nin-personalization' },
                { method: 'POST', path: '/v1/identity/slip' },
                { method: 'POST', path: '/v1/identity/vnin-slip' },
                { method: 'POST', path: '/v1/identity/ipe-clearance' },
              ]}
            />

            {/* BVN CARD */}
            <ServiceCard 
              href="/docs/bvn"
              title="BVN Services"
              description="Bank Verification Number enrollment, retrieval, and NIBSS linkage."
              endpoints={[
                { method: 'POST', path: '/bvn/enrollment' },
                { method: 'POST', path: '/bvn/verification' },
                { method: 'POST', path: '/bvn/modification' },
                { method: 'POST', path: '/bvn/retrieval' },
                { method: 'POST', path: '/bvn/vnin-to-nibss' },
                { method: 'POST', path: '/bvn/premium-slip' },
              ]}
            />
          </div>
        </section>

        {/* CORPORATE SECTION */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
             <span className="text-2xl">🏢</span>
             <h2 className="text-2xl font-bold text-slate-900">Corporate & Education</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CAC */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              description="Business Name & Company Registration."
              endpoints={[
                { method: 'POST', path: '/corporate/cac' },
                { method: 'GET', path: '/corporate/cac/status' }
              ]}
            />

            {/* TAX */}
            <ServiceCard 
              href="/docs/tax"
              title="Tax ID (TIN)"
              description="JTB/FIRS Tax Identification Numbers."
              endpoints={[
                { method: 'POST', path: '/corporate/tax-id' },
                { method: 'GET', path: '/corporate/tax-id/status' }
              ]}
            />

            {/* JAMB */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              description="Result Slips, Admission Letters & Caps."
              endpoints={[
                { method: 'POST', path: '/education/jamb' },
                { method: 'GET', path: '/education/jamb/status' }
              ]}
            />

          </div>
        </section>

        {/* UTILITIES SECTION */}
        <section>
           <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
             <span className="text-2xl">⚡</span>
             <h2 className="text-2xl font-bold text-slate-900">Utilities & System</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* UTILITIES */}
             <ServiceCard 
              href="/docs/utilities"
              title="Utilities"
              description="Airtime and Data Bundles."
              endpoints={[
                { method: 'POST', path: '/utilities/airtime' },
                { method: 'POST', path: '/utilities/data' },
              ]}
            />

            {/* STATUS */}
            <ServiceCard 
              href="/docs/status"
              title="System Status"
              description="Transaction status and wallet management."
              endpoints={[
                { method: 'GET', path: '/status' },
                { method: 'GET', path: '/wallet/balance' },
              ]}
            />

          </div>
        </section>
      </div>
    </div>
  );
}

// Component for the Service Cards
function ServiceCard({ title, description, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col">
        
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <span className="text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View Docs &rarr;
            </span>
        </div>
        
        <p className="text-slate-600 text-sm mb-5 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-auto space-y-1">
          {endpoints.map((ep: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-xs font-mono bg-slate-50 px-2.5 py-2 rounded border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
               <span className={`uppercase font-bold text-[10px] w-8 ${ep.method === 'GET' ? 'text-green-600' : 'text-blue-600'}`}>
                 {ep.method}
               </span>
               <span className="text-slate-700 font-medium truncate flex-1">{ep.path}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
