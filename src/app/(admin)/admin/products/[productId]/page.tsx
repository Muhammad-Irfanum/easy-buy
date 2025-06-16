"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  ShoppingBagIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ScaleIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import DeleteConfirmation from "@/components/admin/modals/DeleteConfirmation";
import toast from "react-hot-toast";
import { Product } from "@/lib/types/product";

import { cn } from "@/lib/utils";
import {
  deleteProduct,
  getProductById,
} from "@/lib/firebase/services/productService";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    try {
      setDeletingProduct(true);
      await deleteProduct(productId);

      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting product:", error);
        toast.error(error.message || "Failed to delete product");
      }
    } finally {
      setDeletingProduct(false);
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Product not found
        </h3>
        <div className="mt-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  const statusBadgeClass = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    draft:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  }[product.status];

  // Find the default image or use the first image
  // const defaultImage = product.images.find(img => img.isDefault) ||
  //                    (product.images.length > 0 ? product.images[0] : null);

  // Sort images with default first
  const sortedImages = [...product.images].sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/products"
            className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Details
          </h1>
        </div>

        <div className="flex space-x-3">
          <Link
            href={`/admin/products/${productId}/edit`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
        {/* Product Images */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 w-full">
              <div className="w-full h-80 overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={sortedImages[activeImageIndex].url}
                    alt={product.title}
                    className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 text-gray-400">
                    <TagIcon className="h-16 w-16" />
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-2">
                  {sortedImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "aspect-w-1 aspect-h-1 overflow-hidden rounded border-2",
                        activeImageIndex === index
                          ? "border-blue-500 dark:border-blue-400"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Options & Variants */}
          {(product.options.length > 0 || product.variants.length > 0) && (
            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Options & Variants
                </h3>
              </div>

              {product.options.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Product Options
                  </h4>
                  <div className="space-y-2">
                    {product.options.map((option) => (
                      <div
                        key={option.id}
                        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md"
                      >
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {option.name}
                        </h5>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {Array.isArray(option.values)
                            ? option.values.map(
                                (value: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    {value}
                                  </span>
                                )
                              )
                            : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.length > 0 && (
                <div className="px-4 py-3">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Product Variants
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Variant
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            SKU
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {product.variants.map((variant) => (
                          <tr key={variant.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {variant.title}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              ${variant.price.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {variant.sku || "-"}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {variant.inventoryQuantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2 mt-6 lg:mt-0">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {product.title}
                </h3>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                      statusBadgeClass
                    )}
                  >
                    {product.status.charAt(0).toUpperCase() +
                      product.status.slice(1)}
                  </span>

                  {product.featured && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
              <dl>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                    Price
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium sm:mt-0 sm:col-span-2">
                    ${product.price.toFixed(2)}
                    {product.compareAtPrice && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </dd>
                </div>

                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                    Inventory
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {product.trackInventory ? (
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            product.inventoryQuantity > 10
                              ? "text-green-600 dark:text-green-400"
                              : product.inventoryQuantity > 0
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {product.inventoryQuantity} in stock
                        </span>
                      </div>
                    ) : (
                      <span>Inventory not tracked</span>
                    )}
                  </dd>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <QrCodeIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                    SKU / Barcode
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    <div>SKU: {product.sku || "Not set"}</div>
                    {product.barcode && (
                      <div className="mt-1">Barcode: {product.barcode}</div>
                    )}
                  </dd>
                </div>

                {(product.categoryName || product.brandName) && (
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                      Category / Brand
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {product.categoryName && (
                        <div>Category: {product.categoryName}</div>
                      )}
                      {product.brandName && (
                        <div className={product.categoryName ? "mt-1" : ""}>
                          Brand: {product.brandName}
                        </div>
                      )}
                    </dd>
                  </div>
                )}

                {product.weight && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <ScaleIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                      Weight / Dimensions
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {product.weight && (
                        <div>
                          Weight: {product.weight} {product.weightUnit}
                        </div>
                      )}
                      {product.dimensions && (
                        <div className={product.weight ? "mt-1" : ""}>
                          Dimensions: {product.dimensions.length} ×{" "}
                          {product.dimensions.width} ×{" "}
                          {product.dimensions.height} {product.dimensions.unit}
                        </div>
                      )}
                    </dd>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                    Created / Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {product.createdAt && (
                      <div>
                        Created: {new Date(product.createdAt).toLocaleString()}
                      </div>
                    )}
                    {product.updatedAt && (
                      <div className="mt-1">
                        Updated: {new Date(product.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Description
              </h4>
              <div className="text-sm text-gray-900 dark:text-white">
                {product.description ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Specifications
                </h3>
              </div>

              <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                  {product.specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {spec.name}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Tags
                </h3>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEO Information */}
          {(product.metaTitle ||
            product.metaDescription ||
            product.metaKeywords) && (
            <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  SEO Information
                </h3>
              </div>

              <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                  {product.metaTitle && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Meta Title
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {product.metaTitle}
                      </dd>
                    </div>
                  )}

                  {product.metaDescription && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Meta Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {product.metaDescription}
                      </dd>
                    </div>
                  )}

                  {product.metaKeywords && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Meta Keywords
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {product.metaKeywords}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.title}"? This action cannot be undone.`}
        isLoading={deletingProduct}
      />
    </div>
  );
}
