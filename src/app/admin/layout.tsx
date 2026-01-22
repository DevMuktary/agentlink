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
        const { data } = await axios.get('/api/user/me');
        if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
          setAuthorized(true);
        } else {
          router.replace('/dashboard'); 
        }
      } catch (error) {
        router.replace('/admin/login');
      }
    };
    checkAuth();
  }, [router, isLoginPage]);

  if (!authorized && !isLoginPage) return <GlobalLoader />;

  if (isLoginPage) {
      return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />
      
      {/* Main Content: 
          - pt-20: Push content down on mobile to clear header
          - lg:pl-64: Push content right on desktop
          - px-4: Ensure horizontal breathing room
      */}
      <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
