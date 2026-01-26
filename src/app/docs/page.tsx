import Link from 'next/link';
import { ArrowRight, Terminal, Shield, FileText, Zap, Key } from 'lucide-react';

export default function DocsLandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
          <Terminal size={14} /> Developer Documentation
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Build with <span className="text-blue-600">AgentHub</span>
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          The unified infrastructure for Identity Verification (NIN, BVN), Corporate Registration (CAC), and Utilities in Nigeria. 
          <br className="hidden sm:block" />
          Simple, reliable, and developer-friendly.
        </p>

        {/* Base URL Box */}
        <div className="bg-slate-900 text-slate-300 font-mono text-sm rounded-lg px-6 py-4 inline-block mb-8 shadow-xl">
          <span className="text-blue-400 mr-2">$</span>
          https://agenthub.ng/api
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/developer" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            <Key size={18} />
            Get API Key
          </Link>
          <Link 
            href="/docs/authentication" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all hover:border-slate-300"
          >
            <Shield size={18} />
            Read Auth Guide
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200"></div>

      {/* 2. DOCUMENTATION GRID */}
      
      {/* Identity Services */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Shield size={24} /></div>
          Identity Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocCard 
            href="/docs/nin"
            title="NIN Services"
            description="Validate IDs, modify records, generate slips, and process IPE clearance."
            endpoints={[
              '/v1/identity/nin-validation',
              '/v1/identity/nin-modification',
              '/v1/identity/ipe-clearance'
            ]}
          />
          <DocCard 
            href="/docs/bvn"
            title="BVN Services"
            description="Enrollment, modification, phone retrieval, and VNIN-to-NIBSS linkage."
            endpoints={[
              '/bvn/enrollment',
              '/bvn/modification',
              '/bvn/vnin-to-nibss'
            ]}
          />
        </div>
      </div>

      {/* Corporate & Tax */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FileText size={24} /></div>
          Corporate & Tax
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DocCard 
            href="/docs/cac"
            title="CAC Registration"
            description="Register Business Names and Companies (LLC). Upload documents and track status."
            endpoints={['/corporate/cac']}
          />
          <DocCard 
            href="/docs/tax"
            title="Tax ID (TIN)"
            description="Generate Individual and Corporate Tax Identification Numbers."
            endpoints={['/corporate/tax-id']}
          />
          <DocCard 
            href="/docs/jamb"
            title="JAMB Services"
            description="Print Result Slips, Admission Letters, and retrieve Profile Codes."
            endpoints={['/education/jamb']}
          />
        </div>
      </div>

      {/* Utilities */}
      <div className="pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Zap size={24} /></div>
          Utilities & System
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocCard 
            href="/docs/utilities"
            title="Airtime & Data"
            description="Vend airtime and data bundles across all major Nigerian networks."
            endpoints={['/utilities/airtime', '/utilities/data']}
          />
          <DocCard 
            href="/docs/status"
            title="Status & Wallet"
            description="Check the status of async jobs and manage your wallet balance."
            endpoints={['/status?request_id=...', '/wallet/balance']}
          />
        </div>
      </div>

    </div>
  );
}

// Reusable Card Component
function DocCard({ title, description, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
        
        <p className="text-slate-600 text-sm mb-5 line-clamp-2">
          {description}
        </p>
        
        <div className="space-y-2">
          {endpoints.map((ep: string) => (
            <div key={ep} className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
              <span className="text-blue-600 font-bold">POST</span>
              <span className="truncate">{ep}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
