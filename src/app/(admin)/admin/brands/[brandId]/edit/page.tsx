'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Brand } from '@/lib/types/brand';
import { getBrandById } from '@/lib/firebase/brands/brandService';
import BrandForm from '@/components/admin/forms/BrandFoam';


export default function EditBrandPage() {
  const params = useParams();

  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch brand data from Firestore
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const data = await getBrandById(brandId);
        setBrand(data);
      } catch (error) {
        console.error('Error fetching brand:', error);
        toast.error('Failed to load brand. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [brandId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Brand not found</h3>
        <div className="mt-4">
          <Link
            href="/admin/brands"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/brands"
          className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Brand</h1>
      </div>

      <BrandForm initialData={brand} isEditing={true} />
    </div>
  );
}