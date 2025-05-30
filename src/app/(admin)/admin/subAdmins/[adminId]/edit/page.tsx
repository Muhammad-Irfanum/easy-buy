'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminForm from '@/components/admin/forms/AdminForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminUser } from '@/lib/types/admin';

import { useAdmin } from '@/hooks/useAdmin';
import { getAdminUserById } from '@/lib/firebase/admin/adminUserService';

export default function EditAdminUserPage() {
  const params = useParams();

  const { adminRole } = useAdmin();
  const adminId = params.adminId as string;

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is super-admin
  const isSuperAdmin = adminRole?.role === 'super-admin';

  // Fetch admin data from Firestore
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!isSuperAdmin) {
        // Only super-admins can edit admin details
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getAdminUserById(adminId);
        setAdminUser(data);
      } catch (error) {
        console.error('Error fetching admin user:', error);
        toast.error('Failed to load admin user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUser();
  }, [adminId, isSuperAdmin]);

  // Access denied if not super-admin
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <p className="font-medium">Access Restricted</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don&apos;t have permission to edit admin users. This area is restricted to Super Administrators.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin user not found</h3>
        <div className="mt-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Admin Users
          </Link>
        </div>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Admin User</h1>
      </div>

      <AdminForm initialData={adminUser} isEditing={true} />
    </div>
  );
}