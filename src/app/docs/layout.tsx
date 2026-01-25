import React from 'react';
import Link from 'next/link';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-700">AGENTHUB <span className="text-xs text-gray-500">Docs</span></h1>
        </div>
        <nav className="px-4 pb-10 space-y-8">
          
          {/* Section: Getting Started */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Getting Started</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs">Introduction</NavLink></li>
              <li><NavLink href="/docs/authentication">Authentication</NavLink></li>
              <li><NavLink href="/docs/errors">Error Codes</NavLink></li>
            </ul>
          </div>

          {/* Section: Identity */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Identity Services</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/nin">NIN Services</NavLink></li>
              <li><NavLink href="/docs/bvn">BVN Services</NavLink></li>
              <li><NavLink href="/docs/vnin">VNIN Services</NavLink></li>
              <li><NavLink href="/docs/ipe">IPE Clearance</NavLink></li>
            </ul>
          </div>

          {/* Section: Corporate */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Corporate</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/cac">CAC Registration</NavLink></li>
              <li><NavLink href="/docs/tax">Tax / TIN</NavLink></li>
            </ul>
          </div>

          {/* Section: Utilities & Edu */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Utilities & Edu</h3>
            <ul className="space-y-1">
              <li><NavLink href="/docs/utilities">Airtime & Data</NavLink></li>
              <li><NavLink href="/docs/education">Education (JAMB)</NavLink></li>
            </ul>
          </div>

        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Simple Helper Component for Links
function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors">
      {children}
    </Link>
  );
}
