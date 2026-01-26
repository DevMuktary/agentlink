'use client';

import Link from 'next/link';

export default function DocsLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        {/* Background Pattern (Optional subtle grid) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8">
            🚀 AgentHub API v1.0 is Live
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Build Nigeria's Future <br className="hidden sm:block" />
            <span className="text-blue-600">with One Unified API.</span>
          </h1>
          
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            The complete infrastructure for Identity Verification (NIN/BVN), Corporate Registration (CAC), Tax, and Utility payments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/dashboard/developers" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <span>🔑</span> Get API Key
            </Link>
            <Link 
              href="/docs/authentication" 
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 text-slate-700 text-lg font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <span>📚</span> Authentication Guide
            </Link>
          </div>

          {/* Base URL Snippet */}
          <div className="inline-block text-left bg-slate-900 rounded-lg p-4 shadow-xl max-w-full overflow-x-auto">
            <div className="flex items-center gap-4 font-mono text-sm">
              <span className="text-slate-500 select-none">$</span>
              <span className="text-slate-400">Base URL:</span>
              <span className="text-green-400 font-bold">https://agenthub.ng/api</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Services Grid) */}
      <main className="flex-grow bg-slate-50 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* SECTION: IDENTITY */}
          <section>
            <div className="flex items-center gap-4 mb-8">
               <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
               <h2 className="text-3xl font-bold text-slate-900">Identity Services</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* NIN */}
              <ServiceCard 
                href="/docs/nin"
                title="NIN Services"
                description="Comprehensive National Identity Number suite. Includes Verification, Modification, Slip Generation, and IPE Clearance."
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

              {/* BVN */}
              <ServiceCard 
                href="/docs/bvn"
                title="BVN Services"
                description="Bank Verification Number operations. Supports Enrollment, Modification, Retrieval, and NIBSS Linkage."
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

          {/* SECTION: CORPORATE */}
          <section>
            <div className="flex items-center gap-4 mb-8">
               <div className="h-10 w-1 bg-green-600 rounded-full"></div>
               <h2 className="text-3xl font-bold text-slate-900">Corporate & Education</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* CAC */}
              <ServiceCard 
                href="/docs/cac"
                title="CAC Registration"
                description="Register Business Names and Limited Liability Companies."
                endpoints={[
                  { method: 'POST', path: '/corporate/cac' },
                  { method: 'GET', path: '/corporate/cac/status' }
                ]}
              />

              {/* Tax */}
              <ServiceCard 
                href="/docs/tax"
                title="Tax ID (TIN)"
                description="Generate JTB/FIRS Tax Identification Numbers."
                endpoints={[
                  { method: 'POST', path: '/corporate/tax-id' },
                  { method: 'GET', path: '/corporate/tax-id/status' }
                ]}
              />

              {/* JAMB */}
              <ServiceCard 
                href="/docs/jamb"
                title="JAMB Services"
                description="Result Slips, Admission Letters, and Profile Codes."
                endpoints={[
                  { method: 'POST', path: '/education/jamb' },
                  { method: 'GET', path: '/education/jamb/status' }
                ]}
              />
            </div>
          </section>

          {/* SECTION: UTILITIES */}
          <section>
            <div className="flex items-center gap-4 mb-8">
               <div className="h-10 w-1 bg-purple-600 rounded-full"></div>
               <h2 className="text-3xl font-bold text-slate-900">Utilities & System</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Utilities */}
               <ServiceCard 
                href="/docs/utilities"
                title="Utilities"
                description="Airtime and Data Bundles for all networks."
                endpoints={[
                  { method: 'POST', path: '/utilities/airtime' },
                  { method: 'POST', path: '/utilities/data' },
                ]}
              />

              {/* Status */}
              <ServiceCard 
                href="/docs/status"
                title="System Status"
                description="Transaction monitoring and wallet management."
                endpoints={[
                  { method: 'GET', path: '/status' },
                  { method: 'GET', path: '/wallet/balance' },
                ]}
              />
            </div>
          </section>

        </div>
      </main>

      {/* 3. ROBUST FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                  <span className="text-xl font-bold text-slate-900">AgentHub</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Powering the next generation of digital services in Nigeria through a unified, developer-friendly API.
               </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/docs/authentication" className="hover:text-blue-600">Authentication</Link></li>
                <li><Link href="/docs/errors" className="hover:text-blue-600">Error Codes</Link></li>
                <li><Link href="/docs/status" className="hover:text-blue-600">System Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="mailto:dev@agenthub.ng" className="hover:text-blue-600">Contact Support</Link></li>
                <li><Link href="/dashboard/tickets" className="hover:text-blue-600">Open Ticket</Link></li>
                <li><a href="#" className="hover:text-blue-600">API Status Page</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/sla" className="hover:text-blue-600">SLA</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} AgentHub Nigeria. All rights reserved.
            </p>
            <div className="flex gap-6">
               <a href="#" className="text-slate-400 hover:text-slate-600 text-xl">𝕏</a>
               <a href="#" className="text-slate-400 hover:text-slate-600 text-xl">GitHub</a>
               <a href="#" className="text-slate-400 hover:text-slate-600 text-xl">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Service Card Component (Kept consistent)
function ServiceCard({ title, description, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                DOCS &rarr;
            </span>
        </div>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-auto space-y-2">
          {endpoints.map((ep: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 group-hover:bg-blue-50/20 transition-colors">
               <span className={`uppercase font-extrabold text-[10px] w-10 text-center py-0.5 rounded ${ep.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
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
