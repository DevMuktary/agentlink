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
  
  // Detect if we are currently on the Admin Login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // 1. If we are on the Login Page, do not run checks. Just show the page.
    if (isLoginPage) {
        setAuthorized(true);
        return;
    }

    // 2. Otherwise, check if the user is a valid Admin
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/user/me');
        
        // Strict Role Check
        if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
          setAuthorized(true); // User is an Admin, allow access
        } else {
          // User is logged in but is NOT an Admin (e.g. regular Agent)
          // Kick them back to the User Dashboard
          router.replace('/dashboard'); 
        }
      } catch (error) {
        // User is NOT logged in (401 Unauthorized)
        // Force them to the Admin Login page
        router.replace('/admin/login');
      }
    };
    
    checkAuth();
  }, [router, isLoginPage]);

  // If on a protected page and not yet authorized, show the loader
  if (!authorized && !isLoginPage) return <GlobalLoader />;

  // --- RENDER LOGIC ---

  // SCENARIO A: Admin Login Page (No Sidebar, Full Screen, Dark Background)
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
