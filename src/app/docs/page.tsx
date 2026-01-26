'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/developer" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              Get API Key
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 2. HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            AgentHub <span className="text-blue-600">API Reference</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The unified infrastructure for Identity, Corporate, and Utility services in Nigeria.
            <br/>
            <strong>Base URL:</strong> <code className="bg-slate-200 px-3 py-1 rounded text-sm text-blue-700 font-mono">https://agenthub.ng/api</code>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/developer" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <span>🔑</span> Get Your API Key
            </Link>
            <Link href="/docs/authentication" className="px-8 py-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <span>📚</span> Authentication Guide
            </Link>
          </div>
        </div>

        {/* 3. SERVICES GRID */}
        
        {/* ROW 1: IDENTITY (NIN & BVN) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2">
            <span className="text-2xl">🆔</span>
            Identity Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* NIN Card */}
            <ServiceCard 
              href="/docs/nin"
              title="NIN Services"
              icon="🇳🇬"
              description="Complete NIN suite: Validation, Modification, Slip Generation, Personalization, and IPE Clearance."
              endpoints={[
                { method: 'POST', path: '/v1/identity/nin-validation', label: 'Validate NIN Record' },
                { method: 'POST', path: '/v1/identity/nin-modification', label: 'Modify Name/DOB/Phone' },
                { method: 'POST', path: '/v1/identity/slip', label: 'Generate NIN Slip (Premium/Standard)' },
                { method: 'POST', path: '/v1/identity/vnin-slip', label: 'Generate VNIN Slip' },
                { method: 'POST', path: '/v1/identity/ipe-clearance', label: 'IPE Clearance' },
                { method: 'POST', path: '/v1/identity/nin-personalization', label: 'NIN Personalization' },
                { method: 'POST', path: '/v1/identity/phone-verify', label: 'Search NIN by Phone' },
                { method: 'GET', path: '/v1/identity/*/status', label: 'Check Status for any service above' }
              ]}
            />

            {/* BVN Card */}
            <ServiceCard 
              href="/docs/bvn"
              title="BVN Services"
              icon="🏦"
              description="Bank Verification Number services: Enrollment, Modification, Retrieval, and NIBSS Linking."
              endpoints={[
                { method: 'POST', path: '/bvn/enrollment', label: 'New BVN Enrollment' },
                { method: 'POST', path: '/bvn/modification', label: 'Modify BVN Details' },
                { method: 'POST', path: '/bvn/retrieval', label: 'Retrieve Lost BVN' },
                { method: 'POST', path: '/bvn/vnin-to-nibss', label: 'Link VNIN to NIBSS' },
                { method: 'GET', path: '/bvn/*/status', label: 'Check Status for any service above' }
              ]}
            />
          </div>
        </div>

        {/* ROW 2: CORPORATE & EDUCATION */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2">
            <span className="text-2xl">🏢</span>
            Corporate & Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* CAC Card */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              icon="📜"
              description="Register Business Names and Limited Liability Companies (LLC)."
              endpoints={[
                { method: 'POST', path: '/corporate/cac', label: 'Submit Registration' },
                { method: 'GET', path: '/corporate/cac/status', label: 'Check Status & Certificate' }
              ]}
            />

            {/* Tax ID Card */}
            <ServiceCard 
              href="/docs/tax"
              title="Tax ID (TIN)"
              icon="⚖️"
              description="Generate Personal and Non-Individual Tax Identification Numbers."
              endpoints={[
                { method: 'POST', path: '/corporate/tax-id', label: 'Generate TIN' },
                { method: 'GET', path: '/corporate/tax-id/status', label: 'Download TIN Slip' }
              ]}
            />

            {/* JAMB Card */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              icon="🎓"
              description="Result Slips, Admission Letters, and Profile Code Retrieval."
              endpoints={[
                { method: 'POST', path: '/education/jamb', label: 'Purchase Service' },
                { method: 'GET', path: '/education/jamb/status', label: 'Get Result/Pin' }
              ]}
            />

          </div>
        </div>

        {/* ROW 3: UTILITIES & SYSTEM */}
        <div className="mb-16">
           <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2">
            <span className="text-2xl">⚡</span>
            Utilities & Wallet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Utilities */}
             <ServiceCard 
              href="/docs/utilities"
              title="Utilities"
              icon="💡"
              description="Instant vending for Airtime and Data Bundles."
              endpoints={[
                { method: 'POST', path: '/utilities/airtime', label: 'Purchase Airtime' },
                { method: 'POST', path: '/utilities/data', label: 'Purchase Data Bundle' }
              ]}
            />

            {/* Status & Wallet */}
            <ServiceCard 
              href="/docs/status"
              title="Status & Balance"
              icon="💳"
              description="Monitor wallet balance and check transaction status."
              endpoints={[
                { method: 'GET', path: '/wallet/balance', label: 'Check Wallet Balance' }
              ]}
            />

          </div>
        </div>

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 text-white font-semibold">AgentHub Developer API v1.0</p>
          <p className="text-xs text-slate-500 font-mono">
            System Status: <span className="text-green-400">● Operational</span>
          </p>
          <div className="mt-4">
             <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Return to Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Card Component
function ServiceCard({ title, description, icon, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors border border-slate-100">
            {icon}
          </div>
          <span className="text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            View Docs &rarr;
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-grow">
          {description}
        </p>
        
        {/* Endpoint List */}
        <div className="flex flex-col gap-2 mt-auto">
          {endpoints.map((ep: any, index: number) => (
            <div key={index} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 truncate max-w-[70%]">{ep.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ep.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {ep.method}
                    </span>
                </div>
                <code className="text-xs font-mono text-slate-600 truncate block bg-slate-50 px-1 rounded">
                   {ep.path}
                </code>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
