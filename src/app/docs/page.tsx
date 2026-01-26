'use client';

import Link from 'next/link';

export default function DocsLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-600 items-center">
            <Link href="/dashboard" className="hidden sm:block hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/dashboard/developers" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              Get API Key
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            AgentHub <span className="text-blue-600">API Reference</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The unified infrastructure for Identity, Corporate, and Utility services in Nigeria.
            <br/>
            <strong>Base URL:</strong> <code className="bg-slate-200 px-3 py-1 rounded text-sm text-blue-700 font-mono break-all">https://agenthub.ng/api</code>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard/developers" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <span>🔑</span> Get API Key
            </Link>
            <Link href="/docs/authentication" className="px-8 py-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <span>📚</span> Read Guide
            </Link>
          </div>
        </div>

        {/* SERVICES GRID */}
        
        {/* IDENTITY */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Identity Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* NIN */}
            <ServiceCard 
              href="/docs/nin"
              title="NIN Services"
              icon="🆔"
              description="NIN Validation, Modification, Slip Generation, and IPE Clearance."
              endpoints={[
                { method: 'POST', path: '/v1/identity/nin-validation' },
                { method: 'POST', path: '/v1/identity/nin-modification' },
                { method: 'POST', path: '/v1/identity/slip' },
                { method: 'POST', path: '/v1/identity/ipe-clearance' },
                { method: 'POST', path: '/v1/identity/nin-personalization' },
                { method: 'POST', path: '/v1/identity/phone-verify' },
                { method: 'POST', path: '/v1/identity/nin-verify' },
                { method: 'POST', path: '/v1/identity/vnin-slip' }
              ]}
            />

            {/* BVN */}
            <ServiceCard 
              href="/docs/bvn"
              title="BVN Services"
              icon="🏦"
              description="BVN User Enrollment, Modification, Retrieval, and NIBSS linkage."
              endpoints={[
                { method: 'POST', path: '/bvn/enrollment' },
                { method: 'POST', path: '/bvn/modification' },
                { method: 'POST', path: '/bvn/retrieval' },
                { method: 'POST', path: '/bvn/vnin-to-nibss' }
                { method: 'POST', path: '/bvn/premium-slip' },
                { method: 'POST', path: '/bvn/verification' }
              ]}
            />
          </div>
        </div>

        {/* CORPORATE */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Corporate & Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* CAC */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              icon="🏢"
              description="Register Businesses and LLCs."
              endpoints={[
                { method: 'POST', path: '/corporate/cac' },
                { method: 'GET', path: '/corporate/cac/status' }
              ]}
            />

            {/* Tax */}
            <ServiceCard 
              href="/docs/tax"
              title="Tax ID (TIN)"
              icon="📄"
              description="Generate Individual & Corporate TIN."
              endpoints={[
                { method: 'POST', path: '/corporate/tax-id' },
                { method: 'GET', path: '/corporate/tax-id/status' }
              ]}
            />

            {/* JAMB */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              icon="🎓"
              description="Result Slips & Admission Letters."
              endpoints={[
                { method: 'POST', path: '/education/jamb' },
                { method: 'GET', path: '/education/jamb/status' }
              ]}
            />

          </div>
        </div>

        {/* UTILITIES */}
        <div className="mb-16">
           <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Utilities & System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Utilities */}
             <ServiceCard 
              href="/docs/utilities"
              title="Utilities"
              icon="⚡"
              description="Airtime and Data Bundles."
              endpoints={[
                { method: 'POST', path: '/utilities/airtime' },
                { method: 'POST', path: '/utilities/data' },
              ]}
            />

            {/* Status */}
            <ServiceCard 
              href="/docs/status"
              title="Status & Balance"
              icon="💳"
              description="Check Balance and Transaction Status."
              endpoints={[
                { method: 'GET', path: '/wallet/balance' },
                { method: 'GET', path: '/status' },
                { method: '...', path: 'and more' }
              ]}
            />

          </div>
        </div>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 text-white font-semibold">AgentHub Developer API v1.0</p>
          <div className="mt-4">
             <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Return to Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, description, icon, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl group-hover:bg-blue-50 transition-colors border border-slate-100">
            {icon}
          </div>
          <span className="text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Docs &rarr;
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed flex-grow">
          {description}
        </p>
        
        <div className="flex flex-col gap-2 mt-auto">
          {endpoints.map((ep: any, index: number) => (
            <div key={index} className="flex flex-col gap-1 border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                     <code className="text-[10px] font-mono text-slate-600 truncate bg-slate-50 px-1 rounded w-full">
                       {ep.path}
                    </code>
                    {ep.method && (
                        <span className={`text-[9px] font-bold px-1 rounded ml-2 ${ep.method === 'GET' ? 'bg-green-100 text-green-700' : ep.method === 'POST' ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>
                            {ep.method}
                        </span>
                    )}
                </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
