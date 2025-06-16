'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/forms/ProductForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';

export default function CreateProductPage() {
  const router = useRouter();
  const { adminRole, hasPermission } = useAdmin();
  
  // Check if user can create products
  const canCreateProducts = hasPermission('write');
  
  // Redirect if user doesn't have permission
  useEffect(() => {
    if (adminRole && !canCreateProducts) {
      router.push('/admin/products');
    }
  }, [adminRole, canCreateProducts, router]);

  // Show nothing while checking permissions
  // if (!adminRole) {
  //   return null;
  // }
  
  // Access denied if user can't create products
  // if (!canCreateProducts) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-64 text-center">
  //       <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
  //         <p className="font-medium">Access Restricted</p>
  //       </div>
  //       <p className="text-gray-600 dark:text-gray-400 max-w-md">
  //         You don&apos;t have permission to create products. Please contact an administrator.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/products"
          className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Product</h1>
      </div>

      <ProductForm />
    </div>
  );
}