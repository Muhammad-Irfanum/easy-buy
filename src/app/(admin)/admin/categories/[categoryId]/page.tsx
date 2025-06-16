"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import DeleteConfirmation from "@/components/admin/modals/DeleteConfirmation";
import toast from "react-hot-toast";
import { Category } from "@/lib/types/category";
import {
  deleteCategory,
  getCategoryById,
} from "@/lib/firebase/services/categoryService";

export default function CategoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<boolean>(false);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(categoryId);
        setCategory(data);
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Failed to load category details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleDelete = async () => {
    try {
      setDeletingCategory(true);
      await deleteCategory(categoryId);

      toast.success("Category deleted successfully");
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "Failed to delete category. Please try again."
          : "Failed to delete category. Please try again."
      );
    } finally {
      setDeletingCategory(false);
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Category not found
        </h3>
        <div className="mt-4">
          <Link
            href="/admin/categories"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Categories
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
            href="/admin/categories"
            className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Category Details
          </h1>
        </div>

        <div className="flex space-x-3">
          <Link
            href={`/admin/categories/${categoryId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilSquareIcon
              className="mr-2 -ml-1 h-5 w-5"
              aria-hidden="true"
            />
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

      {/* Category details */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Image */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Image
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
            {category.imageUrl ? (
              <div className="relative h-48 max-w-xs rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-image.png";
                  }}
                />
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                No image available
              </span>
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
                {category.slug}
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {category.description || "No description"}
              </dd>
            </div>
            {category.parentName && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Parent Category
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <Link
                    href={`/admin/categories/${category.parentId}`}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {category.parentName}
                  </Link>
                </dd>
              </div>
            )}
            <div
              className={`${
                category.parentName
                  ? "bg-gray-50 dark:bg-gray-700/50"
                  : "bg-white dark:bg-gray-800"
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Products Count
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {category.productCount || 0}
              </dd>
            </div>
            <div
              className={`${
                category.parentName
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-700/50"
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {category.createdAt
                  ? new Date(category.createdAt).toLocaleString()
                  : "Unknown"}
              </dd>
            </div>
            <div
              className={`${
                category.parentName
                  ? "bg-gray-50 dark:bg-gray-700/50"
                  : "bg-white dark:bg-gray-800"
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {category.updatedAt
                  ? new Date(category.updatedAt).toLocaleString()
                  : "Unknown"}
              </dd>
            </div>
          </dl>
        </div>

        {/* SEO Information */}
        {(category.metaTitle || category.metaDescription) && (
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              SEO Information
            </h4>
            <dl className="space-y-4">
              {category.metaTitle && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Meta Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {category.metaTitle}
                  </dd>
                </div>
              )}
              {category.metaDescription && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Meta Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {category.metaDescription}
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
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This action cannot be undone and will affect all products in this category.`}
        isLoading={deletingCategory}
      />
    </div>
  );
}
