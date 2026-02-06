'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import axios from 'axios'; // Added axios
import { 
  LayoutDashboard, Users, CreditCard, Settings, Menu, X, LogOut,
  ShieldAlert, UserCheck, FileText, Smartphone, Search, UserPlus,
  Building2, GraduationCap, Briefcase, RefreshCcw, Layers
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  {
    category: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
      { name: "Registration Requests", href: "/admin/users/requests", icon: UserPlus},
    ]
  },
  {
    category: "Queue: Identity (NIN)",
    items: [
      { name: "NIN Modifications", href: "/admin/requests/nin/modification", icon: FileText },
      { name: "NIN Validation", href: "/admin/requests/nin/validation", icon: UserCheck },
    ]
  },
  {
    category: "Queue: Banking (BVN)",
    items: [
      { name: "BVN Enrollments", href: "/admin/requests/bvn/enrollment", icon: Smartphone },
      { name: "BVN Modifications", href: "/admin/requests/bvn/modification", icon: FileText },
      { name: "BVN Retrievals", href: "/admin/requests/bvn/retrieval", icon: Search },
      { name: "VNIN to NIBSS", href: "/admin/requests/bvn/vnin-nibss", icon: RefreshCcw },
    ]
  },
  {
    category: "Queue: Corporate",
    items: [
      { name: "CAC Registrations", href: "/admin/requests/corporate/cac", icon: Building2 },
      { name: "Tax ID Requests", href: "/admin/requests/corporate/tax", icon: Briefcase },
    ]
  },
  {
    category: "Queue: Education",
    items: [
      { name: "JAMB Services", href: "/admin/requests/education/jamb", icon: GraduationCap },
    ]
  },
  {
    category: "System",
    items: [
      { name: "Service Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Call the API to clear the cookie
      await axios.post('/api/auth/logout');
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      // Force redirect even if API fails
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-slate-900 border-b border-slate-800 z-[60] px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold text-lg text-white tracking-tight">Admin Console</span>
        </div>
        
        {/* Admin Badge */}
        <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded uppercase tracking-wider">
           Super Admin
        </div>
      </div>

      {/* SIDEBAR DRAWER */}
      <aside className={`fixed top-0 left-0 z-[50] h-screen w-64 bg-slate-950 text-slate-300 border-r border-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 lg:pt-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-slate-900 bg-slate-950 sticky top-0 z-10">
            <h1 className="text-xl font-bold tracking-wider text-white">Admin<span className="text-red-500">Panel</span></h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-8">
            {menuItems.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{section.category}</h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setIsOpen(false)} 
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <item.icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-900 bg-slate-950">
            <Link 
              href="/dashboard"
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors mb-2"
            >
              <Layers className="mr-3 h-4 w-4" /> Switch to User View
            </Link>
            <button 
              onClick={handleLogout} // Hooked up logic here
              disabled={isLoggingOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
            >
              <LogOut className="mr-3 h-4 w-4" /> 
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[45] lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
