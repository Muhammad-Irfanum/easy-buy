'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {SwitchField} from '@/components/ui/SwitchField';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  initialData?: Category;
  isEditing?: boolean;
}

interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

// Mock parent categories for select input
const parentCategoryOptions = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Home & Kitchen' },
  { id: '4', name: 'Sports & Outdoors' },
];

export default function CategoryForm({
  initialData,
  isEditing = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    parentId: null,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (isEditing) {
        // Update category
        toast.success('Category updated successfully');
      } else {
        // Create category
        toast.success('Category created successfully');
      }
      
      // Redirect to categories page
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fex flex-col space-y-6 p-4'>
      <h1 className='text-center '>Create Category</h1> 
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 "
              >
                Category Name <span className="text-red-500">*</span>  
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly version of the name. Auto-generated but can be edited.
              </p>
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Parent Category (Optional)
              </label>
              <div className="mt-1">
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                >
                  <option value="">None (Top Level Category)</option>
                  {parentCategoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="h-10 flex items-center">
                <SwitchField
                  label="Active Status"
                  description="Set whether this category is active and visible to customers"
                  checked={formData.isActive}
                  onChange={(checked) => handleSwitchChange('isActive', checked)}
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => router.push('/admin/categories')}
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
              isEditing ? 'Save Changes' : 'Create Category'
            )}
          </button>
        </div>
      </div>
    </form>
    </div>
  );
}