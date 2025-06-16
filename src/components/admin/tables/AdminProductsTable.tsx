"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import DeleteConfirmation from "@/components/admin/modals/DeleteConfirmation";
import { Product } from "@/lib/types/product";

import toast from "react-hot-toast";
import { deleteProduct } from "@/lib/firebase/services/productService";

interface AdminProductsTableProps {
  isLoading?: boolean;
  products: Product[];
  canEdit?: boolean;
  canDelete?: boolean;
  onProductDeleted?: (productId: string) => void;
  searchQuery?: string;
}

export default function AdminProductsTable({
  isLoading = false,
  products = [],
  canEdit = true,
  canDelete = true,
  onProductDeleted,
  searchQuery = "",
}: AdminProductsTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        setDeletingProduct(true);
        await deleteProduct(productToDelete);

        // Call the callback to update the parent component state
        if (onProductDeleted) {
          onProductDeleted(productToDelete);
        }

        toast.success("Product deleted successfully");
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Failed to delete product: ${error.message}`);
        }
      } finally {
        setDeletingProduct(false);
      }
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === "price") {
      return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortBy === "inventory") {
      return sortDirection === "asc"
        ? a.inventoryQuantity - b.inventoryQuantity
        : b.inventoryQuantity - a.inventoryQuantity;
    } else if (sortBy === "status") {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortBy === "updated") {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Product
                      {sortBy === "title" && (
                        <ArrowsUpDownIcon
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc"
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {sortBy === "price" && (
                        <ArrowsUpDownIcon
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc"
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("inventory")}
                  >
                    <div className="flex items-center">
                      Inventory
                      {sortBy === "inventory" && (
                        <ArrowsUpDownIcon
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc"
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === "status" && (
                        <ArrowsUpDownIcon
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc"
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("updated")}
                  >
                    <div className="flex items-center">
                      Updated
                      {sortBy === "updated" && (
                        <ArrowsUpDownIcon
                          className={`ml-1 h-4 w-4 ${
                            sortDirection === "asc"
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
                    >
                      {searchQuery
                        ? "No products found matching your search."
                        : "No products found."}
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={
                                  product.images.find((img) => img.isDefault)
                                    ?.url || product.images[0].url
                                }
                                alt={product.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder-image.png";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <TagIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              SKU: {product.sku || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </div>
                        {product.compareAtPrice && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            product.inventoryQuantity > 10
                              ? "text-green-600 dark:text-green-400"
                              : product.inventoryQuantity > 0
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {product.trackInventory
                            ? product.inventoryQuantity
                            : "Not tracked"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                            getStatusBadgeClass(product.status)
                          )}
                        >
                          {product.status === "active"
                            ? "Active"
                            : product.status === "draft"
                            ? "Draft"
                            : "Archived"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <EyeIcon className="h-5 w-5" />
                            <span className="sr-only">View</span>
                          </Link>

                          {canEdit && (
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(product.id!)}
                              className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                              disabled={deletingProduct}
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isLoading={deletingProduct}
      />
    </>
  );
}
