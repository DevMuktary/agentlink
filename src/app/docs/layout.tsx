'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Helper to check active links
  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- GLOBAL DOCS HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Logo */}
            <Link href="/docs" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">AgentHub <span className="text-blue-600">Docs</span></span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/developers" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
              Get API Key
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-8">
            
            {/* Group 1: Start */}
            <div>
              <h5 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Getting Started</h5>
              <ul className="space-y-1">
                <NavItem href="/docs" active={isActive('/docs')}>Overview</NavItem>
                <NavItem href="/docs/authentication" active={isActive('/docs/authentication')}>Authentication</NavItem>
                <NavItem href="/docs/errors" active={isActive('/docs/errors')}>Errors & Responses</NavItem>
              </ul>
            </div>

            {/* Group 2: Identity */}
            <div>
              <h5 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Identity</h5>
              <ul className="space-y-1">
                <NavItem href="/docs/nin" active={isActive('/docs/nin')}>NIN Services</NavItem>
                <NavItem href="/docs/bvn" active={isActive('/docs/bvn')}>BVN Services</NavItem>
              </ul>
            </div>

            {/* Group 3: Corporate */}
            <div>
              <h5 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate</h5>
              <ul className="space-y-1">
                <NavItem href="/docs/cac" active={isActive('/docs/cac')}>CAC Registration</NavItem>
                <NavItem href="/docs/tax" active={isActive('/docs/tax')}>Tax ID (TIN)</NavItem>
              </ul>
            </div>

             {/* Group 4: Education & Utilities */}
             <div>
              <h5 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Services</h5>
              <ul className="space-y-1">
                <NavItem href="/docs/jamb" active={isActive('/docs/jamb')}>JAMB</NavItem>
                <NavItem href="/docs/utilities" active={isActive('/docs/utilities')}>Utilities (Airtime/Data)</NavItem>
              </ul>
            </div>

            {/* Group 5: System */}
            <div>
              <h5 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</h5>
              <ul className="space-y-1">
                <NavItem href="/docs/status" active={isActive('/docs/status')}>Check Status</NavItem>
                <NavItem href="/docs/wallet" active={isActive('/docs/wallet')}>Wallet & Balance</NavItem>
              </ul>
            </div>

          </nav>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 min-w-0">
           {children}
        </main>

      </div>
    </div>
  );
}

// Helper for Sidebar Links
function NavItem({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <li>
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
    </li>
  );
}
