'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon, 
  KeyIcon, 
  CommandLineIcon, 
  ShieldCheckIcon, 
  BuildingLibraryIcon, 
  AcademicCapIcon, 
  BoltIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline';

export default function DocsLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. MOBILE HEADER (Visible only on small screens) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <span className="font-bold text-lg text-slate-800">AgentHub Docs</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6"/> : <Bars3Icon className="w-6 h-6"/>}
        </button>
      </div>

      {/* 2. LAYOUT WRAPPER */}
      <div className="flex max-w-7xl mx-auto">

        {/* SIDEBAR NAVIGATION (Desktop: Sticky, Mobile: Toggle) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center gap-2 mb-8 px-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">AH</div>
               <span className="font-bold text-xl text-slate-900">AgentHub</span>
            </div>

            <nav className="space-y-1">
              <SidebarLink href="/docs" active>Overview</SidebarLink>
              <SidebarLink href="/docs/authentication">Authentication</SidebarLink>
              <SidebarLink href="/docs/errors">Errors & Status</SidebarLink>
              
              <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Services</div>
              <SidebarLink href="/docs/nin">Identity (NIN)</SidebarLink>
              <SidebarLink href="/docs/bvn">Banking (BVN)</SidebarLink>
              <SidebarLink href="/docs/cac">Corporate (CAC)</SidebarLink>
              <SidebarLink href="/docs/tax">Tax & Compliance</SidebarLink>
              <SidebarLink href="/docs/jamb">Education (JAMB)</SidebarLink>
              <SidebarLink href="/docs/utilities">Utilities & Bills</SidebarLink>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/dashboard/developer" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                <KeyIcon className="w-4 h-4" />
                Get API Keys
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12">
          
          {/* HERO */}
          <div className="max-w-4xl mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
              AgentHub <span className="text-blue-600">Developer API</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Seamlessly integrate Identity Verification, Corporate Registration, and Utility payments into your platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
               {/* Base URL Badge */}
               <div className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-sm">
                  <span className="text-green-400 font-bold">POST</span>
                  <span>https://agenthub.ng/api/v1/...</span>
               </div>

               {/* Get API Key Button */}
               <Link href="/dashboard/developer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                  <KeyIcon className="w-5 h-5" />
                  Get Your API Key
               </Link>
            </div>
          </div>

          {/* DOCUMENTATION GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">

            {/* 1. IDENTITY SERVICES (NIN) */}
            <DocCard 
              title="Identity Services (NIN)" 
              icon={<ShieldCheckIcon className="w-6 h-6"/>}
              color="text-blue-600"
              href="/docs/nin"
              description="Verify identities, modify records, and generate official slips."
            >
              <Endpoint method="POST" path="/v1/identity/nin-verify" desc="Search by NIN (Standard/Premium)" />
              <Endpoint method="POST" path="/v1/identity/phone-verify" desc="Search by Phone Number" />
              <Endpoint method="POST" path="/v1/identity/slip" desc="Generate Official NIN Slip PDF" />
              <Endpoint method="POST" path="/v1/identity/nin-modification" desc="Modify Name, DOB, Phone, etc." />
              <Endpoint method="POST" path="/v1/identity/nin-validation" desc="Validate existing NIN data" />
              <Endpoint method="POST" path="/v1/identity/ipe-clearance" desc="NIN IPE Clearance Service" />
              <Endpoint method="POST" path="/v1/identity/nin-personalization" desc="Advanced Personalization" />
            </DocCard>

            {/* 2. BANKING SERVICES (BVN) */}
            <DocCard 
              title="Banking Services (BVN)" 
              icon={<CreditCardIcon className="w-6 h-6"/>}
              color="text-indigo-600"
              href="/docs/bvn"
              description="Complete BVN management suite for enrollment and verification."
            >
              <Endpoint method="POST" path="/bvn/enrollment" desc="New BVN Enrollment" />
              <Endpoint method="POST" path="/bvn/modification" desc="Modify BVN Details" />
              <Endpoint method="POST" path="/bvn/retrieval" desc="Retrieve Lost BVN" />
              <Endpoint method="POST" path="/bvn/vnin-to-nibss" desc="Link VNIN to NIBSS" />
            </DocCard>

            {/* 3. CORPORATE SERVICES */}
            <DocCard 
              title="Corporate Services" 
              icon={<BuildingLibraryIcon className="w-6 h-6"/>}
              color="text-green-600"
              href="/docs/cac"
              description="Register businesses and handle tax compliance."
            >
              <Endpoint method="POST" path="/corporate/cac" desc="CAC Registration (Business/Company)" />
              <Endpoint method="GET" path="/corporate/cac/status" desc="Check Registration Status" />
              <Endpoint method="POST" path="/corporate/tax-id" desc="Generate Tax ID (TIN)" />
            </DocCard>

            {/* 4. EDUCATION & UTILITIES */}
            <DocCard 
              title="Education & Utilities" 
              icon={<AcademicCapIcon className="w-6 h-6"/>}
              color="text-purple-600"
              href="/docs/jamb"
              description="JAMB services and daily utility bill payments."
            >
              <Endpoint method="POST" path="/education/jamb" desc="Result Slips & Admission Letters" />
              <Endpoint method="POST" path="/utilities/airtime" desc="Purchase Airtime (VTU)" />
              <Endpoint method="POST" path="/utilities/data" desc="Purchase Data Bundles" />
            </DocCard>

          </div>

        </main>
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function SidebarLink({ href, children, active = false }: { href: string, children: React.ReactNode, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

function DocCard({ title, icon, color, href, description, children }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>{icon}</div>
          <Link href={href} className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Docs &rarr;
          </Link>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="bg-slate-50/50 p-4 space-y-1">
        {children}
      </div>
    </div>
  );
}

function Endpoint({ method, path, desc }: { method: string, path: string, desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-white hover:shadow-sm transition-all text-xs font-mono">
      <span className={`px-2 py-0.5 rounded font-bold ${
        method === 'POST' ? 'bg-blue-100 text-blue-700' :
        method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {method}
      </span>
      <span className="text-slate-700 truncate font-medium flex-1">{path}</span>
      <span className="text-slate-400 hidden sm:inline-block">{desc}</span>
    </div>
  );
}
