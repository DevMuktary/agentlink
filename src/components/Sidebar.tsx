'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Wallet, Code2, LogOut, Menu, X,
  ShieldCheck, FileText, FileDigit, FileBadge, UserCheck, 
  Wifi, Building2, GraduationCap, Users, FileCog, 
  Smartphone, Search, Zap, BookOpen
} from 'lucide-react';
import { useState } from 'react';

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
      { name: "NIN Modification", href: "/dashboard/services/nin/modification", icon: FileCog }, // NEW
      { name: "VNIN Slip", href: "/dashboard/services/vnin", icon: FileBadge },
    ]
  },
  {
    category: "Identity (BVN)",
    items: [
      { name: "BVN Verification", href: "/dashboard/services/bvn/verification", icon: UserCheck },
      { name: "BVN Retrieval", href: "/dashboard/services/bvn/retrieval", icon: Search }, // NEW
      { name: "BVN Modification", href: "/dashboard/services/bvn/modification", icon: FileCog }, // NEW
      { name: "VNIN to NIBSS", href: "/dashboard/services/bvn/vnin-to-nibss", icon: FileDigit },
      { name: "Android BVN Enrollment", href: "/dashboard/services/bvn/enrollment", icon: Smartphone }, // NEW
    ]
  },
  {
    category: "Education & Exams",
    items: [
      { name: "Exam Pins (WAEC/NECO)", href: "/dashboard/services/education/exam-pins", icon: FileText }, // NEW
      { name: "JAMB Services", href: "/dashboard/services/education/jamb", icon: GraduationCap }, // NEW
    ]
  },
  {
    category: "Utilities",
    items: [
      { name: "Airtime & Data", href: "/dashboard/services/utilities", icon: Wifi },
    ]
  },
  {
    category: "Corporate",
    items: [
      { name: "CAC Registration", href: "/dashboard/services/cac", icon: Building2 },
      { name: "JTB-TIN Registration", href: "/dashboard/services/tin", icon: Building2 },
      { name: "Fast Track JTB-TIN", href: "/dashboard/services/tin/fast-track", icon: Zap }, // NEW
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 z-50 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">AgentLink</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
          {isOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
        </button>
      </div>

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 lg:pt-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-gray-800">
            <h1 className="text-2xl font-bold tracking-wider">AgentLink</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-8">
            {menuItems.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{section.category}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:bg-gray-800 rounded-md transition-colors">
              <LogOut className="mr-3 h-5 w-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
