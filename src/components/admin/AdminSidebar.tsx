'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileText, 
  ShieldAlert, Building2, GraduationCap, 
  Settings, LogOut, Menu, X, CreditCard,
  UserCheck, FileCog, Search, Smartphone, FileBadge
} from 'lucide-react';
import { useState } from 'react';

const adminMenu = [
  {
    category: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    ]
  },
  {
    category: "NIN Queues",
    items: [
      { name: "Validation", href: "/admin/requests/nin/validation", icon: UserCheck },
      { name: "Modification", href: "/admin/requests/nin/modification", icon: FileCog },
    ]
  },
  {
    category: "BVN Queues",
    items: [
      { name: "Modification", href: "/admin/requests/bvn/modification", icon: FileCog },
      { name: "Retrieval", href: "/admin/requests/bvn/retrieval", icon: Search },
      { name: "Enrollment", href: "/admin/requests/bvn/enrollment", icon: Smartphone },
      { name: "VNIN to NIBSS", href: "/admin/requests/bvn/vnin-nibss", icon: FileText },
    ]
  },
  {
    category: "Corporate & Edu",
    items: [
      { name: "CAC Reg", href: "/admin/requests/corporate/cac", icon: Building2 },
      { name: "Tax IDs", href: "/admin/requests/corporate/tax", icon: FileText },
      { name: "JAMB Services", href: "/admin/requests/education/jamb", icon: GraduationCap },
    ]
  },
  {
    category: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 w-full bg-red-900 border-b border-red-800 z-50 px-4 py-3 flex items-center justify-between text-white">
        <span className="font-bold text-xl">Admin Panel</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md bg-red-800">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-red-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 lg:pt-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          <div className="hidden lg:flex items-center justify-center h-16 border-b border-red-900 bg-red-900">
            <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-8">
            {adminMenu.map((section, idx) => (
              <div key={idx}>
                <h3 className="px-2 text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">{section.category}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-red-800 text-white shadow-md' : 'text-red-100 hover:bg-red-900 hover:text-white'}`}>
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-red-900">
            <Link href="/dashboard" className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-300 hover:bg-red-900 rounded-md transition-colors mb-2">
               <LogOut className="mr-3 h-5 w-5" /> User View
            </Link>
          </div>
        </div>
      </aside>
      
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
