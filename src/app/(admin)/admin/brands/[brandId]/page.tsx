'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  TrashIcon,
  TagIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import DeleteConfirmation from '@/components/admin/modals/DeleteConfirmation';
import toast from 'react-hot-toast';
import { Brand } from '@/lib/types/brand';
import { deleteBrand, getBrandById } from '@/lib/firebase/brands/brandService';


export default function BrandDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<boolean>(false);

  // Fetch brand data
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const data = await getBrandById(brandId);
        setBrand(data);
      } catch (error) {
        console.error('Error fetching brand:', error);
        toast.error('Failed to load brand details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [brandId]);

  const handleDelete = async () => {
    try {
      setDeletingBrand(true);
      await deleteBrand(brandId);
      
      toast.success('Brand deleted successfully');
      router.push('/admin/brands');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting brand:', error);
        toast.error(`Failed to delete brand: ${error.message}`);
      }
    } finally {
      setDeletingBrand(false);
      setDeleteModalOpen(false);
    }
  };

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
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/brands"
            className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/brands/${brandId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilSquareIcon className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {/* Brand details */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {brand.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                brand.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {brand.isActive ? 'Active' : 'Inactive'}
              </span>
              
              {brand.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Brand Logo */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Logo
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
            {brand.logoUrl ? (
              <div className="relative h-48 max-w-xs rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No logo available</span>
            )}
          </dd>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Slug
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {brand.slug}
              </dd>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Website
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {brand.website ? (
                  <a 
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {brand.website}
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Not available</span>
                )}
              </dd>
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {brand.description || 'No description'}
              </dd>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Products Count
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {brand.productsCount || 0}
              </dd>
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {brand.createdAt ? new Date(brand.createdAt).toLocaleString() : 'Unknown'}
              </dd>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {brand.updatedAt ? new Date(brand.updatedAt).toLocaleString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* SEO Information */}
        {(brand.metaTitle || brand.metaDescription) && (
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">SEO Information</h4>
            <dl className="space-y-4">
              {brand.metaTitle && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Meta Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {brand.metaTitle}
                  </dd>
                </div>
              )}
              {brand.metaDescription && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Meta Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {brand.metaDescription}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brand.name}"? This action cannot be undone and will affect all products associated with this brand.`}
        isLoading={deletingBrand}
      />
    </div>
  );
}