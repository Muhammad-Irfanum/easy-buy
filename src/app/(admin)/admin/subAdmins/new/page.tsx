'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminForm from '@/components/admin/forms/AdminForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';

export default function CreateAdminUserPage() {
  const router = useRouter();
  const { adminRole } = useAdmin();
  
  // Check if user is super-admin
  const isSuperAdmin = adminRole?.role === 'super-admin';
  
  // Redirect if not super-admin
  useEffect(() => {
    if (adminRole && !isSuperAdmin) {
      router.push('/admin/dashboard');
    }
  }, [adminRole, isSuperAdmin, router]);

  // Show nothing while checking permissions
  if (!adminRole) {
    return null;
  }
  
  // Access denied if not super-admin
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <p className="font-medium">Access Restricted</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don&apos;t have permission to manage admin users. This area is restricted to Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/users"
          className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Admin User</h1>
      </div>

      <AdminForm />
    </div>
  );
}