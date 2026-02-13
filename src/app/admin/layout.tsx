'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
        setAuthorized(true);
        return;
    }

    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/user/me');
        
        // FIX: Handle both response structures (Direct object OR nested in .data)
        const user = res.data.data || res.data; 

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          setAuthorized(true);
        } else {
          // Not an admin, send to user dashboard
          router.replace('/dashboard'); 
        }
      } catch (error) {
        // Not logged in at all, send to login
        router.replace('/admin/login');
      }
    };
    checkAuth();
  }, [router, isLoginPage]);

  if (!authorized && !isLoginPage) return <GlobalLoader />;

  // Login Page Wrapper
  if (isLoginPage) {
      return <div className="min-h-screen bg-slate-900 text-white">{children}</div>;
  }

  // MAIN ADMIN LAYOUT
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <AdminSidebar />
      
      <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen transition-all duration-300 flex flex-col">
        <div className="flex-1 w-full mx-auto px-4 md:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
          {children}
        </div>
      </main>
    </div>
  );
}
