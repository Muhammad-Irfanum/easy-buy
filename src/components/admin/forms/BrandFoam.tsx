'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SwitchField } from '@/components/ui/SwitchField';
import toast from 'react-hot-toast';
import { Brand } from '@/lib/types/brand';
import { createBrand, updateBrand } from '@/lib/firebase/brands/brandService';

interface BrandFormProps {
  initialData?: Brand;
  isEditing?: boolean;
}

export default function BrandForm({
  initialData,
  isEditing = false,
}: BrandFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Brand>({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    website: '',
    isActive: true,
    featured: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Initialize form with initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    }
  }, [isEditing, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Generate slug from name if name field is changed and we're not in edit mode
    if (name === 'name' && !isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isEditing && initialData?.id) {
        // Update existing brand
        await updateBrand(initialData.id, formData);
        toast.success('Brand updated successfully');
      } else {
        // Create new brand
        await createBrand(formData);
        toast.success('Brand created successfully');
      }
      
      // Redirect to brands page
      router.push('/admin/brands');
    } catch (error:unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to save brand. Please try again.');
      } 

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Brand Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly version of the name. Auto-generated but can be edited.
              </p>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="logoUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Logo URL <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="logoUrl"
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  placeholder="https://i.ibb.co/..."
                  required
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>1. Upload your logo to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ImageBB</a> first</p>
                <p>2. Copy the direct link and paste it here</p>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo Preview
              </label>
              {formData.logoUrl ? (
                <div className="relative h-40 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <img
                    src={formData.logoUrl}
                    alt="Brand logo preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </div>
              ) : (
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No logo URL provided</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Website URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="website"
                  id="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex flex-col space-y-4">
              <div>
                <SwitchField
                  label="Active Status"
                  description="Set whether this brand is active and visible to customers"
                  checked={formData.isActive}
                  onChange={(checked) => handleSwitchChange('isActive', checked)}
                />
              </div>
              
              <div>
                <SwitchField
                  label="Featured Brand"
                  description="Set whether this brand should be highlighted on the storefront"
                  checked={formData.featured}
                  onChange={(checked) => handleSwitchChange('featured', checked)}
                />
              </div>
            </div>

            <div className="sm:col-span-6 border-t border-gray-200 dark:border-gray-700 pt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                SEO Settings (Optional)
              </h3>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Meta Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Meta Description
              </label>
              <div className="mt-1">
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={2}
                  value={formData.metaDescription || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => router.push('/admin/brands')}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Brand'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}