'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  LayoutDashboard, Wallet, Code2, LogOut, Menu, X,
  ShieldCheck, UserCheck, 
  Wifi, Building2, GraduationCap, Users, FileCog, 
  Smartphone, Search, FileBadge, CreditCard,
  RefreshCcw, FileText, History
} from 'lucide-react';
import { useState } from 'react';

// --- MENU DEFINITION ---
const menuItems = [
  {
    category: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Wallet & Finance", href: "/dashboard/wallet", icon: Wallet },
      { name: "Services History", href: "/dashboard/history", icon: History },
      { name: "API & Developers", href: "/dashboard/developers", icon: Code2 },
    ]
  },
  {
    category: "Identity Verification",
    items: [
      { name: "NIN Verification", href: "/dashboard/nin-verification", icon: UserCheck },
      { name: "NIN Validation", href: "/dashboard/nin-validation", icon: Search },
      { name: "VNIN Slip", href: "/dashboard/vnin-slip", icon: FileBadge },
      { name: "NIN Personalization", href: "/dashboard/nin-personalization", icon: Users },
      { name: "NIN Modification", href: "/dashboard/nin-modification", icon: FileCog },
      { name: "Slip Generation", href: "/dashboard/nin-slip", icon: FileText },
      { name: "IPE Clearance", href: "/dashboard/ipe-clearance", icon: ShieldCheck },
    ]
  },
  {
    category: "Banking & BVN",
    items: [
      { name: "BVN Verification", href: "/dashboard/bvn-verification", icon: ShieldCheck },
      { name: "VNIN to NIBSS", href: "/dashboard/vnin-to-nibss", icon: RefreshCcw },
      { name: "BVN User", href: "/dashboard/bvn-enrollment", icon: UserCheck },
      { name: "BVN Modification", href: "/dashboard/bvn-modification", icon: FileCog },
      { name: "Premium Slip", href: "/dashboard/bvn-slip", icon: FileBadge },
      { name: "BVN Retrieval", href: "/dashboard/bvn-retrieval", icon: Search },
    ]
  },
  {
    category: "Corporate Filings",
    items: [
      { name: "CAC Registration", href: "/dashboard/cac-registration", icon: Building2 },
      { name: "Tax ID Services", href: "/dashboard/tax-id", icon: CreditCard },
    ]
  },
  {
    category: "Education",
    items: [
      { name: "JAMB Services", href: "/dashboard/jamb", icon: GraduationCap },
      { name: "Exam Pins", href: "/dashboard/exam-pins", icon: FileBadge },
    ]
  },
  {
    category: "Utilities & Bills",
    items: [
      { name: "Airtime Top-up", href: "/dashboard/airtime", icon: Smartphone },
      { name: "Data Bundles", href: "/dashboard/data", icon: Wifi },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 z-[60] px-4 h-16 flex items-center justify-between shadow-sm transition-colors duration-300">
        
        {/* LEFT SIDE: Hamburger + Logo */}
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-500 tracking-tight">AgentHub</span>
        </div>
        
        {/* RIGHT SIDE: User Avatar */}
        <div className="h-8 w-8 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
           U
        </div>
      </div>

      {/* SIDEBAR NAVIGATION (Drawer) */}
      <aside className={`fixed top-0 left-0 z-[50] h-screen w-64 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 lg:pt-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Desktop Logo Area */}
          <div className="hidden lg:flex items-center px-6 h-20 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm z-10">
            <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-500">AgentHub</h1>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-8">
            {menuItems.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  {section.category}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setIsOpen(false)} 
                        className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <item.icon className={`mr-3 h-[18px] w-[18px] transition-colors ${
                          isActive 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer / Sign Out */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-[45] lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
