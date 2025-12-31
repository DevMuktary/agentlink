'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Book, ShieldCheck, Smartphone, Globe, Home, Menu, X, 
  Zap, Server, Lock 
} from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
        <span className="font-bold text-lg text-blue-600">AgentLink API</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 dark:bg-black border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 hidden md:block">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Server className="w-6 h-6" />
            <span>AgentLink Docs</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Overview</p>
          <NavItem href="/docs" icon={Home} label="Introduction" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/docs/authentication" icon={Lock} label="Authentication" onClick={() => setSidebarOpen(false)} />

          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Identity API</p>
          <NavItem href="/docs/nin" icon={ShieldCheck} label="NIN Services" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/docs/bvn" icon={Smartphone} label="BVN Services" onClick={() => setSidebarOpen(false)} />
          
          <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Utilities & Corp</p>
          <NavItem href="/docs/utilities" icon={Zap} label="Airtime & Data" onClick={() => setSidebarOpen(false)} />
          <NavItem href="/docs/corporate" icon={Globe} label="Corporate (CAC)" onClick={() => setSidebarOpen(false)} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto h-screen scroll-smooth p-6 md:p-12">
        {children}
      </main>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

function NavItem({ href, icon: Icon, label, onClick }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
