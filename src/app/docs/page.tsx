import Link from 'next/link';

export default function DocsLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 2. HERO */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            AgentHub <span className="text-blue-600">API Reference</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            The unified infrastructure for Identity, Corporate, and Utility services in Nigeria.
            <br/>
            <strong>Base URL:</strong> <code className="bg-slate-200 px-2 py-1 rounded text-sm">https://api.agenthub.com/api</code>
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/docs/authentication" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Authentication Guide
            </Link>
          </div>
        </div>

        {/* 3. SERVICES GRID */}
        
        {/* ROW 1: IDENTITY (NIN & BVN) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
            Identity Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* NIN Card */}
            <ServiceCard 
              href="/docs/nin"
              title="NIN Services"
              icon="🆔"
              description="Comprehensive NIN management including Validation, Modification, Slip Generation, and IPE Clearance."
              endpoints={[
                '/v1/identity/nin-validation',
                '/v1/identity/nin-modification',
                '/v1/identity/slip',
                '/v1/identity/ipe-clearance',
                '/v1/identity/nin-personalization'
              ]}
            />

            {/* BVN Card */}
            <ServiceCard 
              href="/docs/bvn"
              title="BVN Services"
              icon="🏦"
              description="Enrollment, Modification, and Retrieval services for Bank Verification Numbers."
              endpoints={[
                '/bvn/enrollment',
                '/bvn/modification',
                '/bvn/retrieval',
                '/bvn/vnin-to-nibss'
              ]}
            />
          </div>
        </div>

        {/* ROW 2: CORPORATE & EDUCATION */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-green-600 rounded-full block"></span>
            Corporate & Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* CAC Card */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              icon="🏢"
              description="Register Business Names and Limited Liability Companies."
              endpoints={['/corporate/cac']}
            />

            {/* Tax ID Card */}
            <ServiceCard 
              href="/docs/tax"
              title="Tax ID (TIN)"
              icon="📄"
              description="Generate Personal and Non-Individual Tax Identification Numbers."
              endpoints={['/corporate/tax-id']}
            />

            {/* JAMB Card */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              icon="🎓"
              description="Result slips, Admission letters, and Profile Code retrieval."
              endpoints={['/education/jamb']}
            />

          </div>
        </div>

        {/* ROW 3: UTILITIES & SYSTEM */}
        <div className="mb-16">
           <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-purple-600 rounded-full block"></span>
            Utilities & System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Utilities */}
             <ServiceCard 
              href="/docs/utilities"
              title="Utilities"
              icon="⚡"
              description="Airtime, Data, and Bill Payments."
              endpoints={['/utilities/airtime', '/utilities/data']}
            />

            {/* Status & Wallet */}
            <ServiceCard 
              href="/docs/status"
              title="Status & Wallet"
              icon="📡"
              description="Check job status and wallet balance."
              endpoints={['/status?request_id=...', '/wallet/balance']}
            />

          </div>
        </div>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 text-white font-semibold">AgentHub Developer API</p>
          <p className="text-xs text-slate-500 font-mono">
            System Status: <span className="text-green-400">● Operational</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Reusable Card Component
function ServiceCard({ title, description, icon, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">
            {icon}
          </div>
          <span className="text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            View Docs &rarr;
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        
        {/* Endpoint List */}
        <div className="flex flex-col gap-2">
          {endpoints.map((ep: string) => (
            <code key={ep} className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
              POST {ep}
            </code>
          ))}
        </div>
      </div>
    </Link>
  );
}
