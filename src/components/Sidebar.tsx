'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Wallet, Code2, LogOut, Menu, X,
  ShieldCheck, UserCheck, 
  Wifi, Building2, GraduationCap, Users, FileCog, 
  Smartphone, Search, Zap, FileDigit, FileBadge, CreditCard,
  ArrowRightLeft, FileText
} from 'lucide-react';
import { useState } from 'react';

// --- MENU DEFINITION ---
const menuItems = [
  {
    category: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Wallet & Finance", href: "/dashboard/wallet", icon: Wallet },
      { name: "API & Developers", href: "/dashboard/developers", icon: Code2 },
    ]
  },
  {
    category: "Identity (NIN)",
    items: [
      { name: "NIN Verification", href: "/dashboard/services/nin-verification", icon: UserCheck },
      { name: "NIN Slips History", href: "/dashboard/services/nin-slips", icon: FileText },
      { name: "IPE Clearance", href: "/dashboard/services/nin/ipe-clearance", icon: ShieldCheck },
      { name: "NIN Validation", href: "/dashboard/services/nin/validation", icon: FileBadge },
      { name: "NIN Personalization", href: "/dashboard/services/nin/personalization", icon: Users },
      { name: "NIN Modification", href: "/dashboard/services/nin/modification", icon: FileCog },
      { name: "VNIN Slip", href: "/dashboard/services/vnin", icon: FileDigit },
    ]
  },
  {
    category: "Identity (BVN)",
    items: [
      { name: "BVN Verification", href: "/dashboard/services/bvn/verification", icon: UserCheck },
      { name: "VNIN to NIBSS", href: "/dashboard/services/bvn/vnin-to-nibss", icon: ArrowRightLeft },
      { name: "BVN Premium Slip", href: "/dashboard/services/bvn/premium-slip", icon: FileBadge },
      { name: "BVN Retrieval", href: "/dashboard/services/bvn/retrieval", icon: Search },
      { name: "BVN Modification", href: "/dashboard/services/bvn/modification", icon: FileCog },
      { name: "Android Enrollment", href: "/dashboard/services/bvn/enrollment", icon: Smartphone },
    ]
  },
  {
    category: "Education",
    items: [
      { name: "Exam Pins", href: "/dashboard/services/education/exam-pins", icon: FileText },
      { name: "JAMB Services", href: "/dashboard/services/education/jamb", icon: GraduationCap },
    ]
  },
  {
    category: "Utilities",
    items: [
      { name: "Airtime Top-up", href: "/dashboard/services/utilities", icon: Wifi },
      { name: "Data Bundles", href: "/dashboard/services/utilities/data", icon: Zap },
    ]
  },
  {
    category: "Corporate",
    items: [
      { name: "CAC Registration", href: "/dashboard/services/cac", icon: Building2 },
      { name: "Tax ID Services", href: "/dashboard/services/tax-id", icon: CreditCard },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-[60] px-4 h-16 flex items-center justify-between shadow-sm">
        
        {/* LEFT SIDE: Hamburger + Logo */}
        <div className="flex items-center gap-3">
           {/* Hamburger Toggle (First) */}
           <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {/* Logo (Second) */}
          <span className="font-bold text-lg text-blue-700 tracking-tight">AgentLink</span>
        </div>
        
        {/* RIGHT SIDE: User Avatar */}
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-200">
           U
        </div>
      </div>

      {/* SIDEBAR NAVIGATION (Drawer) */}
      <aside className={`fixed top-0 left-0 z-[50] h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 lg:pt-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Desktop Logo Area (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-gray-800 bg-slate-950 sticky top-0 z-10">
            <h1 className="text-xl font-bold tracking-wider text-blue-400">AgentLink</h1>
          </div>
          
          {/* Navigation Links */}
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
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

          {/* Footer / Sign Out */}
          <div className="p-4 border-t border-gray-800 bg-slate-950">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
              <LogOut className="mr-3 h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Overlay (Click to close) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[45] lg:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
