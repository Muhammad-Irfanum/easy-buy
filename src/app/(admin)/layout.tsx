'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import AdminSidebar from '@/components/dashboard/layout/DashboardSidebar';
import AdminHeader from '@/components/dashboard/layout/DashboardHeader';


import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!loading && !user) {
      // Save the current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
    
    // If authentication check is complete and user is not an admin
    // if (!loading && !adminLoading && user && !isAdmin) {
    //   toast.error('Access denied. Only administrators can access this area.');
    //   router.push('/');
    // }
  }, [user, loading, isAdmin, adminLoading, router, pathname]);

  // Show loading state while checking auth and admin status
  if (loading || adminLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Checking access permissions...</p>
      </div>
    );
  }

  // Don't render content until auth and admin status are checked
  // if (!user || !isAdmin) return null;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin header */}
        <AdminHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}