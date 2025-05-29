'use client';


import CategoryForm from '@/components/admin/categories/CategoryFoam';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreateCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/categories"
          className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Category</h1>
      </div>

      <CategoryForm />
    </div>
  );
}