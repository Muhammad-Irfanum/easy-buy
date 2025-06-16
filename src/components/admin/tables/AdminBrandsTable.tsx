"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import DeleteConfirmation from "@/components/admin/modals/DeleteConfirmation";
import { Brand } from "@/lib/types/brand";
import { deleteBrand } from "@/lib/firebase/services/brandService";
import toast from "react-hot-toast";

interface AdminBrandsTableProps {
  isLoading?: boolean;
  brands: Brand[];
  canEdit?: boolean;
  canDelete?: boolean;
  onBrandDeleted?: (brandId: string) => void;
}

export default function AdminBrandsTable({
  isLoading = false,
  brands = [],
  canEdit = true,
  canDelete = true,
  onBrandDeleted,
}: AdminBrandsTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<boolean>(false);

  const handleDeleteClick = (brandId: string) => {
    setBrandToDelete(brandId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (brandToDelete) {
      try {
        setDeletingBrand(true);
        await deleteBrand(brandToDelete);

        // Call the callback to update the parent component state
        if (onBrandDeleted) {
          onBrandDeleted(brandToDelete);
        }

        toast.success("Brand deleted successfully");
        setDeleteModalOpen(false);
        setBrandToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Failed to delete brand: ${error.message}`);
        }
      } finally {
        setDeletingBrand(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-6 py-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                ></div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Brand
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Website
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Products
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Featured
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {brands.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                    >
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder-image.png";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <svg
                                  className="h-6 w-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {brand.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {brand.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                          >
                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {brand.productsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                            brand.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          )}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                            brand.featured
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          )}
                        >
                          {brand.featured ? "Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/brands/${brand.id}`}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <EyeIcon className="h-5 w-5" />
                            <span className="sr-only">View</span>
                          </Link>

                          {canEdit && (
                            <Link
                              href={`/admin/brands/${brand.id}/edit`}
                              className="text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(brand.id!)}
                              className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                              disabled={deletingBrand}
                            >
                              <TrashIcon className="h-5 w-5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && brands.length > 0 && (
          <nav
            className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{brands.length}</span> of{" "}
                <span className="font-medium">{brands.length}</span> brands
              </p>
            </div>
          </nav>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone and may affect associated products."
        isLoading={deletingBrand}
      />
    </>
  );
}
