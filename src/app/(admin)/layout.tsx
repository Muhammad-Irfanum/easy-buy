'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import DashboardSidebar from '@/components/dashboard/layout/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/layout/DashboardHeader';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated and has admin role
  // For now, we'll just check if they're authenticated
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
    
    // Here you would also check if the user has admin privileges
    // if (!loading && user && !user.isAdmin) {
    //   router.push('/'); // Redirect non-admin users
    // }
  }, [user, loading, router, pathname]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render content until auth is checked
  if (!user) return null;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard header */}
        <DashboardHeader />

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