'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import GlobalLoader from '@/components/GlobalLoader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Track the current URL
  const [authorized, setAuthorized] = useState(false);
  
  // Detect if we are on the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // 1. If on Login Page, SKIP the check (Allow access)
    if (isLoginPage) {
        setAuthorized(true);
        return;
    }

    // 2. Otherwise, perform strict Admin Check
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/user/me');
        
        // Only allow ADMIN or SUPER_ADMIN
        if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
          setAuthorized(true);
        } else {
          // If a regular user tries to access /admin, send them to user dashboard
          router.replace('/dashboard'); 
        }
      } catch (error) {
        // If not logged in at all, force them to Admin Login
        router.replace('/admin/login');
      }
    };
    
    checkAuth();
  }, [router, isLoginPage]);

  // Show loader while checking (unless it's login page which renders immediately)
  if (!authorized) return <GlobalLoader />;

  // --- RENDER LOGIC ---

  // SCENARIO A: Admin Login Page (No Sidebar, Full Screen)
  if (isLoginPage) {
      return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  // SCENARIO B: Protected Admin Dashboard (With Sidebar)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
