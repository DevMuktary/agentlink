'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Code2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Smartphone,
  Wifi,
  FileBadge,
  UserCheck,
  Building2,
  GraduationCap,
  FileText,
  FileDigit,
  CreditCard
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
    category: "Identity Services",
    items: [
      { name: "NIN Verification", href: "/dashboard/services/nin-verification", icon: UserCheck },
      { name: "VNIN Slip", href: "/dashboard/services/vnin", icon: FileText }, // The page we just built
      { name: "VNIN to NIBSS", href: "/dashboard/services/vnin-nibss", icon: FileDigit }, // New Placeholder
      { name: "NIN Validation", href: "/dashboard/services/nin-validation", icon: FileBadge },
      { name: "BVN Services", href: "/dashboard/services/bvn", icon: UserCheck },
    ]
  },
  {
    category: "Utility & Bills",
    items: [
      { name: "Airtime & Data", href: "/dashboard/services/utilities", icon: Wifi },
    ]
  },
  {
    category: "Corporate & Govt",
    items: [
      { name: "CAC Registration", href: "/dashboard/services/cac", icon: Building2 },
      { name: "TIN Registration", href: "/dashboard/services/tin", icon: Building2 },
    ]
  },
  {
    category: "Education",
    items: [
      { name: "Exam Pins", href: "/dashboard/services/education", icon: GraduationCap },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 z-50 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">AgentLink</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
          {isOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        lg:translate-x-0 pt-20 lg:pt-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Logo Area (Desktop) */}
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-gray-800">
            <h1 className="text-2xl font-bold tracking-wider">AgentLink</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-8">
            {menuItems.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                        className={`
                          flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors
                          ${isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                        `}
                      >
                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-800">
            <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:bg-gray-800 rounded-md transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
