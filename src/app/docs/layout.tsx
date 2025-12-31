import Link from 'next/link';
import { Book, ShieldCheck, Smartphone, Globe, Home } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      
      {/* Docs Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Globe className="w-6 h-6" />
            <span>AgentLink Docs</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Getting Started</p>
          <NavItem href="/docs" icon={Home} label="Introduction" />
          <NavItem href="/docs/authentication" icon={Book} label="Authentication" />

          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Services</p>
          <NavItem href="/docs/nin" icon={ShieldCheck} label="NIN Services" active />
          <NavItem href="/docs/bvn" icon={Smartphone} label="BVN Services" />
          <NavItem href="/docs/utilities" icon={Globe} label="Utilities" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-5xl mx-auto p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
