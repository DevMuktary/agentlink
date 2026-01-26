'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. NAVBAR / HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {/* Hamburger Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600 items-center">
            <Link href="/docs/authentication" className="hover:text-blue-600 transition-colors">Authentication</Link>
            <Link href="/docs/errors" className="hover:text-blue-600 transition-colors">Errors</Link>
            <Link href="/dashboard/developers" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all">
              Get API Key
            </Link>
          </nav>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
            <Link href="/docs/authentication" className="block text-slate-600 py-2">Authentication</Link>
            <Link href="/docs/errors" className="block text-slate-600 py-2">Errors</Link>
            <Link href="/dashboard/developers" className="block w-full text-center px-4 py-2 bg-slate-900 text-white rounded-lg">
              Get API Key
            </Link>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 2. HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
            Developer Documentation v1.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            Build with <span className="text-blue-600">AgentHub</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The unified API infrastructure for Identity, Corporate, and Utility services in Nigeria.
            <br className="hidden sm:block" />
            Designed for speed, reliability, and ease of use.
          </p>

          {/* Base URL Box */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm inline-flex items-center gap-3 shadow-xl mb-8">
            <span className="text-green-400">$</span>
            <span>Base URL:</span>
            <code className="text-white font-bold">https://agenthub.ng/api</code>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard/developers" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Get Your API Key
            </Link>
            <Link href="/docs/authentication" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all">
              Read the Guide
            </Link>
          </div>
        </div>

        {/* 3. SERVICES GRID */}
        
        {/* ROW 1: IDENTITY (NIN) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">🆔</div>
            NIN Identity Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            
            {/* NIN Validation & Search */}
            <ServiceCard 
              href="/docs/nin"
              title="Verification & Search"
              description="Verify identities using NIN, Phone Number, or Demographic data."
              endpoints={[
                { method: 'POST', path: '/v1/identity/nin-verify' },
                { method: 'POST', path: '/v1/identity/phone-verify' },
                { method: 'POST', path: '/v1/identity/nin-validation' }
              ]}
            />

            {/* NIN Slips & Management */}
            <ServiceCard 
              href="/docs/nin"
              title="Slips & Management"
              description="Generate Premium/Standard slips, modify data, and clear IPE issues."
              endpoints={[
                { method: 'POST', path: '/v1/identity/slip' },
                { method: 'POST', path: '/v1/identity/nin-modification' },
                { method: 'POST', path: '/v1/identity/ipe-clearance' },
                { method: 'POST', path: '/v1/identity/nin-personalization' }
              ]}
            />
          </div>
        </div>

        {/* ROW 2: BVN SERVICES */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">🏦</div>
            BVN Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ServiceCard 
              href="/docs/bvn"
              title="Enrollment & Mod"
              description="Enroll new BVNs or Modify existing BVN details (Name, DOB, etc)."
              endpoints={[
                { method: 'POST', path: '/bvn/enrollment' },
                { method: 'POST', path: '/bvn/modification' }
              ]}
            />
            <ServiceCard 
              href="/docs/bvn"
              title="Search & Linkage"
              description="Retrieve BVN details and Link VNIN to NIBSS."
              endpoints={[
                { method: 'POST', path: '/bvn/verify' },
                { method: 'POST', path: '/bvn/retrieval' },
                { method: 'POST', path: '/bvn/vnin-to-nibss' }
              ]}
            />
          </div>
        </div>

        {/* ROW 3: CORPORATE & OTHERS */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">🏢</div>
            Corporate & Utilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* CAC */}
            <ServiceCard 
              href="/docs/cac"
              title="CAC Registration"
              description="Register BN and LLC entities."
              endpoints={[
                { method: 'POST', path: '/corporate/cac' },
                { method: 'GET', path: '/corporate/cac/status' }
              ]}
            />

            {/* JAMB */}
            <ServiceCard 
              href="/docs/jamb"
              title="JAMB Services"
              description="Result slips & Admission letters."
              endpoints={[
                { method: 'POST', path: '/education/jamb' },
                { method: 'GET', path: '/education/jamb/status' }
              ]}
            />

            {/* UTILITIES */}
            <ServiceCard 
              href="/docs/utilities"
              title="Airtime & Data"
              description="VTU services for all networks."
              endpoints={[
                { method: 'POST', path: '/utilities/airtime' },
                { method: 'POST', path: '/utilities/data' }
              ]}
            />

          </div>
        </div>

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-white font-bold text-lg">AgentHub</p>
            <p className="text-sm">Powering Digital Identity in Nigeria.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Card Component with Methods
function ServiceCard({ title, description, href, endpoints }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200">
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </div>
        
        <p className="text-slate-600 text-sm mb-5 leading-relaxed">
          {description}
        </p>
        
        {/* Endpoint List */}
        <div className="flex flex-col gap-2">
          {endpoints.map((ep: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {ep.method}
              </span>
              <code className="text-xs font-mono text-slate-600 truncate" title={ep.path}>
                {ep.path}
              </code>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
